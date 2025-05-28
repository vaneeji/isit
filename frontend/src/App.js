import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'http://localhost:8000/api';

function App() {
  const [products, setProducts] = useState([]);
  const [shops, setShops] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(false);

  // Fetch data
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/products/`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchShops = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/shops/`);
      setShops(response.data);
    } catch (error) {
      console.error('Error fetching shops:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchShops();
  }, []);

  // Product operations
  const deleteProduct = async (productId) => {
    try {
      await axios.delete(`${API_BASE_URL}/products/${productId}/`);
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  // Shop operations
  const deleteShop = async (shopId) => {
    try {
      await axios.delete(`${API_BASE_URL}/shops/${shopId}/`);
      fetchShops();
      fetchProducts(); // Refresh products as they might be affected
    } catch (error) {
      console.error('Error deleting shop:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Система управления товарами</h1>
        <nav className="nav-tabs">
          <button
            className={activeTab === 'products' ? 'active' : ''}
            onClick={() => setActiveTab('products')}
          >
            Товары
          </button>
          <button
            className={activeTab === 'shops' ? 'active' : ''}
            onClick={() => setActiveTab('shops')}
          >
            Магазины
          </button>
          <button
            className={activeTab === 'add-product' ? 'active' : ''}
            onClick={() => setActiveTab('add-product')}
          >
            Добавить товар
          </button>
          <button
            className={activeTab === 'add-shop' ? 'active' : ''}
            onClick={() => setActiveTab('add-shop')}
          >
            Добавить магазин
          </button>
        </nav>
      </header>

      <main className="main-content">
        {activeTab === 'products' && (
          <ProductList
            products={products}
            onDelete={deleteProduct}
            onRefresh={fetchProducts}
          />
        )}
        {activeTab === 'shops' && (
          <ShopList
            shops={shops}
            onDelete={deleteShop}
            onRefresh={fetchShops}
          />
        )}
        {activeTab === 'add-product' && (
          <AddProduct
            shops={shops}
            onSuccess={() => {
              fetchProducts();
              setActiveTab('products');
            }}
          />
        )}
        {activeTab === 'add-shop' && (
          <AddShop
            onSuccess={() => {
              fetchShops();
              setActiveTab('shops');
            }}
          />
        )}
      </main>
    </div>
  );
}

// Product List Component
function ProductList({ products, onDelete, onRefresh }) {
  return (
    <div className="product-list">
      <h2>Товары</h2>
      <div className="grid">
        {products.map(product => (
          <div key={product.id} className="card">
            <h3>{product.name}</h3>
            <p>Price: ${product.price}</p>
            <p>Description: {product.description}</p>
            <p>Total Stock: {product.total_stock}</p>
            {product.image && (
              <img
                src={`data:image/jpeg;base64,${product.image}`}
                alt={product.name}
                className="product-image"
              />
            )}
            <div className="card-actions">
              <button
                onClick={() => onDelete(product.id)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Shop List Component
function ShopList({ shops, onDelete, onRefresh }) {
  return (
    <div className="shop-list">
      <h2>Магазины</h2>
      <div className="grid">
        {shops.map(shop => (
          <div key={shop.id} className="card">
            <h3>{shop.name}</h3>
            <p>Location: {shop.location}</p>
            <p>Products: {shop.products?.length || 0}</p>
            <div className="card-actions">
              <button
                onClick={() => onDelete(shop.id)}
                className="delete-btn"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Add Product Component
function AddProduct({ shops, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    image_file: null
  });
  const [inventories, setInventories] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('price', formData.price);
    submitData.append('description', formData.description);

    if (formData.image_file) {
      submitData.append('image_file', formData.image_file);
    }

    // Add shops data
    const shopsData = inventories.filter(inv => inv.shop_id && inv.stock);
    submitData.append('shops_data', JSON.stringify(shopsData));

    try {
      await axios.post(`${API_BASE_URL}/products/`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      onSuccess();
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const addInventoryRow = () => {
    setInventories([...inventories, { shop_id: '', stock: '' }]);
  };

  return (
    <div className="add-product">
      <h2>Добавить товар</h2>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder="Наименование товара"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Цена"
          value={formData.price}
          onChange={(e) => setFormData({...formData, price: e.target.value})}
          required
        />
        <textarea
          placeholder="Описание"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFormData({...formData, image_file: e.target.files[0]})}
        />

        <div className="inventory-section">
          <h3>Наличие по магазинам</h3>
          {inventories.map((inv, index) => (
            <div key={index} className="inventory-row">
              <select
                value={inv.shop_id}
                onChange={(e) => {
                  const newInventories = [...inventories];
                  newInventories[index].shop_id = e.target.value;
                  setInventories(newInventories);
                }}
              >
                <option value="">Select Shop</option>
                {shops.map(shop => (
                  <option key={shop.id} value={shop.id}>{shop.name}</option>
                ))}
              </select>
              <input
                type="number"
                placeholder="Stock"
                value={inv.stock}
                onChange={(e) => {
                  const newInventories = [...inventories];
                  newInventories[index].stock = e.target.value;
                  setInventories(newInventories);
                }}
              />
            </div>
          ))}
          <button type="button" onClick={addInventoryRow}>Добавить магазин</button>
        </div>

        <button type="submit">Создать товар</button>
      </form>
    </div>
  );
}

// Add Shop Component
function AddShop({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    location: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API_BASE_URL}/shops/`, formData);
      onSuccess();
    } catch (error) {
      console.error('Error creating shop:', error);
    }
  };

  return (
    <div className="add-shop">
      <h2>Добавить магазин</h2>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          placeholder="Название магазина"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
        <input
          type="text"
          placeholder="Местонахождение"
          value={formData.location}
          onChange={(e) => setFormData({...formData, location: e.target.value})}
        />
        <button type="submit">Создать магазин</button>
      </form>
    </div>
  );
}

export default App;