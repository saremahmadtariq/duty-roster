document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("loginButton");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const errorMessage = document.getElementById("error-message");

    // Allow Enter key to submit
    passwordInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            loginButton.click();
        }
    });

    loginButton.addEventListener("click", () => {
        const password = passwordInput.value.trim();
        
        // Clear previous error
        errorMessage.textContent = "";
        
        if (password === "") {
            errorMessage.textContent = "Please enter a password.";
            return;
        }

        if (password === "Nokia108") {
            // Store login state
            sessionStorage.setItem("adminLoggedIn", "true");
            window.location.href = "admin.html";
        } else {
            errorMessage.textContent = "Invalid password. Please try again.";
            passwordInput.value = "";
            passwordInput.focus();
        }
    });
});
