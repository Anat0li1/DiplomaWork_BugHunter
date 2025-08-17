document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("access_token");
    if (!token) return (window.location.href = "/login.html");
  
    const cancelBtn = document.getElementById("cancel-btn");
    const form = document.getElementById("product-form");
  
    cancelBtn.addEventListener("click", () => {
      window.location.href = "/shop.html";
    });
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const name = document.getElementById("product-name").value;
      const description = document.getElementById("product-description").value;
      const price = parseFloat(document.getElementById("product-price").value);
      const quantity = parseInt(document.getElementById("product-quantity").value);
  
      const res = await fetch("/store/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, description, price, quantity })
      });
  
      if (res.ok) {
        window.location.href = "/shop.html";
      } else {
        const data = await res.json();
        alert(data.message || "Failed to create product");
      }
    });
  });
  