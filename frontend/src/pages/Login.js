import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import setUser from '../actions/setUser';
import clearOrders from '../actions/clearOrders';
import { loginAdmin, loginUser } from '../services/api';

function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const isAdminEmail = (value) => {
    const normalized = String(value || '').trim().toLowerCase();
    return normalized === 'admin@shoppingwebsite.com' || normalized.endsWith('@shoppingwebsite.com');
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const isAdminAttempt = isAdminEmail(formData.emailOrPhone);
      const response = isAdminAttempt
        ? await loginAdmin({ email: formData.emailOrPhone, password: formData.password })
        : await loginUser(formData);

      localStorage.setItem('token', response.token);
      dispatch(clearOrders());
      dispatch(setUser(response.user));
      navigate(isAdminAttempt ? '/admin' : '/');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  const handleDemoLogin = async () => {
    const demoUser = {
      emailOrPhone: 'debug@example.com',
      password: 'pass123',
    };

    setError('');

    try {
      const response = await loginUser(demoUser);
      localStorage.setItem('token', response.token);
      dispatch(clearOrders());
      dispatch(setUser(response.user));
      navigate('/');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    }
  };

  return (
    <div className="container-fluid">
      <Navbar />

      <div className="auth-page">
        <div className="auth-card">
          <p className="auth-kicker">Welcome back</p>
          <h2>Login</h2>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <p className="auth-error">{error}</p>}

            <label className="auth-field">
              <span>Email or phone number</span>
              <input type="text" name="emailOrPhone" value={formData.emailOrPhone} onChange={handleChange} placeholder="you@example.com/9876543210" required />
            </label>

            <label className="auth-field">
              <span>Password</span>
              <div className="password-input-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </label>

            <button type="submit" className="auth-button">Login</button>
            <button type="button" className="demo-login-button" onClick={handleDemoLogin}>
              Demo login
            </button>
          </form>

          <div className="auth-footer">
            <span>Don’t have an account?</span>
            <Link to="/create-account">Create account</Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default Login;
