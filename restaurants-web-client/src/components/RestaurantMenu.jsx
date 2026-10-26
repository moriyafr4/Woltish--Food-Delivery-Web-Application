import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from './CartContext';
import './RestaurantMenu.css';
import Navbar from './navbar';
import { useAuth } from './AuthContext';

function RestaurantMenu() {
    const { id } = useParams(); // Extract restaurant ID from URL
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // State for the full restaurant object
    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);

    // Pull the cart functions and state from the custom hook
    const { cartItems, addToCart, removeFromCart, clearCart, cartTotal } = useCart();

    useEffect(() => {
        const fetchRestaurantData = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { 'Content-Type': 'application/json' };
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
                
                // Fetch the specific restaurant directly from the server
                const response = await fetch(`/api/restaurants/${id}`, {
                    method: 'GET',
                    headers: headers 
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch restaurant data');
                }

                const data = await response.json();
                setRestaurant(data);
            } catch (error) {
                console.error("Error loading restaurant:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurantData();
    }, [id]);

    // Handle the order placement process
    const handleCheckout = async () => {
        if (cartItems.length === 0) return;

        const token = localStorage.getItem('token');

        if (!token) {
            alert('Please log in or register to place your order! 🔒');
            // Send the user to the login page
            navigate('/login'); 
            return; // Stop the function from sending a request
        }

        try {
            
            
            // Build the payload exactly as the backend Order model expects
            const orderPayload = {
                restaurantId: id,           
                products: cartItems,        
                totalPrice: cartTotal       
                // userId is typically extracted from the JWT token by your backend controller
            };

            // Send a POST request to your server's orders route
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderPayload)
            });

            if (!response.ok) {
                throw new Error('Failed to place order');
            }

            alert('Order placed successfully! 🍔🚚');
            clearCart(); // Clear the cart upon successful order
            navigate('/dashboard'); // Navigate back to the main dashboard

        } catch (error) {
            console.error('Checkout error:', error);
            alert('Failed to place order. Please try again.');
        }
    };

    if (loading) {
    return (
        <div>
            <Navbar />
            <div className="menu-page">
                <p className="loading-text">Loading restaurant details...</p>
            </div>
        </div>
    );
    }   

    if (!restaurant) {
    return (
        <div>
            <Navbar />
            <div className="menu-page">
                <button className="back-btn" onClick={() => navigate('/dashboard')}>← Back</button>
                <p className="no-items">Restaurant not found.</p>
            </div>
        </div>
    );
}


    // Set banner background image or a default gradient
    const bannerStyle = restaurant.imageUrl 
        ? { backgroundImage: `url(${restaurant.imageUrl})` }
        : { background: 'linear-gradient(135deg, #00c2e8 0%, #00a4c5 100%)' };

    return (
    <div>
        <Navbar />
        <div>
        <div className="menu-page">
            <button className="back-btn" onClick={() => navigate('/dashboard')}>
                ← Back to Restaurants
            </button>

            {/* Top Banner with restaurant details */}
            <div className="restaurant-header">
                <div className="restaurant-banner" style={bannerStyle}></div>
                <div className="restaurant-info-card">
                    <div className="info-header">
                        <h1 className="restaurant-name">{restaurant.name}</h1>
                        {restaurant.category && <span className="category-badge">{restaurant.category}</span>}
                    </div>
                    {user && user.userId === restaurant.ownerId && (
                            <button 
                                onClick={() => navigate(`/manage-restaurant/${restaurant.id || restaurant._id}`)}
                                style={{
                                    backgroundColor: '#e0f2fe',
                                    color: '#0284c7',
                                    border: 'none',
                                    padding: '10px 20px',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                                }}
                            >
                                Edit Menu ✏️
                            </button>
                        )}
                    <p className="restaurant-desc">{restaurant.description}</p>
                    
                    <div className="restaurant-meta">
                        {restaurant.address && <span>📍 {restaurant.address}</span>}
                        {restaurant.phone && <span>📞 {restaurant.phone}</span>}
                    </div>
                </div>
            </div>

            {/* Main Content: Menu List and Cart Sidebar */}
            <div className="menu-container" style={{ display: 'flex', gap: '30px' }}>
                
                {/* Left side - The menu list */}
                <div className="menu-list" style={{ flex: '2' }}>
                    <h2 className="menu-title">Menu</h2>
                    {!restaurant.products || restaurant.products.length === 0 ? (
                        <p className="no-items">No products found for this restaurant yet.</p>
                    ) : (
                        <div className="menu-grid">
                            {restaurant.products.map((product) => (
                                <div key={product.id || product._id} className="menu-card">
                                    <div className="menu-card-body">
                                        <h3 className="product-name">{product.name}</h3>
                                        <p className="product-description">{product.description}</p>
                                        <span className="product-price">₪{product.price}</span>
                                    </div>
                                    {/* Connect the addToCart function to the button */}
                                    {user?.role !== 'owner' ? (
                                    <button 
                                        className="add-to-cart-btn"
                                        onClick={() => addToCart(product)}
                                    >
                                        + Add
                                    </button>
                                    ) : null}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right side - Floating Cart Sidebar */}
                {cartItems.length > 0 && user?.role !== 'owner' && (
                    <div className="cart-sidebar" style={{
                        flex: '1', backgroundColor: 'var(--surface-color)', color: 'var(--text-primary)', padding: '25px', 
                        borderRadius: '16px', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border-color)',
                        height: 'fit-content', position: 'sticky', top: '20px'
                    }}>
                        <h3 style={{ marginTop: 0, fontSize: '1.5rem', color: 'var(--text-primary)' }}>Your Order</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                            {cartItems.map((item) => (
                                <div key={item.id || item._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong style={{ display: 'block' }}>{item.name}</strong>
                                        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>₪{item.price} x {item.quantity}</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button onClick={() => removeFromCart(item.id || item._id)} style={{ padding: '4px 8px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', cursor: 'pointer' }}>-</button>
                                        <button onClick={() => addToCart(item)} style={{ padding: '4px 8px', borderRadius: '5px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-primary)', cursor: 'pointer' }}>+</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', marginBottom: '20px' }}/>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '20px' }}>
                            <span>Total:</span>
                            <span>₪{cartTotal.toFixed(2)}</span>
                        </div>
                        <button 
                            onClick={handleCheckout}
                            style={{ 
                                width: '100%', padding: '15px', backgroundColor: '#00c2e8', 
                                color: 'white', border: 'none', borderRadius: '10px', 
                                fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' 
                            }}
                        >
                            Checkout 🚀
                        </button>
                    </div>
                )}
            </div>
        </div>
    </div>
        </div>
    );
}

export default RestaurantMenu;