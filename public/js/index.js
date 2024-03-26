document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');

    loginForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const walletAddress = loginForm.walletAddress.value;
        const walletSecret = loginForm.walletSecret.value;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ walletAddress, walletSecret })
            });

            const data = await response.json();

            if (response.ok) {
                errorMessage.textContent = ''; // Clear any previous error messages
                // Show confirmation alert
                const confirmRedirect = confirm('Login successful! Do you want to proceed to your wallet?');
                if (confirmRedirect) {
                    // Redirect to wallet.html upon confirmation
                    window.location.href = '/wallet.html';
                }
            } else {
                errorMessage.textContent = data.error; // Show error message
            }
        } catch (error) {
            console.error('Error:', error);
            errorMessage.textContent = 'An error occurred. Please try again.'; // Show generic error message
        }
    });
});
