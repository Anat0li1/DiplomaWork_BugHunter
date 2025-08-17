document.addEventListener("DOMContentLoaded", () => {
    const usernameDisplay = document.querySelector(".user-info");
    const userMenu = document.querySelector(".user-menu");
    const logoutLink = document.querySelector(".logout-link");
    const meLink = document.querySelector(".me-link");
    const shopTile = document.querySelector(".app-tile.shop");

    // Placeholder: Replace with real fetch if you store JWT in localStorage or cookies
    const username = localStorage.getItem("username") || "guest";

    usernameDisplay.textContent = `Logged in as ${username}`;

    usernameDisplay.addEventListener("click", () => {
        userMenu.classList.toggle("visible");
    });

    logoutLink.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("access_token");
        localStorage.removeItem("username");
        window.location.href = "/login.html";
    });

    meLink.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "/me.html";
    });

    shopTile.addEventListener("click", () => {
        window.location.href = "/shop.html";
    });

    document.addEventListener("click", (e) => {
        if (!usernameDisplay.contains(e.target) && !userMenu.contains(e.target)) {
            userMenu.classList.remove("visible");
        }
    });
});
