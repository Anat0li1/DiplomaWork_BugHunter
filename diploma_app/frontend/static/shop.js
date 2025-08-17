document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) return (window.location.href = "/login.html");
  
    const backBtn = document.getElementById("back-btn");
    const createShopBtn = document.getElementById("create-shop-btn");
    const shopForm = document.getElementById("shop-form");
    const shopView = document.getElementById("shop-view");
  
    const shopTitle = document.getElementById("shop-title");
    const shopDesc = document.getElementById("shop-description-text");
    const toggleRoleBtn = document.getElementById("toggle-role-btn");
    const currentRole = document.getElementById("current-role");
    const adminSection = document.querySelector(".admin-section");
    const userSection = document.querySelector(".user-section");
  
    const productList = document.getElementById("product-list");
    const userProductList = document.getElementById("user-product-list");
    const createProductBtn = document.getElementById("create-product-btn");
  
    backBtn.addEventListener("click", () => window.location.href = "/dashboard.html");
    createShopBtn.addEventListener("click", () => shopForm.classList.remove("hidden"));
  
    shopForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("shop-name").value;
      const description = document.getElementById("shop-description").value;
  
      const res = await fetch("/store", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, description })
      });
  
      if (res.ok) {
        loadShop();
      } else {
        alert("Failed to create shop.");
      }
    });
  
    toggleRoleBtn.addEventListener("click", async () => {
      const res = await fetch("/me/role/toggle", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        loadShop();
      }
    });
  
    createProductBtn.addEventListener("click", () => {
      window.location.href = "/create_product.html";
    });
  
    async function loadShop() {
      const res = await fetch("/store", {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      if (res.status === 404) {
        shopForm.classList.remove("hidden");
        shopView.classList.add("hidden");
        return;
      }
  
      const shop = await res.json();
      shopTitle.textContent = shop.name;
      shopDesc.textContent = shop.description;
  
      const meRes = await fetch("/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const me = await meRes.json();
      currentRole.textContent = `Role: ${me.active_role}`;
  
      if (me.active_role === "admin") {
        adminSection.classList.remove("hidden");
        userSection.classList.add("hidden");
        loadAdminProducts();
      } else {
        adminSection.classList.add("hidden");
        userSection.classList.remove("hidden");
        loadUserProducts();
      }
  
      shopForm.classList.add("hidden");
      shopView.classList.remove("hidden");
    }
  
    async function loadAdminProducts() {
      productList.innerHTML = "";
      const res = await fetch("/store/products", {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      if (!res.ok) return;
  
      const products = await res.json();
      products.forEach((p) => {
        const li = document.createElement("li");
        li.textContent = `${p.name} - $${p.price}`;
        productList.appendChild(li);
      });
    }
  
    async function loadUserProducts() {
      userProductList.innerHTML = "";
      const res = await fetch("/store/products", {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      if (!res.ok) return;
  
      const products = await res.json();
      products.forEach((p) => {
        const li = document.createElement("li");
        li.innerHTML = `
          <strong>${p.name}</strong> - ${p.description} ($${p.price})
          <button data-id="${p.id}" class="add-to-cart-btn">Add to Cart</button>
        `;
        userProductList.appendChild(li);
      });
  
      document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
        btn.addEventListener("click", async () => {
          const productId = btn.dataset.id;
          await fetch("/cart", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ product_id: productId, quantity: 1 })
          });
          alert("Added to cart");
        });
      });
    }
  
    loadShop();
  });
  