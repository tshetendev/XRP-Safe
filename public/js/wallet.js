document.addEventListener('DOMContentLoaded', async function () {
    const refreshButton = document.getElementById('refreshButton');
    const balanceDisplay = document.getElementById('balance');
    const errorMessage = document.getElementById('errorMessage');

    refreshButton.addEventListener('click', async function () {
        try {
            const response = await fetch('/wallet-balance');
            const data = await response.json();

            if (response.ok) {
                errorMessage.textContent = ''; // Clear any previous error messages
                balanceDisplay.textContent = `Balance: ${data.balance} XRP`;
            } else {
                errorMessage.textContent = data.error; // Show error message
            }
        } catch (error) {
            console.error('Error:', error);
            errorMessage.textContent = 'An error occurred. Please try again.'; // Show generic error message
        }
    });

    // Fetch balance on page load
    refreshButton.click();
});

let secretVisible = false;

// Fetch user profile data from the server
async function fetchUserProfile() {
    const response = await fetch('/profile', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();

    if (response.ok) {
        document.getElementById('walletAddress').innerText = data.walletAddress;
        document.getElementById('walletSecret').innerText = '********'; // Display stars initially
        document.getElementById('showSecretBtn').style.display = 'inline-block'; // Display the button initially
    } else {
        console.error('Failed to fetch user profile:', data.error);
    }
}

// Function to toggle visibility of the wallet secret
// Function to toggle visibility of the wallet secret
async function toggleSecretVisibility() {
    const secretSpan = document.getElementById('walletSecret');
    if (secretVisible) {
        secretSpan.innerText = '********'; // Hide the secret
        document.getElementById('showSecretBtn').innerText = 'Show Secret';
    } else {
        try {
            const response = await fetch('/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (response.ok) {
                secretSpan.innerText = data.walletSecret; // Display the real secret
                document.getElementById('showSecretBtn').innerText = 'Hide Secret';
            } else {
                console.error('Failed to fetch user profile:', data.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
    secretVisible = !secretVisible;
}

// Load user profile data when the page loads
window.addEventListener('load', fetchUserProfile);