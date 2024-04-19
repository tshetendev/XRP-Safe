# XRP-Safe App

XRP-Safe is a web application built on Node.js and Express framework that allows users to securely manage XRP (Ripple) transactions. With XRP-Safe, users can send XRP securely, view transaction history, check wallet balance, and ensure the safety of their XRP transactions.

## Features

- **Secure Authentication**: Users can securely log in to their XRP wallet using their wallet address and secret key.
- **Send XRP**: Users can send XRP securely to other wallet addresses within the XRPL network.
- **Transaction History**: Users can view their transaction history, including details such as transaction ID, sender, receiver, amount, and timestamp.
- **Wallet Balance**: Users can check their XRP wallet balance in real-time.

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/tshetendev/xrp-safe.git
    ```

2. Navigate to the project directory:

    ```bash
    cd xrp-safe
    ```

3. Install dependencies:

    ```bash
    npm install
    ```

4. Create a `.env` file in the root directory and set the following environment variables:

    ```plaintext
    PORT=3000
    MONGODB_URI=your_mongodb_connection_uri
    ```

5. Start the application:

    ```bash
    npm start
    ```

6. Access the application at `http://localhost:3000` in your web browser.

## Usage

1. **Login**: Enter your XRP wallet address and secret key to log in securely.
2. **Send XRP**: Navigate to the send XRP page and enter the recipient's wallet address and the amount of XRP to send.
3. **View Profile**: Access your profile page to view your wallet address and secret key.
4. **Transaction History**: View all your past transactions, including details like sender, receiver, amount, and timestamp.
5. **Check Balance**: Check your XRP wallet balance on the wallet balance page.

## Dependencies

- **Express**: Web application framework for Node.js.
- **Body-parser**: Middleware to parse incoming request bodies.
- **Xrpl**: JavaScript library for interacting with the XRPL (XRP Ledger).
- **Express-session**: Middleware for managing session data.
- **Mongoose**: MongoDB object modeling for Node.js.
- **dotenv**: Loads environment variables from a `.env` file.

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your improvements.

## License

This project is licensed under the [MIT License](LICENSE).

## Support

For any inquiries or support, please contact [your_email@example.com](mailto:tshetendev@gmail.com).
