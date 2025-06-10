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
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/products/`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      alert('Ошибка при загрузке товаров');
    } finally {
      setLoading(false);
    }
  };

  const fetchShops = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/shops/`);
      setShops(response.data);
    } catch (error) {
      console.error('Error fetching shops:', error);
      alert('Ошибка при загрузке магазинов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchShops();
  }, []);

  // Product operations
  const deleteProduct = async (productId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/products/${productId}/`);
      fetchProducts();
      alert('Товар успешно удален');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Ошибка при удалении товара');
    }
  };

  // Shop operations
  const deleteShop = async (shopId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот магазин?')) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/shops/${shopId}/`);
      fetchShops();
      fetchProducts(); // Refresh products as they might be affected
      alert('Магазин успешно удален');
    } catch (error) {
      console.error('Error deleting shop:', error);
      alert('Ошибка при удалении магазина');
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
        {loading && <div className="loading">Загрузка...</div>}

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
  const getImageUrl = (imageData) => {
    if (!imageData) return null;

    // Если это уже полный URL
    if (imageData.startsWith('http')) {
      return imageData;
    }

    // Если это base64 данные
    if (imageData.startsWith('data:')) {
      return imageData;
    }

    // Если это только base64 строка без префикса
    return `data:image/jpeg;base64,${imageData}`;
  };

  return (
    <div className="product-list">
      <div className="section-header">
        <h2>Товары</h2>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <p>Товары не найдены</p>
        </div>
      ) : (
        <div className="grid">
          {products.map(product => (
            <div key={product.id} className="card">
              <h3>{product.name}</h3>
              <p><strong>Цена:</strong> ${product.price}</p>
              <p><strong>Описание:</strong> {product.description}</p>

              {product.image && (
                <div className="image-container">
                  <img
                    src={getImageUrl(product.image)}
                    alt={product.name}
                    className="product-image"
                    onError={(e) => {
                      console.error('Image loading error:', e);
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <div className="card-actions">
                <button
                  onClick={() => onDelete(product.id)}
                  className="delete-btn"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Shop List Component
function ShopList({ shops, onDelete, onRefresh }) {
  return (
    <div className="shop-list">
      <div className="section-header">
        <h2>Магазины</h2>
      </div>

      {shops.length === 0 ? (
        <div className="empty-state">
          <p>Магазины не найдены</p>
        </div>
      ) : (
        <div className="grid">
          {shops.map(shop => (
            <div key={shop.id} className="card">
              <h3>{shop.name}</h3>
              <p><strong>Местоположение:</strong> {shop.location}</p>
              <p><strong>Товаров:</strong> {shop.products?.length || 0}</p>
              <div className="card-actions">
                <button
                  onClick={() => onDelete(shop.id)}
                  className="delete-btn"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Название товара обязательно';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Цена должна быть больше 0';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Описание обязательно';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name.trim());
      submitData.append('price', formData.price);
      submitData.append('description', formData.description.trim());

      if (formData.image_file) {
        submitData.append('image_file', formData.image_file);
      }

      // Add shops data - только если есть данные о магазинах
      const validInventories = inventories.filter(inv =>
        inv.shop_id && inv.stock && parseInt(inv.stock) > 0
      )

      let map = new Map();
      let key = validInventories[0]['shop_id']
      let value = validInventories[0]['stock']
      console.log(value)
      map[key] = value;

      console.log(map)

      if (map.size > 0) {
        submitData.append('shops_data', JSON.stringify(map));
      }

      console.log('Отправляем данные:', {
        name: formData.name,
        price: formData.price,
        description: formData.description,
        image_file: formData.image_file?.name,
        shops_data: map
      });

      const response = await axios.post(`${API_BASE_URL}/products/`, submitData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Ответ от сервера:', response.data);
      alert('Товар успешно создан!');

      // Сброс формы
      setFormData({
        name: '',
        price: '',
        description: '',
        image_file: null
      });
      setInventories([]);
      setErrors({});

      onSuccess();
    } catch (error) {
      console.error('Error creating product:', error);

      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);

        if (error.response.data && typeof error.response.data === 'object') {
          const errorMessages = Object.entries(error.response.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n');
          alert(`Ошибка при создании товара:\n${errorMessages}`);
        } else {
          alert(`Ошибка при создании товара: ${error.response.data || error.response.status}`);
        }
      } else {
        alert('Ошибка при создании товара. Проверьте подключение к серверу.');
      }
    } finally {
      setLoading(false);
    }
  };

  const addInventoryRow = () => {
    setInventories([...inventories, { shop_id: '', stock: '' }]);
  };

  const removeInventoryRow = (index) => {
    const newInventories = inventories.filter((_, i) => i !== index);
    setInventories(newInventories);
  };

  return (
    <div className="add-product">
      <h2>Добавить товар</h2>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <input
            type="text"
            placeholder="Наименование товара"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Цена"
            value={formData.price}
            onChange={(e) => setFormData({...formData, price: e.target.value})}
            className={errors.price ? 'error' : ''}
          />
          {errors.price && <span className="error-message">{errors.price}</span>}
        </div>

        <div className="form-group">
          <textarea
            placeholder="Описание"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className={errors.description ? 'error' : ''}
            rows="3"
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        <div className="form-group">
          <label>Изображение товара:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setFormData({...formData, image_file: e.target.files[0]})}
          />
          {formData.image_file && (
            <div className="file-preview">
              Выбран файл: {formData.image_file.name}
            </div>
          )}
        </div>

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
                <option value="">Выберите магазин</option>
                {shops.map(shop => (
                  <option key={shop.id} value={shop.id}>{shop.name}</option>
                ))}
              </select>
              <input
                type="number"
                min="0"
                placeholder="Количество"
                value={inv.stock}
                onChange={(e) => {
                  const newInventories = [...inventories];
                  newInventories[index].stock = e.target.value;
                  setInventories(newInventories);
                }}
              />
              <button
                type="button"
                onClick={() => removeInventoryRow(index)}
                className="remove-btn"
              >
                Удалить
              </button>
            </div>
          ))}
          <button type="button" onClick={addInventoryRow} className="add-inventory-btn">
            Добавить магазин
          </button>
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Создание...' : 'Создать товар'}
        </button>
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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Название магазина обязательно';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        name: formData.name.trim(),
        location: formData.location.trim()
      };

      console.log('Отправляем данные магазина:', submitData);

      const response = await axios.post(`${API_BASE_URL}/shops/`, submitData);

      console.log('Ответ от сервера:', response.data);
      alert('Магазин успешно создан!');

      // Сброс формы
      setFormData({
        name: '',
        location: ''
      });
      setErrors({});

      onSuccess();
    } catch (error) {
      console.error('Error creating shop:', error);

      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);

        if (error.response.data && typeof error.response.data === 'object') {
          const errorMessages = Object.entries(error.response.data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n');
          alert(`Ошибка при создании магазина:\n${errorMessages}`);
        } else {
          alert(`Ошибка при создании магазина: ${error.response.data || error.response.status}`);
        }
      } else {
        alert('Ошибка при создании магазина. Проверьте подключение к серверу.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-shop">
      <h2>Добавить магазин</h2>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <input
            type="text"
            placeholder="Название магазина"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <input
            type="text"
            placeholder="Местонахождение"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
          />
        </div>

        <button type="submit" disabled={loading} className="submit-btn">
          {loading ? 'Создание...' : 'Создать магазин'}
        </button>
      </form>
    </div>
  );
}

export default App;