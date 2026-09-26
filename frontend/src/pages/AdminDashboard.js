import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import clearOrders from '../actions/clearOrders';
import logoutUser from '../actions/logoutUser';
import { createProduct, deleteProduct, fetchAdminOrders, fetchProducts, reviewReturnRequest, updateOrderStatus, updateProduct } from '../services/api';

const emptyProduct = {
  name: '',
  category: 'men',
  description: '',
  price: '',
  image: '',
  images: '',
  stock: '',
  featured: false,
  tags: '',
};

function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [returnFilter, setReturnFilter] = useState('all');

  const refreshAdminData = async () => {
    try {
      const [catalog, orderList] = await Promise.all([fetchProducts(), fetchAdminOrders()]);
      setProducts(catalog);
      setOrders(orderList);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }

    refreshAdminData();
    const refreshTicker = window.setInterval(() => {
      refreshAdminData();
    }, 15000);

    return () => window.clearInterval(refreshTicker);
  }, [navigate, user]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
  };

  const resetForm = () => {
    setFormData(emptyProduct);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setStatus('');

    const payload = {
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
      images: String(formData.images).split(',').map((image) => image.trim()).filter(Boolean),
      tags: String(formData.tags).split(',').map((tag) => tag.trim()).filter(Boolean),
    };

    try {
      const savedProduct = editingId
        ? await updateProduct(editingId, payload)
        : await createProduct(payload);

      setProducts((current) => editingId
        ? current.map((product) => (product.id === editingId || product._id === editingId ? savedProduct : product))
        : [savedProduct, ...current]);
      setStatus(editingId ? 'Product updated successfully.' : 'Product added successfully.');
      resetForm();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product.id || product._id);
    setFormData({
      name: product.name || '',
      category: product.category || 'men',
      description: product.description || '',
      price: product.price ?? '',
      image: product.image || '',
      images: Array.isArray(product.images) ? product.images.join(', ') : '',
      stock: product.stock ?? '',
      featured: Boolean(product.featured),
      tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
    });
    setStatus('');
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (product) => {
    const productId = product.id || product._id;
    if (!window.confirm(`Delete ${product.name}?`)) return;

    try {
      await deleteProduct(productId);
      setProducts((current) => current.filter((item) => (item.id || item._id) !== productId));
      setStatus('Product deleted successfully.');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleStatusChange = async (order, status) => {
    try {
      const updatedOrder = await updateOrderStatus(order._id || order.id, status);
      setOrders((current) => current.map((item) => (item._id === updatedOrder._id ? updatedOrder : item)));
      setStatus(`Order ${order._id?.slice(-6) || ''} marked ${status.toLowerCase()}.`);
      const refreshedProducts = await fetchProducts();
      setProducts(refreshedProducts);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleCancelOrder = async (order) => {
    const orderId = order._id || order.id;
    if (!window.confirm('Cancel this order? The items will be added back to stock.')) return;

    try {
      const updatedOrder = await updateOrderStatus(orderId, 'Cancelled');
      setOrders((current) => current.map((item) => ((item._id || item.id) === (updatedOrder._id || updatedOrder.id) ? updatedOrder : item)));
      setStatus(`Order ${String(orderId).slice(-6)} cancelled and stock restored.`);
      setProducts(await fetchProducts());
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleReturnDecision = async (order, decision) => {
    const note = window.prompt(
      decision === 'approved'
        ? 'Add a note for the customer about their approved return:'
        : 'Add a note explaining why the return was rejected:',
      decision === 'approved'
        ? 'Your return request has been approved and the item has been added back to stock.'
        : 'Your return request was not approved at this time.'
    );

    if (note === null) return;

    try {
      const updatedOrder = await reviewReturnRequest(order._id || order.id, decision, note);
      setOrders((current) => current.map((item) => ((item._id || item.id) === (updatedOrder._id || updatedOrder.id) ? updatedOrder : item)));
      setStatus(`Return request ${decision === 'approved' ? 'approved' : 'rejected'} for order ${String(order._id || order.id).slice(-6)}.`);
      const refreshedProducts = await fetchProducts();
      setProducts(refreshedProducts);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const returnCounts = {
    all: orders.length,
    requested: orders.filter((order) => order.returnRequested || order.returnStatus === 'Requested').length,
    approved: orders.filter((order) => order.returnStatus === 'Approved').length,
    rejected: orders.filter((order) => order.returnStatus === 'Rejected').length,
  };

  const filteredOrders = orders.filter((order) => {
    if (returnFilter === 'all') return true;
    if (returnFilter === 'requested') return order.returnRequested || order.returnStatus === 'Requested';
    return order.returnStatus === returnFilter.charAt(0).toUpperCase() + returnFilter.slice(1);
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(clearOrders());
    dispatch(logoutUser());
    navigate('/login');
  };

  return (
    <div className="container-fluid">
      <Navbar />
      <main className="admin-page">
        <header className="admin-header">
          <div>
            <p className="profile-kicker">Store management</p>
            <h1>Admin dashboard</h1>
            <p>Welcome, {user?.name}. Manage the product catalog from here.</p>
          </div>
          <div className="admin-header-actions">
            <button type="button" className="secondary-link-button refresh-orders-button" onClick={refreshAdminData}>Refresh orders</button>
            <button type="button" className="logout-btn" onClick={handleLogout}>Admin logout</button>
          </div>
        </header>

        <section className="admin-stats">
          <div className="admin-stat"><strong>{products.length}</strong><span>Total products</span></div>
          <div className="admin-stat"><strong>{products.filter((product) => product.stock > 0).length}</strong><span>In stock</span></div>
          <div className="admin-stat"><strong>{products.filter((product) => product.featured).length}</strong><span>Featured</span></div>
          <div className="admin-stat"><strong>{orders.length}</strong><span>Total orders</span></div>
        </section>

        <section className="admin-stats admin-return-stats">
          <div className="admin-stat"><strong>{returnCounts.requested}</strong><span>Return requests</span></div>
          <div className="admin-stat"><strong>{returnCounts.approved}</strong><span>Approved</span></div>
          <div className="admin-stat"><strong>{returnCounts.rejected}</strong><span>Rejected</span></div>
          <div className="admin-stat"><strong>{returnCounts.all}</strong><span>Total orders</span></div>
        </section>

        <section className="admin-card admin-orders-card">
          <div className="admin-card-heading"><div><p className="profile-kicker">Fulfilment</p><h2>Order management</h2></div></div>
          <div className="admin-return-filter-row">
            <button type="button" className={returnFilter === 'all' ? 'filter-button active' : 'filter-button'} onClick={() => setReturnFilter('all')}>All ({returnCounts.all})</button>
            <button type="button" className={returnFilter === 'requested' ? 'filter-button active' : 'filter-button'} onClick={() => setReturnFilter('requested')}>Requested ({returnCounts.requested})</button>
            <button type="button" className={returnFilter === 'approved' ? 'filter-button active' : 'filter-button'} onClick={() => setReturnFilter('approved')}>Approved ({returnCounts.approved})</button>
            <button type="button" className={returnFilter === 'rejected' ? 'filter-button active' : 'filter-button'} onClick={() => setReturnFilter('rejected')}>Rejected ({returnCounts.rejected})</button>
          </div>
          {!filteredOrders.length ? <p className="admin-empty-message">No orders match this return filter.</p> : (
            <div className="admin-order-list">
              {filteredOrders.map((order) => {
                const customer = typeof order.userId === 'object' ? order.userId : null;
                const orderId = order._id || order.id;
                return (
                  <article className="admin-order-row" key={orderId}>
                    <div className="admin-order-summary">
                      <strong>#{orderId?.slice(-8)}</strong>
                      <span>{customer?.name || 'Customer'} · {customer?.email || 'No email'}</span>
                      <span>₹ {Number(order.total || 0).toFixed(2)} · {order.items?.length || 0} item(s)</span>
                    </div>
                    <select value={order.status || 'Placed'} onChange={(event) => handleStatusChange(order, event.target.value)} aria-label={`Status for order ${orderId}`}>
                      <option value="Placed">Placed</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Returned">Returned</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                    {!['Cancelled', 'Delivered', 'Returned'].includes(order.status) && (
                      <button type="button" className="admin-cancel-order-button" onClick={() => handleCancelOrder(order)}>Cancel order</button>
                    )}
                    {(order.returnRequested || order.returnStatus === 'Requested') && (
                      <div className="admin-return-box">
                        <strong>Return request</strong>
                        <span>{order.returnStatus || 'Requested'} · {order.returnReason || 'No reason provided'}</span>
                        {order.returnDecisionNote && <small>{order.returnDecisionNote}</small>}
                        {order.returnStatus === 'Requested' && (
                          <div className="admin-return-actions">
                            <button type="button" className="accept-return-button" onClick={() => handleReturnDecision(order, 'approved')}>Accept</button>
                            <button type="button" className="reject-return-button" onClick={() => handleReturnDecision(order, 'rejected')}>Reject</button>
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="admin-grid">
          <form className="admin-card auth-form" onSubmit={handleSubmit}>
            <div className="admin-card-heading">
              <div><p className="profile-kicker">Catalog</p><h2>{editingId ? 'Edit product' : 'Add product'}</h2></div>
              {editingId && <button type="button" className="secondary-link-button" onClick={resetForm}>Cancel</button>}
            </div>
            {error && <p className="auth-error">{error}</p>}
            {status && <p className="auth-success">{status}</p>}
            <label className="auth-field"><span>Product name</span><input name="name" value={formData.name} onChange={handleChange} required /></label>
            <div className="admin-form-row">
              <label className="auth-field"><span>Category</span><select name="category" value={formData.category} onChange={handleChange}><option value="men">Men</option><option value="women">Women</option><option value="kids">Kids</option><option value="beauty">Beauty</option><option value="living">Living</option></select></label>
              <label className="auth-field"><span>Price</span><input type="number" min="0" step="0.01" name="price" value={formData.price} onChange={handleChange} required /></label>
            </div>
            <div className="admin-form-row">
              <label className="auth-field"><span>Stock</span><input type="number" min="0" name="stock" value={formData.stock} onChange={handleChange} required /></label>
              <label className="auth-field"><span>Primary image URL</span><input type="url" name="image" value={formData.image} onChange={handleChange} /></label>
            </div>
            <label className="auth-field"><span>Gallery image URLs, separated by commas</span><input name="images" value={formData.images} onChange={handleChange} placeholder="https://... , https://..." /></label>
            <label className="auth-field"><span>Description</span><textarea name="description" value={formData.description} onChange={handleChange} rows="3" /></label>
            <label className="auth-field"><span>Tags, separated by commas</span><input name="tags" value={formData.tags} onChange={handleChange} /></label>
            <label className="admin-checkbox"><input type="checkbox" name="featured" checked={formData.featured} onChange={handleChange} /><span>Show as featured product</span></label>
            <button type="submit" className="auth-button">{editingId ? 'Save product' : 'Add product'}</button>
          </form>

          <section className="admin-card">
            <div className="admin-card-heading"><div><p className="profile-kicker">Inventory</p><h2>Product catalog</h2></div></div>
            <div className="admin-product-list">
              {products.map((product) => <article className="admin-product-row" key={product.id || product._id}>
                <div><strong>{product.name}</strong><span>{product.category} · ₹ {Number(product.price || 0).toFixed(2)} · {product.stock} in stock</span></div>
                <div className="admin-product-actions"><button type="button" onClick={() => handleEdit(product)}>Edit</button><button type="button" className="danger-button" onClick={() => handleDelete(product)}>Delete</button></div>
              </article>)}
            </div>
          </section>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default AdminDashboard;
