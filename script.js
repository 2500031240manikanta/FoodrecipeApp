// Common JavaScript for the FoodRecipes home page

const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
const userName = document.getElementById("user-name");
const loginLink = document.getElementById("login-link");
const registerLink = document.getElementById("register-link");
const logoutLink = document.getElementById("logout-link");
const welcome = document.getElementById("welcome-message");
const userModuleLink = document.getElementById("user-module-link");
const adminModuleLink = document.getElementById("admin-module-link");

if (loggedInUser) {
    welcome.textContent = "Welcome, " + loggedInUser.name + "!";
    userName.textContent = loggedInUser.name;
    userName.hidden = false;
    loginLink.hidden = true;
    registerLink.hidden = true;
    logoutLink.hidden = false;

    if (loggedInUser.role === "admin") {
        adminModuleLink.hidden = false;
    } else {
        userModuleLink.hidden = false;
    }
}

logoutLink.addEventListener("click", function(event) {
    event.preventDefault();
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
});
