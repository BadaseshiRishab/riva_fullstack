
import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="site-footer-main">
        <div className="site-footer-brand">
          <Link to="/" className="site-footer-logo">RIVA</Link>
          <p>Thoughtful pieces for everyday living, made to feel like yours.</p>
          <span className="site-footer-note">Secure checkout · Easy returns · Personal support</span>
        </div>

        <nav className="site-footer-column" aria-label="Shop">
          <h3>Shop</h3>
          <Link to="/men">Men</Link>
          <Link to="/women">Women</Link>
          <Link to="/kids">Kids</Link>
          <Link to="/beauty">Beauty</Link>
          <Link to="/living">Living</Link>
        </nav>

        <nav className="site-footer-column" aria-label="Your account">
          <h3>Your account</h3>
          <Link to="/profile">Profile</Link>
          <Link to="/orders">Orders</Link>
          <Link to="/wishlist">Wishlist</Link>
          <Link to="/cart">Cart</Link>
          <Link to="/login">Sign in</Link>
        </nav>

        <div className="site-footer-column site-footer-contact">
          <h3>Need help?</h3>
          <p>We are here Monday to Saturday, 10:00 AM to 6:00 PM.</p>
          <a href="mailto:hello@rivastore.com">hello@rivastore.com</a>
          <a href="tel:+919876543210">+91 98765 43210</a>
        </div>
      </div>

      <div className="site-footer-bottom">
        <span>&copy; {year} RIVA Store. All rights reserved.</span>
        <span>Designed for everyday living.</span>
      </div>
    </footer>
  )
}

export default Footer