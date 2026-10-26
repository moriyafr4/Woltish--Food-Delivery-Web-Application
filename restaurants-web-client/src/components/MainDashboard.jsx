import React, { useState, useEffect } from 'react';
import Navbar from './navbar';
import './MainDashboard.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function MainDashboard() {
    const { theme, toggleTheme, user } = useAuth();
    const [items, setItems] = useState([]);
    
    const closeToYouItems = user?.lat && user?.lng 
        ? items.filter(r => String(r.lat) === String(user.lat) && String(r.lng) === String(user.lng))
        : [];
    const [showOrders, setShowOrders] = useState(false);
    const [orders, setOrders] = useState([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    const navigate = useNavigate();

    // Fetch restaurants
    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/restaurants', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) throw new Error('Network response was not ok');
                const data = await response.json();
                const fetchedRestaurants = Array.isArray(data) ? data : data.restaurants ?? [];
                
                setItems(fetchedRestaurants);
            } catch (error) {
                console.error("Failed to fetch restaurants:", error);
            }
        };
        fetchRestaurants();
    }, []);
    // Fetch orders when panel opens
    const handleOrdersClick = async () => {
        setShowOrders(true);
        setOrdersLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Failed to fetch orders');
            const data = await response.json();
            setOrders(Array.isArray(data) ? data : data.orders ?? []);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setOrdersLoading(false);
        }
    };

    return (
        <div>
            <Navbar 
                toggleTheme={toggleTheme} 
                theme={theme} 
                onOrdersClick={handleOrdersClick} 
            />
            {showOrders && (
                <div className="orders-overlay" onClick={() => setShowOrders(false)}>
                    <div className="orders-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="orders-panel-header">
                            <h2>My Orders</h2>
                            <button className="orders-close-btn" onClick={() => setShowOrders(false)}>✕</button>
                        </div>
                        {ordersLoading ? (
                            <p className="orders-loading">Loading your orders…</p>
                        ) : orders.length === 0 ? (
                            <div className="orders-empty">
                                <span style={{ fontSize: 40 }}>🛍️</span>
                                <p>No orders yet. Time to eat!</p>
                            </div>
                        ) : (
                            <div className="orders-list">
                                {orders.map((order) => (
                                    <div key={order._id || order.id} className="order-card">
                                        <div className="order-card-header">
                                            <span className="order-restaurant">{order.restaurantName || 'Restaurant'}</span>
                                            <span className={`order-status order-status--${order.status}`}>{order.status}</span>
                                        </div>
                                        <p className="order-date">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        <p className="order-total">Total: ₪{order.totalPrice ?? order.total ?? '—'}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="dashboard-hero">
                <div className="hero-content">
                    <h1 className="hero-title">Discover Restaurants</h1>
                    <p className="hero-subtitle">Order from the best local restaurants around you, delivered straight to your door.</p>
                    <p className="hero-tagline">Bringing you the tastiest options nearby...</p>
                </div>
                
                <div className="hero-images">
                    <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=80" alt="Pizza" className="floating-food pic-1" />
                    <img src="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80" alt="Burger" className="floating-food pic-2" />
                </div>
            </div>

            <div className="dashboard-container">
                <div className="carousel-section">
                    <h2 className="carousel-title">Restaurants</h2>
                    {items.length === 0 ? (
                        <p className="loading-message">Bringing you the tastiest options nearby...</p>
                    ) : (
                        <div className="carousel-wrapper">
                            <button 
                                className="carousel-btn left" 
                                onClick={() => {
                                    document.getElementById('restaurant-carousel').scrollBy({ left: -300, behavior: 'smooth' });
                                }}
                            >
                                ‹
                            </button>
                            
                            <div className="carousel-track" id="restaurant-carousel">
                                {items.map((item) => ( 
                                    <div key={item.id || item._id} className="catalog-item"
                                     onClick={() => navigate(`/restaurant/${item.id || item._id}`)}>
                                        
                                        {item.imageUrl ? (
                                            <div className="item-image" style={{ backgroundImage: `url(${item.imageUrl})` }}></div>
                                        ) : (
                                            <div className="item-image-placeholder">🍔</div>
                                        )}
                                        
                                        <div className="item-content">
                                            <div>
                                                <h3 className="item-title">{item.name}</h3>
                                                <p className="item-description">{item.description}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button 
                                className="carousel-btn right" 
                                onClick={() => {
                                    document.getElementById('restaurant-carousel').scrollBy({ left: 300, behavior: 'smooth' });
                                }}
                            >
                                ›
                            </button>
                        </div>
                    )}
                </div>

                {user && user.role !== 'owner' && user.lat && user.lng && (
                    <div className="carousel-section" style={{ marginTop: '40px' }}>
                        <h2 className="carousel-title">Close to You</h2>
                        {closeToYouItems.length === 0 ? (
                            <p className="loading-message" style={{ paddingLeft: '8px', color: 'var(--text-secondary)' }}>No exact matches for your coordinates yet...</p>
                        ) : (
                            <div className="carousel-wrapper">
                                <button 
                                    className="carousel-btn left" 
                                    onClick={() => {
                                        document.getElementById('closetoyou-carousel').scrollBy({ left: -336, behavior: 'smooth' });
                                    }}
                                >
                                    ‹
                                </button>
                                
                                <div className="carousel-track" id="closetoyou-carousel">
                                    {closeToYouItems.map((item) => ( 
                                        <div key={item.id || item._id} className="catalog-item"
                                         onClick={() => navigate(`/restaurant/${item.id || item._id}`)}>
                                            
                                            {item.imageUrl ? (
                                                <div className="item-image" style={{ backgroundImage: `url(${item.imageUrl})` }}></div>
                                            ) : (
                                                <div className="item-image-placeholder">🍔</div>
                                            )}
                                            
                                            <div className="item-content">
                                                <div>
                                                    <h3 className="item-title">{item.name}</h3>
                                                    <p className="item-description">{item.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <button 
                                    className="carousel-btn right" 
                                    onClick={() => {
                                        document.getElementById('closetoyou-carousel').scrollBy({ left: 336, behavior: 'smooth' });
                                    }}
                                >
                                    ›
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
}

export default MainDashboard;