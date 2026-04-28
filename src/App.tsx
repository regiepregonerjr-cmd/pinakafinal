import React, { useState, useMemo } from 'react';
import { 
  LayoutGrid, 
  ShoppingCart, 
  History, 
  LogOut, 
  Plus, 
  Minus, 
  Trash2, 
  CheckCircle,
  TrendingUp,
  Package,
  Search,
  Receipt
} from 'lucide-react';

// --- UML CLASS DEFINITIONS (Interfaces) ---

interface User {
  username: string;
  role: 'admin' | 'cashier';
}

interface Product {
  productID: number;
  name: string;
  price: number;
  stockQty: number;
  image: string;
  category: string;
}

interface SaleItem {
  productID: number;
  name: string;
  quantity: number;
  price: number;
  lineTotal: number;
}

interface Sale {
  saleID: string;
  saleDate: string;
  items: SaleItem[];
  totalAmount: number;
  payment: Payment;
}

interface Payment {
  amount: number;
  change: number;
  method: 'cash';
}

// --- INITIAL DATA ---

const INITIAL_PRODUCTS: Product[] = [
  { productID: 1, name: 'Beef Siomai (3pcs)', price: 25, stockQty: 50, category: 'Siomai', image: 'https://images.unsplash.com/photo-1541696490-8744a5db7f34?q=80&w=200&h=200&auto=format&fit=crop&q=beef-siomai' },
  { productID: 2, name: 'French Fries', price: 25, stockQty: 30, category: 'Snacks', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?q=80&w=200&h=200&auto=format&fit=crop' },
  { productID: 3, name: 'Pork Siomai (3pcs)', price: 25, stockQty: 50, category: 'Siomai', image: 'https://images.unsplash.com/photo-1563245339-6b2e4428546a?q=80&w=200&h=200&auto=format&fit=crop' },
  { productID: 4, name: 'Pork Sisig', price: 75, stockQty: 20, category: 'Rice Meals', image: 'https://images.unsplash.com/photo-1614398751058-eb2e0bf63e53?q=80&w=200&h=200&auto=format&fit=crop' },
  { productID: 5, name: 'Pork Tocino', price: 85, stockQty: 20, category: 'Rice Meals', image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=200&h=200&auto=format&fit=crop' },
  { productID: 6, name: 'Premium Siomai (3pcs)', price: 25, stockQty: 40, category: 'Siomai', image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=80&w=200&h=200&auto=format&fit=crop' },
  { productID: 7, name: 'Shrimp Siomai (3pcs)', price: 25, stockQty: 40, category: 'Siomai', image: 'https://images.unsplash.com/photo-1523905330026-b8bd1f5f320e?q=80&w=200&h=200&auto=format&fit=crop' },
  { productID: 8, name: 'Sio Rice', price: 45, stockQty: 60, category: 'Rice Meals', image: 'https://images.unsplash.com/photo-1512058560566-42724afbc2db?q=80&w=200&h=200&auto=format&fit=crop' },
  { productID: 9, name: 'Red Ice Tea (12oz)', price: 18, stockQty: 100, category: 'Drinks', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?q=80&w=200&h=200&auto=format&fit=crop' },
  { productID: 10, name: 'Black Gulaman (12oz)', price: 18, stockQty: 100, category: 'Drinks', image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=200&h=200&auto=format&fit=crop' },
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [sales, setSales] = useState<Sale[]>([]);
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [activeTab, setActiveTab] = useState<'pos' | 'history' | 'admin'>('pos');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [showReceipt, setShowReceipt] = useState<Sale | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [users, setUsers] = useState<(User & { password?: string })[]>([
    { username: 'admin', role: 'admin', password: 'admin' },
    { username: 'cashier', role: 'cashier', password: 'cashier' }
  ]);
  const [editingUser, setEditingUser] = useState<(User & { password?: string }) | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // --- METHODS ---

  const handleSaveUser = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const userData = {
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      role: formData.get('role') as 'admin' | 'cashier',
    };

    if (editingUser) {
      setUsers(prev => prev.map(u => u.username === editingUser.username ? userData : u));
    } else {
      if (users.some(u => u.username === userData.username)) {
        alert('Username already exists!');
        return;
      }
      setUsers(prev => [...prev, userData]);
    }
    setIsUserModalOpen(false);
    setEditingUser(null);
  };

  const deleteUser = (username: string) => {
    if (username === user?.username?.toLowerCase()) {
      alert("You cannot delete yourself!");
      return;
    }
    if (confirm(`Are you sure you want to delete user: ${username}?`)) {
      setUsers(prev => prev.filter(u => u.username !== username));
    }
  };

  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productData = {
      name: formData.get('name') as string,
      price: parseFloat(formData.get('price') as string),
      stockQty: parseInt(formData.get('stock') as string),
      category: formData.get('category') as string,
      image: formData.get('image') as string || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&h=200&auto=format&fit=crop',
    };

    if (editingProduct) {
      setProducts(prev => prev.map(p => p.productID === editingProduct.productID ? { ...p, ...productData } : p));
    } else {
      const newProduct: Product = {
        ...productData,
        productID: Date.now(),
      };
      setProducts(prev => [...prev, newProduct]);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const deleteProduct = (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setProducts(prev => prev.filter(p => p.productID !== id));
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = users.find(u => u.username.toLowerCase() === loginForm.username.toLowerCase() && u.password === loginForm.password);
    
    if (foundUser) {
      setUser({ username: foundUser.username, role: foundUser.role });
      setActiveTab(foundUser.role === 'admin' ? 'admin' : 'pos');
    } else {
      alert('Invalid credentials!');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCart([]);
    setLoginForm({ username: '', password: '' });
  };

  const addToCart = (product: Product) => {
    if (product.stockQty <= 0) return;
    
    setCart(prev => {
      const existing = prev.find(item => item.productID === product.productID);
      if (existing) {
        return prev.map(item => 
          item.productID === product.productID 
            ? { ...item, quantity: item.quantity + 1, lineTotal: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prev, { 
        productID: product.productID, 
        name: product.name, 
        quantity: 1, 
        price: product.price, 
        lineTotal: product.price 
      }];
    });
  };

  const updateCartQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.productID === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty, lineTotal: newQty * item.price };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.productID !== id));
  };

  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.lineTotal, 0), [cart]);

  const processSale = () => {
    const amountPaid = parseFloat(paymentAmount);
    if (isNaN(amountPaid) || amountPaid < cartTotal) {
      alert('Insufficient payment amount!');
      return;
    }

    const change = amountPaid - cartTotal;
    const newSale: Sale = {
      saleID: `SALE-${Date.now()}`,
      saleDate: new Date().toLocaleString(),
      items: [...cart],
      totalAmount: cartTotal,
      payment: { amount: amountPaid, change: change, method: 'cash' }
    };

    // Update stock logic
    setProducts(prevProducts => 
      prevProducts.map(p => {
        const cartItem = cart.find(item => item.productID === p.productID);
        if (cartItem) {
          return { ...p, stockQty: Math.max(0, p.stockQty - cartItem.quantity) };
        }
        return p;
      })
    );

    setSales(prev => [newSale, ...prev]);
    setShowReceipt(newSale);
    setCart([]);
    setPaymentAmount('');
  };

  const adjustStock = (productID: number, amount: number) => {
    setProducts(prev => prev.map(p => 
      p.productID === productID 
        ? { ...p, stockQty: Math.max(0, p.stockQty + amount) }
        : p
    ));
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- COMPONENTS ---

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-indigo-600 p-3 rounded-xl mb-4 shadow-lg shadow-indigo-200">
              <ShoppingCart className="text-white w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 text-center">Sio Republic</h1>
            <p className="text-slate-500 text-sm text-center">Online Ordering & POS Monitoring<br/><span className="text-[10px] font-bold text-indigo-500 uppercase">Hinunangan Branch</span></p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={loginForm.username}
                onChange={e => setLoginForm({...loginForm, username: e.target.value})}
                placeholder="admin or cashier"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input 
                type="password" 
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={loginForm.password}
                onChange={e => setLoginForm({...loginForm, password: e.target.value})}
                placeholder="••••••••"
                required
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-lg transition-colors mt-6 shadow-md shadow-indigo-100">
              Sign In
            </button>
          </form>
          <div className="mt-6 text-center text-xs text-slate-400">
            <p>Demo Login: admin/admin or cashier/cashier</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1.5 rounded-lg">
            <ShoppingCart className="text-white w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-slate-800 tracking-tight leading-none">Sio Republic</span>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter">Hinunangan Branch</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex gap-4">
            {user.role === 'cashier' && (
              <button 
                onClick={() => setActiveTab('pos')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'pos' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <LayoutGrid className="w-4 h-4" /> POS
              </button>
            )}
            {user.role === 'admin' && (
              <button 
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'admin' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                <TrendingUp className="w-4 h-4" /> Dashboard
              </button>
            )}
            <button 
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'history' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <History className="w-4 h-4" /> Sales History
            </button>
          </div>
          
          <div className="h-6 w-px bg-slate-200"></div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 leading-none">{user.username}</p>
              <p className="text-xs text-slate-500 capitalize">{user.role}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        {activeTab === 'pos' && (
          <div className="flex h-[calc(100vh-73px)] overflow-hidden">
            {/* Product Section */}
            <div className="flex-1 overflow-y-auto p-6 scroll-smooth">
              <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <h2 className="text-2xl font-bold text-slate-800">Menu</h2>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                    type="text" 
                    placeholder="Search products..."
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map(product => (
                  <button 
                    key={product.productID}
                    onClick={() => addToCart(product)}
                    disabled={product.stockQty === 0}
                    className={`group bg-white rounded-2xl overflow-hidden border border-slate-200 text-left hover:shadow-lg transition-all flex flex-col ${product.stockQty === 0 ? 'opacity-60 grayscale' : 'active:scale-95'}`}
                  >
                    <div className="relative h-40 w-full overflow-hidden">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      {product.stockQty <= 5 && product.stockQty > 0 && (
                        <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Low Stock</span>
                      )}
                      {product.stockQty === 0 && (
                        <span className="absolute inset-0 bg-slate-900/60 flex items-center justify-center text-white font-bold text-sm">Sold Out</span>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{product.category}</span>
                        <h3 className="font-bold text-slate-800 leading-tight mb-1">{product.name}</h3>
                        <p className="text-xs text-slate-500">Stock: {product.stockQty}</p>
                      </div>
                      <p className="mt-3 text-lg font-bold text-indigo-600">₱{product.price.toFixed(2)}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Cart Section */}
            <div className="w-96 bg-white border-l border-slate-200 flex flex-col">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-indigo-600" />
                  Cart
                </h2>
                <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-full">{cart.length} items</span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-6">
                    <div className="bg-slate-50 p-4 rounded-full mb-4">
                      <ShoppingCart className="w-8 h-8 opacity-20" />
                    </div>
                    <p className="text-sm font-medium">Your cart is empty</p>
                    <p className="text-xs mt-1">Select products from the menu to add them here.</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.productID} className="bg-slate-50 rounded-xl p-3 border border-slate-100 group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-800 text-sm leading-tight">{item.name}</span>
                        <button onClick={() => removeFromCart(item.productID)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-lg p-1">
                          <button onClick={() => updateCartQuantity(item.productID, -1)} className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors"><Minus className="w-3 h-3" /></button>
                          <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateCartQuantity(item.productID, 1)} className="p-1 hover:bg-slate-100 rounded text-slate-600 transition-colors"><Plus className="w-3 h-3" /></button>
                        </div>
                        <span className="text-sm font-bold text-slate-700">₱{item.lineTotal.toFixed(2)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-6 bg-slate-50/50 border-t border-slate-100 space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-slate-500 text-sm">
                      <span>Subtotal</span>
                      <span>₱{cartTotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-800 font-bold text-lg pt-2 border-t border-slate-200">
                      <span>Total Amount</span>
                      <span>₱{cartTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">₱</span>
                      <input 
                        type="number" 
                        placeholder="Amount Paid"
                        className="w-full pl-7 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                        value={paymentAmount}
                        onChange={e => setPaymentAmount(e.target.value)}
                      />
                    </div>
                    <button 
                      onClick={processSale}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-100 flex items-center justify-center gap-2"
                    >
                      Process Payment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-8 max-w-5xl mx-auto w-full">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-slate-800">Sales History</h2>
              <div className="bg-indigo-50 px-4 py-2 rounded-lg">
                <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Total Orders</p>
                <p className="text-xl font-black text-indigo-700">{sales.length}</p>
              </div>
            </div>
            
            {sales.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-20 flex flex-col items-center text-slate-400">
                <History className="w-12 h-12 opacity-10 mb-4" />
                <p>No transactions yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sales.map(sale => (
                  <div key={sale.saleID} className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-4 bg-slate-50 flex justify-between items-center border-b border-slate-100">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{sale.saleID}</p>
                        <p className="text-xs text-slate-500">{sale.saleDate}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-indigo-600">₱{sale.totalAmount.toFixed(2)}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Paid via Cash</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {sale.items.map((item, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium">
                            {item.quantity}x {item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="p-8 max-w-6xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-slate-800 mb-8">Admin Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="bg-indigo-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                  <TrendingUp className="text-indigo-600 w-5 h-5" />
                </div>
                <p className="text-slate-500 text-sm font-medium">Total Sales</p>
                <p className="text-3xl font-black text-slate-800">₱{sales.reduce((sum, s) => sum + s.totalAmount, 0).toFixed(2)}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="bg-emerald-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                  <CheckCircle className="text-emerald-600 w-5 h-5" />
                </div>
                <p className="text-slate-500 text-sm font-medium">Total Orders</p>
                <p className="text-3xl font-black text-slate-800">{sales.length}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="bg-amber-50 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
                  <Package className="text-amber-600 w-5 h-5" />
                </div>
                <p className="text-slate-500 text-sm font-medium">Active Products</p>
                <p className="text-3xl font-black text-slate-800">{products.length}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">Inventory Status</h3>
                  <button 
                    onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Product
                  </button>
                </div>
                <div className="divide-y divide-slate-100 overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50/30">
                        <th className="px-6 py-3">Product</th>
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3 text-center">Stock</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {products.map(p => (
                        <tr key={p.productID} className="group hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <img src={p.image} className="w-8 h-8 rounded-lg object-cover" />
                              <span className="text-sm font-bold text-slate-700">{p.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-slate-500">{p.category}</td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-3">
                              <button 
                                onClick={() => adjustStock(p.productID, -1)}
                                className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className={`text-xs font-bold px-2 py-1 min-w-[32px] text-center rounded-full ${p.stockQty <= 5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                                {p.stockQty}
                              </span>
                              <button 
                                onClick={() => adjustStock(p.productID, 1)}
                                className="p-1 text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 rounded transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              >
                                <Receipt className="w-4 h-4" /> {/* Using Receipt icon as a placeholder for edit */}
                              </button>
                              <button 
                                onClick={() => deleteProduct(p.productID)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="font-bold text-slate-800">Recent Transactions</h3>
                </div>
                <div className="p-4 space-y-4">
                  {sales.slice(0, 5).map(sale => (
                    <div key={sale.saleID} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-indigo-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 p-2 rounded-lg">
                          <Receipt className="w-4 h-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-700">{sale.saleID}</p>
                          <p className="text-[10px] text-slate-400">{sale.saleDate}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-800">₱{sale.totalAmount.toFixed(2)}</p>
                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Complete</p>
                      </div>
                    </div>
                  ))}
                  {sales.length === 0 && (
                    <p className="text-center py-10 text-slate-400 text-sm">No recent transactions</p>
                  )}
                </div>
              </div>

              {/* User Management Section */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm lg:col-span-2">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">User Management</h3>
                  <button 
                    onClick={() => { setEditingUser(null); setIsUserModalOpen(true); }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add User
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] text-slate-400 font-bold uppercase tracking-wider bg-slate-50/30">
                        <th className="px-6 py-3">Username</th>
                        <th className="px-6 py-3">Role</th>
                        <th className="px-6 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {users.map(u => (
                        <tr key={u.username} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-700 text-sm">{u.username}</td>
                          <td className="px-6 py-4">
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${u.role === 'admin' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'}`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right space-x-2">
                            <button 
                              onClick={() => { setEditingUser(u); setIsUserModalOpen(true); }}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            >
                              <Receipt className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteUser(u.username)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 bg-indigo-600 text-white flex flex-col items-center">
              <div className="bg-white/20 p-2 rounded-full mb-3">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold">Payment Successful</h2>
              <p className="text-indigo-100 text-xs">Thank you for your purchase!</p>
            </div>
            
            <div className="p-6 font-mono text-[11px] text-slate-600 space-y-4">
              <div className="text-center border-b border-dashed border-slate-200 pb-4">
                <p className="font-bold text-slate-800 text-base mb-1 uppercase tracking-tight">Sio Republic</p>
                <p className="text-[9px] mb-2 font-bold uppercase">Hinunangan Branch</p>
                <p>Date: {showReceipt.saleDate}</p>
                <p>ID: {showReceipt.saleID}</p>
              </div>

              <div className="space-y-1.5 border-b border-dashed border-slate-200 pb-4">
                {showReceipt.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span>{item.quantity}x {item.name}</span>
                    <span>₱{item.lineTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 border-b border-dashed border-slate-200 pb-4">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>TOTAL</span>
                  <span>₱{showReceipt.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CASH PAID</span>
                  <span>₱{showReceipt.payment.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-indigo-600 font-bold">
                  <span>CHANGE</span>
                  <span>₱{showReceipt.payment.change.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center pt-2">
                <p className="uppercase font-bold text-slate-400 text-[9px] tracking-[0.2em]">Transaction Verified</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50">
              <button 
                onClick={() => setShowReceipt(null)}
                className="w-full bg-slate-800 text-white font-bold py-2.5 rounded-xl hover:bg-slate-900 transition-colors"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Modal (Create/Update) */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={() => { setIsProductModalOpen(false); setEditingProduct(null); }} className="text-slate-400 hover:text-slate-600">
                <LogOut className="w-5 h-5 rotate-180" />
              </button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Product Name</label>
                  <input name="name" defaultValue={editingProduct?.name} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Price (₱)</label>
                  <input name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Initial Stock</label>
                  <input name="stock" type="number" defaultValue={editingProduct?.stockQty} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Category</label>
                  <select name="category" defaultValue={editingProduct?.category} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                    <option>Siomai</option>
                    <option>Rice Meals</option>
                    <option>Snacks</option>
                    <option>Drinks</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Image URL</label>
                  <input name="image" defaultValue={editingProduct?.image} placeholder="https://..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => { setIsProductModalOpen(false); setEditingProduct(null); }} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Modal (Create/Update) */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button onClick={() => { setIsUserModalOpen(false); setEditingUser(null); }} className="text-slate-400 hover:text-slate-600">
                <LogOut className="w-5 h-5 rotate-180" />
              </button>
            </div>
            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Username</label>
                <input name="username" defaultValue={editingUser?.username} required disabled={!!editingUser} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                <input name="password" type="text" defaultValue={editingUser?.password} required className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Role</label>
                <select name="role" defaultValue={editingUser?.role} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                  <option value="cashier">Cashier</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => { setIsUserModalOpen(false); setEditingUser(null); }} className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Footer / Status Bar */}
      <footer className="bg-white border-t border-slate-200 px-6 py-2 flex justify-between items-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
        <div className="flex gap-4">
          <span>Server: Online</span>
          <span>Database: In-Memory</span>
        </div>
        <div>
          SwiftPOS v1.0.0
        </div>
      </footer>
    </div>
  );
}
