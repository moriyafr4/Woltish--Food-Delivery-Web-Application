import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import './AddRestaurant.css';

function AddRestaurant() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        city: '',
        lat: '',
        lng: '',
        phone: '',
        category: '',
        customCategory: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
            setError('You must be logged in to add a restaurant.');
            setLoading(false);
            return;
        }

        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('description', formData.description);
            submitData.append('address', formData.city);
            submitData.append('lat', formData.lat);
            submitData.append('lng', formData.lng);
            submitData.append('phone', formData.phone);
            submitData.append('category', formData.category === 'Other' ? formData.customCategory : formData.category);

            if (imageFile) {
                submitData.append('image', imageFile);
            }

            const response = await fetch('/api/restaurants', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: submitData
            });

            if (!response.ok) {
                throw new Error('Failed to create restaurant. Please try again.');
            }

            setSuccess(true);

            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="add-restaurant-page">
            <Navbar />
            <div className="add-restaurant-container">
                <button className="back-btn" onClick={() => navigate('/dashboard')}>
                    ← Back to Dashboard
                </button>

                <div className="form-card">
                    <h2>Add a New Restaurant 🍽️</h2>
                    <p className="form-subtitle">Join the Woltish platform and reach more hungry customers!</p>

                    {success ? (
                        <div className="success-message">
                            <h3>Restaurant added successfully! 🎉</h3>
                            <p>Redirecting to dashboard...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="restaurant-form">
                            {error && <div className="error-message">{error}</div>}

                            <div className="avatar-group">
                                <div
                                    className="avatar-picker"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Preview" className="avatar-preview" />
                                    ) : (
                                        <span className="avatar-placeholder">Add<br />Cover</span>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                    style={{ display: "none" }}
                                />
                            </div>

                            <div className="form-group">
                                <label>Restaurant Name *</label>
                                <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="e.g. Big Kahuna Burger" />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Category *</label>
                                    <select name="category" value={formData.category} onChange={handleChange} required className="form-select">
                                        <option value="" disabled>Select a category</option>
                                        <option value="Burgers">Burgers</option>
                                        <option value="Pizza">Pizza</option>
                                        <option value="Sushi">Sushi</option>
                                        <option value="Italian">Italian</option>
                                        <option value="Mexican">Mexican</option>
                                        <option value="Vegan">Vegan</option>
                                        <option value="Thai">Thai</option>
                                        <option value="Street Food">Street Food</option>
                                        <option value="Bakery">Bakery</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {formData.category === 'Other' && (
                                        <input type="text" name="customCategory" value={formData.customCategory} onChange={handleChange} required placeholder="Enter custom category" style={{ marginTop: '10px' }} />
                                    )}
                                </div>
                                <div className="form-group">
                                    <label>Phone Number *</label>
                                    <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required placeholder="e.g. 050-1234567" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>City (in Israel) *</label>
                                <input type="text" name="city" value={formData.city} onChange={handleChange} required pattern="[A-Za-z\s\-]+" title="Please enter the city in English letters only" placeholder="e.g. Tel Aviv, Jerusalem" />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Latitude *</label>
                                    <input type="number" step="any" name="lat" value={formData.lat} onChange={handleChange} required min="29" max="34" placeholder="29-34" />
                                </div>
                                <div className="form-group">
                                    <label>Longitude *</label>
                                    <input type="number" step="any" name="lng" value={formData.lng} onChange={handleChange} required min="34" max="36" placeholder="34-36" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} placeholder="Tell customers about your food..." rows="4" />
                            </div>

                            <button type="submit" className="submit-btn" disabled={loading}>
                                {loading ? 'Adding...' : 'Add Restaurant'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AddRestaurant;