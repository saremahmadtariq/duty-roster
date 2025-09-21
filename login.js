document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("loginButton");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const errorMessage = document.getElementById("error-message");

    loginButton.addEventListener("click", () => {
        const email = emailInput.value;
        const password = passwordInput.value;

        if (!email || !password) {
            errorMessage.textContent = "Please enter both email and password.";
            return;
        }

        window.firebaseSignIn(window.firebaseAuth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                console.log("User signed in: ", user);
                window.location.href = "admin.html";
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessageText = error.message;
                console.error("Sign in error: ", errorCode, errorMessageText);
                errorMessage.textContent = "Invalid email or password.";
            });
    });
});
