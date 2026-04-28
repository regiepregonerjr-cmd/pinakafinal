import express from "express";
import { existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

const roundMoney = (value) => Math.round(Number(value) * 100) / 100;

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// UML Class: User
class User {
  constructor(username, password, role) {
    this.username = username;
    this.password = password;
    this.role = role;
  }
  login(password) { return this.password === password; }
  toJSON() { return { username: this.username, role: this.role }; }
}

// UML Class: Product
class Product {
  constructor(productID, name, price, stockQty, image, category, description, gradient) {
    this.productID = productID;
    this.name = name;
    this.price = price;
    this.stockQty = stockQty;
    this.image = image;
    this.category = category;
    this.description = description;
    this.gradient = gradient;
  }
  updateStock(quantityChange) {
    const nextStock = this.stockQty + quantityChange;
    if (nextStock < 0) throw new ApiError(400, "Insufficient stock");
    this.stockQty = nextStock;
    return this.stockQty;
  }
  toJSON() { return { ...this }; }
}

let users = [
  new User("admin", "admin123", "admin"),
  new User("cashier", "cashier123", "cashier")
];

let products = [
  new Product(101, "Beef Siomai", 25, 60, "/images/Beef Siomai.jpg", "Siomai", "3 pcs per order", "linear-gradient(135deg, #7c2d12, #f97316)"),
  new Product(102, "French Fries", 25, 70, "/images/French Fries.jpg", "Snacks", "1 order", "linear-gradient(135deg, #facc15, #fb923c)"),
  new Product(103, "Pork Siomai", 25, 60, "/images/Pork Siomai.jpg", "Siomai", "3 pcs per order", "linear-gradient(135deg, #f97316, #fb7185)"),
  new Product(104, "Pork Sisig", 75, 35, "/images/Pork Sisig.jpg", "Meals", "Per order", "linear-gradient(135deg, #92400e, #ef4444)"),
  new Product(105, "Pork Tocino", 85, 35, "/images/Pork Tocino.jpg", "Meals", "Per order", "linear-gradient(135deg, #dc2626, #fb923c)"),
  new Product(106, "Premium Siomai", 25, 60, "/images/Premium Siomai.jpg", "Siomai", "3 pcs per order", "linear-gradient(135deg, #f59e0b, #ef4444)"),
  new Product(107, "Shrimp Siomai", 25, 60, "/images/Shrimp Siomai.jpg", "Siomai", "3 pcs per order", "linear-gradient(135deg, #fb7185, #f97316)"),
  new Product(108, "Sio Rice", 45, 45, "/images/Sio Rice.jpg", "Rice Meals", "Per order", "linear-gradient(135deg, #eab308, #22c55e)"),
  new Product(109, "Red Ice Tea 12oz", 18, 80, "/images/Red Ice Tea.jpg", "Drinks", "12oz cup", "linear-gradient(135deg, #ef4444, #f97316)"),
  new Product(110, "Black Gulaman 12oz", 18, 80, "/images/Black Gulaman.jpg", "Drinks", "12oz cup", "linear-gradient(135deg, #0f172a, #64748b)")
];

const sales = [];
let nextSaleID = 1001;

app.use(express.json());
app.use(express.static(path.join(__dirname, "dist")));

// AUTH
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username.toLowerCase() === username?.toLowerCase());
  if (!user || !user.login(password)) return res.status(401).json({ message: "Invalid credentials" });
  res.json({ user: user.toJSON() });
});

// PRODUCTS API
app.get("/products", (req, res) => res.json({ products }));

app.post("/products", (req, res) => {
    const { product } = req.body;
    const newID = products.reduce((max, p) => Math.max(max, p.productID), 100) + 1;
    const newP = new Product(newID, product.name, product.price, product.stockQty, product.image, product.category, product.description, product.gradient || "linear-gradient(135deg, #f97316, #0f172a)");
    products.push(newP);
    res.status(201).json({ product: newP, products });
});

app.put("/products/:id", (req, res) => {
    const product = products.find(p => p.productID === Number(req.params.id));
    if (!product) return res.status(404).json({ message: "Not found" });
    Object.assign(product, req.body.product);
    res.json({ product, products });
});

app.delete("/products/:id", (req, res) => {
    products = products.filter(p => p.productID !== Number(req.params.id));
    res.json({ products });
});

app.post("/products/:id/stock", (req, res) => {
  const product = products.find(p => p.productID === Number(req.params.id));
  if (!product) return res.status(404).json({ message: "Not found" });
  product.updateStock(req.body.delta);
  res.json({ product, products });
});

// USERS API
app.get("/users", (req, res) => res.json({ users }));

app.post("/users", (req, res) => {
    const { user } = req.body;
    if (users.some(u => u.username.toLowerCase() === user.username.toLowerCase())) return res.status(400).json({ message: "Exists" });
    const newU = new User(user.username, user.password, user.role);
    users.push(newU);
    res.status(201).json({ user: newU, users });
});

app.put("/users/:username", (req, res) => {
    const user = users.find(u => u.username === req.params.username);
    if (!user) return res.status(404).json({ message: "Not found" });
    user.username = req.body.user.username;
    if (req.body.user.password) user.password = req.body.user.password;
    user.role = req.body.user.role;
    res.json({ user, users });
});

app.delete("/users/:username", (req, res) => {
    users = users.filter(u => u.username !== req.params.username);
    res.json({ users });
});

// SALES API
app.post("/sale", (req, res) => {
  const { items, amount, username } = req.body;
  const total = items.reduce((s, i) => s + (products.find(p => p.productID === i.productID).price * i.quantity), 0);
  if (amount < total) return res.status(400).json({ message: "Short payment" });
  
  items.forEach(i => products.find(p => p.productID === i.productID).updateStock(-i.quantity));
  const sale = { saleID: nextSaleID++, saleDate: new Date().toISOString(), cashier: username, totalAmount: total, payment: { amount, change: amount - total }, saleItems: items.map(i => ({ ...i, name: products.find(p => p.productID === i.productID).name, lineTotal: products.find(p => p.productID === i.productID).price * i.quantity })) };
  sales.unshift(sale);
  res.status(201).json({ sale, products });
});

app.get("/sales", (req, res) => res.json({ sales }));

// FIXED ROUTE FOR EXPRESS 5 / RENDER
app.get("/:path*", (req, res) => {
  const indexPath = path.join(__dirname, "dist", "index.html");
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Online Ordering System & POS monitoring server is running, but frontend files were not found.");
  }
});

app.listen(PORT, () => console.log(`Running on port ${PORT}`));