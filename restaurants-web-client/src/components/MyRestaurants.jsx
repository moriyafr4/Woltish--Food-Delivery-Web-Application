import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import { useAuth } from './AuthContext';
import './MyRestaurants.css';

function MyRestaurants() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [restaurants, setRestaurants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMyRestaurants = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('/api/restaurants/my', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) throw new Error('Failed to fetch restaurants');
                const data = await response.json();
                setRestaurants(data);
            } catch (err) {
                setError('Failed to load your restaurants.');
            } finally {
                setLoading(false);
            }
        };
        fetchMyRestaurants();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this restaurant?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/restaurants/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to delete');
            setRestaurants(prev => prev.filter(r => r.id !== id));
        } catch (err) {
            alert('Failed to delete restaurant.');
        }
    };

    return (
        <div>
            <Navbar />
            <div className="my-restaurants-page">
                <div className="my-restaurants-header">
                    <h1>My Restaurants</h1>
                    <button className="add-btn" onClick={() => navigate('/add-restaurant')}>
                        + Add Restaurant
                    </button>
                </div>

                {loading && <p className="loading-text">Loading...</p>}
                {error && <p className="error-text">{error}</p>}

                {!loading && restaurants.length === 0 && (
                    <div className="empty-state">
                        <span>🍽️</span>
                        <h2>No restaurants yet</h2>
                        <p>Add your first restaurant to get started.</p>
                        <button onClick={() => navigate('/add-restaurant')}>Add Restaurant</button>
                    </div>
                )}

                <div className="restaurants-grid">
                    {restaurants.map(r => (
                        <div key={r.id} className="restaurant-card">
                            {r.imageUrl && (
                                <div className="card-image" style={{ backgroundImage: `url(${r.imageUrl})` }} />
                            )}
                            <div className="card-body">
                                <h3>{r.name}</h3>
                                <p className="card-desc">{r.description}</p>
                            </div>
                            <div className="card-actions">
                                <button className="edit-btn" onClick={() => navigate(`/restaurant/${r.id}`)}>
                                    View
                                </button>
                                <button className="edit-restaurant-btn" onClick={() => navigate(`/manage-restaurant/${r.id || r._id}`)}>
                                    Edit
                                </button>
                                <button className="delete-btn" onClick={() => handleDelete(r.id)}>
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MyRestaurants;