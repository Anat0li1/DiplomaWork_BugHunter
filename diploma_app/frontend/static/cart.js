document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("access_token");
    if (!token) return (window.location.href = "/login.html");
  
    const cartItemsContainer = document.getElementById("cart-items");
    const backBtn = document.getElementById("back-btn");
    const clearCartBtn = document.getElementById("clear-cart-btn");
  
    backBtn.addEventListener("click", () => window.location.href = "/shop.html");
  
    clearCartBtn.addEventListener("click", async () => {
      const res = await fetch("/cart", {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        loadCart();
      } else {
        alert("Failed to clear cart");
      }
    });
  
    async function loadCart() {
      cartItemsContainer.innerHTML = "";
      const res = await fetch("/cart", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
  
      if (!data.cart || data.cart.length === 0) {
        cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
        return;
      }
  
      for (const item of data.cart) {
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
          <span>${item.product.name} - ${item.quantity}</span>
          <div class="cart-actions">
            <button class="qty-btn" data-id="${item.id}" data-action="increase">+</button>
            <button class="qty-btn" data-id="${item.id}" data-action="decrease">-</button>
            <button class="delete-btn" data-id="${item.id}">🗑️</button>
          </div>
        `;
        cartItemsContainer.appendChild(div);
      }
    }
  
    cartItemsContainer.addEventListener("click", async (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;
  
      const id = btn.dataset.id;
  
      if (btn.dataset.action === "increase" || btn.dataset.action === "decrease") {
        const delta = btn.dataset.action === "increase" ? 1 : -1;
        const qtySpan = btn.parentElement.previousElementSibling;
        const currentQty = parseInt(qtySpan.textContent.split(" - ")[1]);
        const newQty = Math.max(1, currentQty + delta);
  
        const res = await fetch(`/cart/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ quantity: newQty })
        });
  
        if (res.ok) {
          loadCart();
        }
      }
  
      if (btn.classList.contains("delete-btn")) {
        const res = await fetch(`/cart/${id}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
  
        if (res.ok) {
          loadCart();
        }
      }
    });
  
    loadCart();
  });
  