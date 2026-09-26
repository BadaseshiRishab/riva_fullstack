import React, { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import './details.css'
import addToCart from '../actions/addToCart'

const specificationsByProduct = {
    'Fjallraven - Foldsack No. 1 Backpack, Fits 15 Laptops': {
        care: 'Spot clean with a damp cloth',
        fit: 'Adjustable backpack fit',
        color: 'Brown',
        material: 'Polyester and leather trim',
        pattern: 'Solid'
    },
    'Mens Casual Premium Slim Fit T-Shirts': {
        care: 'Machine wash cold',
        fit: 'Slim Fit',
        color: 'Black',
        material: 'Cotton',
        pattern: 'Solid'
    },
    'Mens Cotton Jacket': {
        care: 'Machine wash gentle cycle',
        fit: 'Regular Fit',
        color: 'Blue',
        material: 'Cotton',
        pattern: 'Solid'
    },
    'Mens Casual Slim Fit': {
        care: 'Machine wash cold',
        fit: 'Slim Fit',
        color: 'Black',
        material: 'Cotton blend',
        pattern: 'Solid'
    }
}

let ProductDetails = ({ product }) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const galleryImages = [...new Set([...(Array.isArray(product.images) ? product.images : []), product.image].filter(Boolean))];
    const [selectedImage, setSelectedImage] = useState(galleryImages[0] || product.image);

    const specifications = product.specifications || specificationsByProduct[product.name] || {
        care: 'Follow the care label instructions',
        fit: 'Regular Fit',
        color: 'Black',
        material: 'Cotton blend',
        pattern: 'Solid'
    }

    const handleAddToCart = () => {
        dispatch(addToCart(product));
    }

    const handleBuyNow = () => {
        dispatch(addToCart(product));
        navigate('/checkout');
    }

    return (
        <section id="product-info">
            <div className="item-image-parent">
                <div className="item-list-vertical" aria-label="Product images">
                    {galleryImages.map((image, index) => (
                        <button
                            type="button"
                            className={`thumb-box ${selectedImage === image ? 'thumb-box-active' : ''}`}
                            key={`${image}-${index}`}
                            onClick={() => setSelectedImage(image)}
                            aria-label={`View product image ${index + 1}`}
                            aria-pressed={selectedImage === image}
                        >
                            <img src={image} alt={`${product.name} thumbnail ${index + 1}`} />
                        </button>
                    ))}
                </div>
                <div className="item-image-main">
                    <img src={selectedImage} alt={product.name} />
                </div>
            </div>

            <div className="item-info-parent">
                <div className="main-info">
                    <div className="product-badge">New arrival</div>
                    <h4>{product.name}</h4>
                    <div className="star-rating">
                        <span>★★★★★</span>
                        <small>4.8/5</small>
                    </div>
                    <p>
                        Price: <span id="price">₹ {product.price}</span>
                    </p>
                </div>

                <div className="select-items">
                    <div className="change-color">
                        <label><b>Colour:</b> Black</label><br />
                        <div className="thumb-box"><img src={galleryImages[0]} alt={`${product.name} colour option`} /></div>
                        <div className="thumb-box"><img src={galleryImages[galleryImages.length > 1 ? 1 : 0]} alt={`${product.name} colour option`} /></div>
                    </div>

                    <div className="change-size">
                        <label><b>Size:</b></label><br />
                        <select defaultValue="M">
                            <option>S</option>
                            <option>M</option>
                            <option>L</option>
                            <option>XL</option>
                            <option>2XL</option>
                        </select>
                    </div>

                    <div className="purchase-actions">
                        <button type="button" className="primary-btn" aria-label="Add to cart" onClick={handleAddToCart}>
                            Add to cart
                        </button>
                        <button type="button" className="secondary-btn" onClick={handleBuyNow} disabled={Number(product.stock) === 0}>
                            Buy now
                        </button>
                    </div>

                    <div className="description">
                        <p>{product.description}</p>
                        <ul>
                            <li>Care Instructions: {specifications.care}</li>
                            <li>Fit Type: {specifications.fit}</li>
                            <li>Color name: {specifications.color}</li>
                            <li>Material: {specifications.material}</li>
                            <li>Pattern: {specifications.pattern}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ProductDetails