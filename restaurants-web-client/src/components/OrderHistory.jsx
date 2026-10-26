import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderHistory.css';
import Navbar from './navbar';

function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMyOrders = async () => {
            const token = localStorage.getItem('token');
            
            
            try {
                // Try to get all the orders from the server
                const response = await fetch('/api/orders', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch orders');
                }

                const data = await response.json();
                
                // Set the array as the new orders first
                setOrders(data.reverse());
            } catch (error) {
                console.error("Error loading orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyOrders();
    }, [navigate]);
        if (loading) {
            return (
                <div>
                    <Navbar />
                    <div className="orders-page">
                        <p className="loading-text">Loading your orders...</p>
                    </div>
                </div>
            );
        }

    return (
        <div>
            <Navbar />
        <div className="orders-page">
            <div className="orders-container">
                <h1 className="orders-title">My Orders</h1>
                <p className="orders-subtitle">Past orders and receipts</p>

                {orders.length === 0 ? (
                    <div className="no-orders">
                        <span className="no-orders-icon">🧾</span>
                        <h2>No orders yet</h2>
                        <p>When you place an order, it will appear here.</p>
                        <button className="start-ordering-btn" onClick={() => navigate('/dashboard')}>
                            Start Ordering
                        </button>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map(order => (
                        <div key={order.id || order._id} className="order-card">
    <div className="order-header">
        <div className="order-meta">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                {order.restaurantImage && (
                    <img 
                        src={order.restaurantImage} 
                        alt={order.restaurantName}
                        style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }}
                    />
                )}
                <h3 style={{ margin: 0, fontSize: '1.2rem' }}>
                    {order.restaurantName || 'Restaurant'}
                </h3>
            </div>
            <span className="order-date">
                {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent Order'}
            </span>
        </div>
        <h2 className="order-total">₪{order.totalPrice?.toFixed(2)}</h2>
    </div>
    <div className="order-items">
        {order.products && order.products.map((item, index) => (
            <div key={index} className="order-item-row">
                <span className="item-quantity">{item.quantity}x</span>
                <span className="item-name">{item.name}</span>
            </div>
        ))}
    </div>
</div>
))}
                    </div>
                )}
            </div>
        </div>
        </div>
    );
}

export default OrderHistory;