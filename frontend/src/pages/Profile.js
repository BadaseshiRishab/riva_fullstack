import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { updateProfile } from '../services/api';
import setUser from '../actions/setUser';
import logoutUser from '../actions/logoutUser';
import clearOrders from '../actions/clearOrders';

function Profile() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const formatDateTime = (value) => {
    if (!value) return 'Not available';

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Not available';

    return date.toLocaleString();
  };

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setStatus('');

    try {
      const response = await updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      });

      dispatch(setUser(response.user));
      setStatus('Your account details were updated successfully.');
      setIsEditing(false);
    } catch (err) {
      setError(err.message || 'Unable to update profile');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    dispatch(clearOrders());
    dispatch(logoutUser());
  };

  const renderProfileIcon = (name) => {
    const commonProps = {
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '1.8',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': 'true',
    };

    switch (name) {
      case 'sparkle':
        return (
          <svg {...commonProps}>
            <path d="M12 2.5l1.8 5.7L19.5 10l-5.7 1.8L12 17.5l-1.8-5.7L4.5 10l5.7-1.8L12 2.5z" />
            <path d="M18.5 15.5l.8 2.5 2.5.8-2.5.8-.8 2.5-.8-2.5-2.5-.8 2.5-.8.8-2.5z" />
          </svg>
        );
      case 'user':
        return (
          <svg {...commonProps}>
            <path d="M16.5 18.5v-1a3.5 3.5 0 0 0-3.5-3.5H11a3.5 3.5 0 0 0-3.5 3.5v1" />
            <circle cx="12" cy="7.5" r="3.2" />
          </svg>
        );
      case 'location':
        return (
          <svg {...commonProps}>
            <path d="M12 20.5s6-5.1 6-10a6 6 0 1 0-12 0c0 4.9 6 10 6 10z" />
            <circle cx="12" cy="10.5" r="2.2" />
          </svg>
        );
      case 'clock':
        return (
          <svg {...commonProps}>
            <circle cx="12" cy="12" r="8" />
            <path d="M12 7.5v4.2l2.8 2.3" />
          </svg>
        );
      case 'orders':
        return (
          <svg {...commonProps}>
            <path d="M7 4.5h10l2 4v10.5H5V8.5l2-4z" />
            <path d="M9 4.5V8h6V4.5" />
            <path d="M9 12.5h6M9 15.5h6" />
          </svg>
        );
      case 'wishlist':
        return (
          <svg {...commonProps}>
            <path d="M12 19.5s-7-4.5-7-10.2A4.1 4.1 0 0 1 12 7.3a4.1 4.1 0 0 1 7 2c0 5.7-7 10.2-7 10.2z" />
          </svg>
        );
      case 'cart':
        return (
          <svg {...commonProps}>
            <circle cx="9" cy="18.5" r="1.4" />
            <circle cx="17" cy="18.5" r="1.4" />
            <path d="M3.5 4.5h2l2.5 9.5h9.6l2-7H7.4" />
          </svg>
        );
      default:
        return null;
    }
  };

  if (!user) {
    return (
      <div className="container-fluid">
        <Navbar />
        <div className="profile-page empty-profile">
          <div className="profile-empty-card">
            <h2>Login required</h2>
            <p>Please log in to view your profile.</p>
            <Link to="/login" className="profile-cta">Login</Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <Navbar />

      <div className="profile-page">
        <div className="profile-hero-banner">
          <div className="profile-hero-content">
            <p className="profile-kicker">My account</p>
            <h2>Welcome back, {user.name}</h2>
            <p className="profile-hero-text">Manage your account, delivery details, and orders in one place.</p>
          </div>
          <div className="profile-hero-actions">
            <span className="profile-hero-badge"><span className="profile-hero-badge-icon">{renderProfileIcon('sparkle')}</span>Premium member</span>
            <button type="button" className="logout-btn profile-logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <div className="profile-stat-grid">
          <div className="profile-stat-card">
            <span className="profile-stat-icon">{renderProfileIcon('user')}</span>
            <span>Saved name</span>
            <strong>{user.name}</strong>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-icon">{renderProfileIcon('location')}</span>
            <span>Delivery info</span>
            <strong>{user.address ? 'Updated' : 'Add address'}</strong>
          </div>
          <div className="profile-stat-card">
            <span className="profile-stat-icon">{renderProfileIcon('clock')}</span>
            <span>Last active</span>
            <strong>{formatDateTime(user.lastLoginAt)}</strong>
          </div>
        </div>

        <div className="profile-layout">
          <aside className="profile-card">
            <div className="profile-avatar">{user.name?.charAt(0)?.toUpperCase() || 'U'}</div>
            <h3>Account information</h3>
            <div className="profile-info-list">
              <p><span>Name</span><strong>{user.name}</strong></p>
              <p><span>Email</span><strong>{user.email}</strong></p>
              <p><span>Phone</span><strong>{user.phone || 'Not added yet'}</strong></p>
              <p><span>Address</span><strong>{user.address || 'Not added yet'}</strong></p>
              <p><span>Last active</span><strong>{formatDateTime(user.lastLoginAt)}</strong></p>
            </div>
          </aside>

          <div className="profile-panel">
            <div className="profile-summary-box quick-links-box">
              <h3>Quick links</h3>
              <div className="profile-links">
                <Link to="/orders"><span className="profile-link-icon">{renderProfileIcon('orders')}</span><span className="profile-link-text">View orders</span></Link>
                <Link to="/wishlist"><span className="profile-link-icon">{renderProfileIcon('wishlist')}</span><span className="profile-link-text">Wishlist</span></Link>
                <Link to="/cart"><span className="profile-link-icon">{renderProfileIcon('cart')}</span><span className="profile-link-text">Cart</span></Link>
              </div>
            </div>

            {!isEditing ? (
              <div className="profile-summary-box profile-actions-box">
                <h3>Personal details</h3>
                <p>Manage your contact details and shipping information.</p>
                <button type="button" className="auth-button" onClick={() => setIsEditing(true)}>
                  Update details
                </button>
              </div>
            ) : (
              <div className="profile-summary-box">
                <div className="profile-edit-header">
                  <h3>Edit personal details</h3>
                  <button type="button" className="secondary-link-button" onClick={() => setIsEditing(false)}>
                    Cancel
                  </button>
                </div>

                <form className="auth-form profile-edit-form" onSubmit={handleSubmit}>
                  {error && <p className="auth-error">{error}</p>}
                  {status && <p className="auth-success">{status}</p>}

                  <label className="auth-field">
                    <span>Name</span>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required />
                  </label>

                  <label className="auth-field">
                    <span>Email</span>
                    <input type="email" name="email" value={formData.email} disabled />
                  </label>

                  <label className="auth-field">
                    <span>Phone number</span>
                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="9876543210" />
                  </label>

                  <label className="auth-field">
                    <span>Address</span>
                    <textarea name="address" value={formData.address} onChange={handleChange} placeholder="Enter your address" rows="4" />
                  </label>

                  <button type="submit" className="auth-button">Save changes</button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Profile;
