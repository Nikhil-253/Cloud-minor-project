document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission

    // Get email, username, and password
    var email = document.getElementById('email').value.trim(); // Trim whitespace
    var username = document.getElementById('username').value.trim(); // Trim whitespace
    var password = document.getElementById('password').value.trim(); // Trim whitespace

    // Basic client-side validation
    if (!email || !username || !password) {
        document.getElementById('login-message').textContent = 'Please fill in all fields.';
        return;
    }

    // Send login request to backend
    fetch('/login', {
        method: 'POST', // Change GET to POST
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email, username: username, password: password })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            window.location.href = `http://localhost:5050/home2?userid=${username}`; // Redirect to dashboard on successful login
        } else {
            document.getElementById('login-message').textContent = 'Invalid email, username, or password';
        }
    })
    .catch(error => {
        console.error('Error sagar:', error);
        document.getElementById('login-message').textContent = 'An error occurred. Please try again later.';
    });
});