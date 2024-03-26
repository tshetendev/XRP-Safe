const express = require('express');
const bodyParser = require('body-parser');
const { Wallet } = require('xrpl');
const xrpl = require('xrpl');
const session = require('express-session');
const mongoose = require('mongoose');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse request body
app.use(bodyParser.json());

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

// Middleware to set up session
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

const api = new xrpl.Client('wss://s.altnet.rippletest.net:51233', {
    connectionTimeout: 10000
});



mongoose.connect(process.env.MONGODB_URI, {
    bufferCommands: false, // Disable command buffering
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout for server selection
    socketTimeoutMS: 45000, // Timeout for socket connection
    connectTimeoutMS: 30000,
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

const transactionSchema = new mongoose.Schema({
    transactionId: { type: String, required: true },
    sender: { type: String, required: true },
    receiver: { type: String, required: true },
    amount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

// Create a model based on the schema
const Transaction = mongoose.model('Transaction', transactionSchema);

// Profile route
app.get('/profile', (req, res) => {
    // Check if user is logged in
    if (!req.session.user || !req.session.user.walletAddress || !req.session.user.walletSecret) {
        return res.status(401).json({ error: 'User not authenticated.' });
    }

    // Get wallet address and secret from session
    const { walletAddress, walletSecret } = req.session.user;

    // Send profile data as response
    res.json({
        walletAddress: walletAddress,
        walletSecret: walletSecret
    });
});

// Inside the /send-xrp endpoint handler
app.post('/send-xrp', async (req, res) => {
    try {
        // Extract necessary data from the request body
        const { amount, destination } = req.body;

        const { walletAddress, walletSecret } = req.session.user;

        // Connect to the XRPL
        await api.connect();

        // Initialize the wallet using the secret
        const wallet = xrpl.Wallet.fromSecret(walletSecret);

        // Prepare the transaction
        const prepared = await api.autofill({
            "TransactionType": "Payment",
            "Account": walletAddress,
            "Amount": xrpl.xrpToDrops(amount.toString()),
            "Destination": destination
        });

        // Sign the prepared transaction
        const signed = wallet.sign(prepared);

        // Submit the transaction and wait for the results
        const tx = await api.submitAndWait(signed.tx_blob);

        // Request balance changes caused by the transaction
        const balanceChanges = xrpl.getBalanceChanges(tx.result.meta);

        // Disconnect from the XRPL
        api.disconnect();

        // Store transaction details in the database
        const transaction = new Transaction({
            transactionId: tx.id,
            sender: walletAddress,
            receiver: destination,
            amount: amount
        });
        await transaction.save();

        // Respond with success message and balance changes
        res.json({ success: true, balanceChanges });
    } catch (error) {
        console.error("Error sending XRP:", error);
        res.status(500).json({ success: false, error: "Error sending XRP" });
    }
});

// Login route
app.post('/login', async (req, res) => {
    const { walletAddress, walletSecret } = req.body;

    // Validate wallet walletAddress and walletSecret (You might want to add more validations)
    if (!walletAddress || !walletSecret) {
        return res.status(400).json({ error: 'Wallet walletAddress and walletSecret are required.' });
    }

    // Validate the wallet address
    if (!isValidRippleAddress(walletAddress)) {
        return res.status(400).send('Invalid Ripple wallet address');
    }

    // Check authentication (You might want to implement your authentication logic here)
    const authenticationResult = await validateWalletSecret(walletAddress, walletSecret);
    if (authenticationResult === true) {
        // Store wallet address and secret in session
        req.session.user = {
            walletAddress: walletAddress,
            walletSecret: walletSecret
        };
        console.log(req.session.user);
        return res.json({ success: true, message: 'Login successful!' });
    } else {
        return res.status(401).json({ error: authenticationResult });
    }
});

// Route to get all transaction details for the wallet address stored in the session
app.get('/transactions', async (req, res) => {
    try {
        const walletAddress = req.session.user.walletAddress;

        // Find transactions where the sender or receiver matches the wallet address
        const transactions = await Transaction.find({
            $or: [
                { sender: walletAddress },
                { receiver: walletAddress }
            ]
        }).sort({ timestamp: -1 }); // Sort by timestamp in descending order

        res.json({ success: true, transactions });
    } catch (error) {
        console.error("Error fetching transactions:", error);
        res.status(500).json({ success: false, error: "Error fetching transactions" });
    }
});

// Route to fetch wallet balance
app.get('/wallet-balance', async (req, res) => {
    try {
        // Get wallet address from session
        const walletAddress = req.session.user.walletAddress;

        // Connect to XRPL
        await api.connect();

        // Get account info to fetch the balance
        const accountInfo = await api.request({
            command: 'account_info',
            account: walletAddress
        });

        // Close the connection to XRPL
        await api.disconnect();

        // Check if account info is retrieved successfully and has balance property
        if (accountInfo && accountInfo.result && accountInfo.result.account_data && accountInfo.result.account_data.Balance) {
            const balance = accountInfo.result.account_data.Balance;
            // Convert balance from drops to XRP (1 XRP = 1,000,000 drops)
            const xrpBalance = parseFloat(balance) / 1000000;
            res.json({ success: true, balance: xrpBalance });
        } else {
            console.error('Failed to retrieve wallet balance:', accountInfo);
            res.status(500).json({ success: false, error: 'Failed to fetch wallet balance' });
        }
    } catch (error) {
        console.error('Error fetching wallet balance:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch wallet balance' });
    }
});

// Function to validate if the provided wallet secret corresponds to the given wallet address
async function validateWalletSecret(walletAddress, walletSecret) {
    try {
        // Create a new wallet object from the provided wallet secret
        const wallet = Wallet.fromSeed(walletSecret);

        // Get the wallet address derived from the provided wallet secret
        const secretAddress = wallet.address;

        // Compare the provided wallet address and the wallet address derived from the wallet secret
        if (secretAddress === walletAddress) {
            return true; // Authentication successful
        } else {
            return 'Invalid wallet secret.'; // Authentication failed
        }
    } catch (error) {
        console.error(error);
        return 'Error validating wallet secret.'; // Error occurred during validation
    }
}

// Function to validate XRP wallet address
function isValidRippleAddress(address) {
    const rippleAddressRegex = /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/;
    return rippleAddressRegex.test(address);
}

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
