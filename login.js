document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.getElementById("loginButton");
    const emailInput = document.getElementById("email");
    const passwordInput = document.getElementById("password");
    const errorMessage = document.getElementById("error-message");

    loginButton.addEventListener("click", () => {
        const password = passwordInput.value;

        if (password === "Nokia108") {
            window.location.href = "admin.html";
        } else {
            errorMessage.textContent = "Invalid password.";
        }
    });
});
