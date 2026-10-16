import { useMemo, useState } from "react";
import "./App.css";

// const API_BASE = "http://localhost:5000/api";
const API_BASE = "https://restaurant-management-system-1-r35u.onrender.com";

function App() {
  const [token, setToken] = useState("");
  const [role, setRole] = useState("");
  const [auth, setAuth] = useState({ name: "", email: "", password: "", isAdmin: false });
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [menu, setMenu] = useState([]);
  const [menuForm, setMenuForm] = useState({ name: "", description: "", price: "", category: "", isAvailable: true });
  const [editingId, setEditingId] = useState("");
  const [orderItems, setOrderItems] = useState({});
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState("Use this UI to test your backend APIs.");

  const authHeader = useMemo(() => ({ Authorization: `Bearer ${token}` }), [token]);

  const showError = async (res) => {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || "Request failed");
  };

  const register = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: auth.name,
        email: auth.email,
        password: auth.password,
        role: auth.isAdmin ? "admin" : "user",
      };

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) await showError(res);
      const data = await res.json();
      setToken(data.token);
      setRole(data.user.role);
      setMessage(`Registered as ${data.user.role}`);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      if (!res.ok) await showError(res);
      const data = await res.json();
      setToken(data.token);
      setRole(data.user.role);
      setMessage(`Logged in as ${data.user.role}`);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const loadMenu = async () => {
    try {
      const res = await fetch(`${API_BASE}/menu`);
      if (!res.ok) await showError(res);
      const data = await res.json();
      setMenu(data);
      setMessage("Menu loaded");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const saveMenuItem = async (e) => {
    e.preventDefault();
    if (!token) return setMessage("Login as admin first");

    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API_BASE}/menu/${editingId}` : `${API_BASE}/menu`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({
          ...menuForm,
          price: Number(menuForm.price),
        }),
      });

      if (!res.ok) await showError(res);
      setMenuForm({ name: "", description: "", price: "", category: "", isAvailable: true });
      setEditingId("");
      setMessage(editingId ? "Menu item updated" : "Menu item created");
      await loadMenu();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const editMenuItem = (item) => {
    setEditingId(item._id);
    setMenuForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      category: item.category || "",
      isAvailable: Boolean(item.isAvailable),
    });
  };

  const deleteMenuItem = async (id) => {
    if (!token) return setMessage("Login as admin first");
    try {
      const res = await fetch(`${API_BASE}/menu/${id}`, {
        method: "DELETE",
        headers: authHeader,
      });
      if (!res.ok) await showError(res);
      setMessage("Menu item deleted");
      await loadMenu();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const placeOrder = async () => {
    if (!token) return setMessage("Login as user first");

    const items = Object.entries(orderItems)
      .map(([menuItemId, quantity]) => ({ menuItemId, quantity: Number(quantity) }))
      .filter((item) => item.quantity > 0);

    if (items.length === 0) {
      return setMessage("Add quantity for at least one menu item");
    }

    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) await showError(res);
      setMessage("Order placed");
      setOrderItems({});
    } catch (error) {
      setMessage(error.message);
    }
  };

  const loadMyOrders = async () => {
    if (!token) return setMessage("Login first");
    try {
      const res = await fetch(`${API_BASE}/orders/my-orders`, { headers: authHeader });
      if (!res.ok) await showError(res);
      const data = await res.json();
      setOrders(data);
      setMessage("Orders loaded");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const logout = () => {
    setToken("");
    setRole("");
    setOrders([]);
    setMessage("Logged out");
  };

  return (
    <div className="container">
      <h1>Restaurant Frontend</h1>
      <p className="status">{message}</p>
      <p className="status">Current role: {role || "Guest"}</p>

      <section>
        <h2>Register</h2>
        <form onSubmit={register} className="grid">
          <input placeholder="Name" value={auth.name} onChange={(e) => setAuth({ ...auth, name: e.target.value })} required />
          <input placeholder="Email" type="email" value={auth.email} onChange={(e) => setAuth({ ...auth, email: e.target.value })} required />
          <input placeholder="Password" type="password" value={auth.password} onChange={(e) => setAuth({ ...auth, password: e.target.value })} required />
          <label>
            <input type="checkbox" checked={auth.isAdmin} onChange={(e) => setAuth({ ...auth, isAdmin: e.target.checked })} /> Register as admin
          </label>
          <button type="submit">Register</button>
        </form>
      </section>

      <section>
        <h2>Login</h2>
        <form onSubmit={login} className="grid">
          <input placeholder="Email" type="email" value={loginData.email} onChange={(e) => setLoginData({ ...loginData, email: e.target.value })} required />
          <input placeholder="Password" type="password" value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} required />
          <button type="submit">Login</button>
          <button type="button" onClick={logout}>Logout</button>
        </form>
      </section>

      <section>
        <h2>Menu</h2>
        <button onClick={loadMenu}>Load Menu</button>
        <div className="cards">
          {menu.map((item) => (
            <div key={item._id} className="card">
              <h3>{item.name}</h3>
              <p>{item.description}</p>
              <p>Price: {item.price}</p>
              <p>Category: {item.category}</p>
              <p>Status: {item.isAvailable ? "Available" : "Unavailable"}</p>

              {role === "admin" && (
                <div className="actions">
                  <button onClick={() => editMenuItem(item)}>Edit</button>
                  <button onClick={() => deleteMenuItem(item._id)}>Delete</button>
                </div>
              )}

              {role === "user" && (
                <input
                  type="number"
                  min="0"
                  placeholder="Qty"
                  value={orderItems[item._id] || ""}
                  onChange={(e) => setOrderItems({ ...orderItems, [item._id]: e.target.value })}
                />
              )}
            </div>
          ))}
        </div>
      </section>

      {role === "admin" && (
        <section>
          <h2>{editingId ? "Update Menu Item" : "Add Menu Item"}</h2>
          <form onSubmit={saveMenuItem} className="grid">
            <input placeholder="Name" value={menuForm.name} onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })} required />
            <input placeholder="Description" value={menuForm.description} onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })} required />
            <input placeholder="Price" type="number" min="0" value={menuForm.price} onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })} required />
            <input placeholder="Category" value={menuForm.category} onChange={(e) => setMenuForm({ ...menuForm, category: e.target.value })} />
            <label>
              <input type="checkbox" checked={menuForm.isAvailable} onChange={(e) => setMenuForm({ ...menuForm, isAvailable: e.target.checked })} /> Available
            </label>
            <button type="submit">{editingId ? "Update" : "Add"}</button>
          </form>
        </section>
      )}

      {role === "user" && (
        <section>
          <h2>Orders</h2>
          <button onClick={placeOrder}>Place Order</button>
          <button onClick={loadMyOrders}>Load My Orders</button>
          <div className="cards">
            {orders.map((order) => (
              <div key={order._id} className="card">
                <p>Order ID: {order._id}</p>
                <p>Status: {order.status}</p>
                <p>Total: {order.totalAmount}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
