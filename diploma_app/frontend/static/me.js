document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
  
    if (!token) {
      window.location.href = "/login.html";
      return;
    }
  
    fetch("/api/user/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => {
        document.querySelector(".user-email").textContent = data.email;
        document.querySelector(".user-username").textContent = data.username;
        document.querySelector(".user-role").textContent = data.active_role;
      })
      .catch(() => {
        localStorage.removeItem("token");
        window.location.href = "/login.html";
      });
  
    document.querySelector(".logout-btn").addEventListener("click", () => {
      localStorage.removeItem("token");
      window.location.href = "/login.html";
    });
  
    document.querySelector(".toggle-role-btn").addEventListener("click", () => {
      fetch("/api/user/active-role", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then(() => window.location.reload());
    });
  });
  