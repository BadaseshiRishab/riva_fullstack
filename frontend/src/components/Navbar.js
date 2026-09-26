import React, { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import logo from '../images/logo.jpg'

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
  const cartItems = useSelector((state) => state.cart || []);
  const wishlistItems = useSelector((state) => state.wishlist || []);
  const user = useSelector((state) => state.user);
  const cartCount = cartItems.reduce((total, item) => total + Number(item.quantity || 1), 0);

  return (
    <div className="navbar-wrapper">
        <nav className="navbar navbar-expand-lg bg-body-tertiary navbar-fixed">
            <div className="container-fluid">
                <a className="navbar-brand" href="/">
                    <img src={logo} alt="Logo" width="40" className="d-inline-block align-text-top"/>
                </a>
                <button className="navbar-toggler" type="button" onClick={() => setMenuOpen((open) => !open)} aria-controls="navbarSupportedContent" aria-expanded={menuOpen} aria-label="Toggle navigation">
                <span className="navbar-toggler-icon">☰</span>
                </button>
                <div className={`collapse navbar-collapse ${menuOpen ? 'show' : ''}`} id="navbarSupportedContent">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link active" aria-current="page" to="/" onClick={() => setMenuOpen(false)}>Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" aria-current="page" to="/men" onClick={() => setMenuOpen(false)}>Men</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" aria-current="page" to="/women" onClick={() => setMenuOpen(false)}>Women</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" aria-current="page" to="/kids" onClick={() => setMenuOpen(false)}>Kids</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" aria-current="page" to="/beauty" onClick={() => setMenuOpen(false)}>Beauty</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link" aria-current="page" to="/living" onClick={() => setMenuOpen(false)}>Living</Link>
                        </li>
                    </ul>

                    <div className="d-flex align-items-center gap-2 ms-auto">
                        {!user || user.role !== 'admin' ? (
                            <>
                                <Link to="/wishlist" className="cart-badge-wrap position-relative text-decoration-none text-dark">
                                    <span className="cart-icon" aria-label="Wishlist">♡</span>
                                    <span className="cart-count">{wishlistItems.length}</span>
                                </Link>
                                <Link to="/cart" className="cart-badge-wrap position-relative text-decoration-none text-dark">
                                    <span className="cart-icon" aria-label="Shopping cart">🛒</span>
                                    <span className="cart-count">{cartCount}</span>
                                </Link>
                            </>
                        ) : null}
                        {user ? (
                            <>
                                {user.role === 'admin' && <Link to="/admin" className="admin-nav-link">Admin</Link>}
                                <Link to={user.role === 'admin' ? '/admin' : '/profile'} className="user-pill user-pill-link">Hi, {user.name?.split(' ')[0] || 'there'}</Link>
                            </>
                        ) : (
                            <Link to="/login" className="user-pill user-pill-link">Login</Link>
                        )}
                    </div>
                </div>
            </div>
            </nav>
            <Outlet/>
    </div>
  )
}

export default Navbar