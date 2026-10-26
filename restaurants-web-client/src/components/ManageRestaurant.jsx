import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './navbar';
import './ManageRestaurant.css';

function ManageRestaurant() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [restaurant, setRestaurant] = useState(null);
    const [productName, setProductName] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productDescription, setProductDescription] = useState('');

    const [editingProductId, setEditingProductId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', description: '', price: '' });

    const fetchRestaurant = useCallback(async () => {
        try {
            const response = await fetch(`/api/restaurants/${id}`);
            if (!response.ok) throw new Error('Failed to fetch');
            const data = await response.json();
            setRestaurant(data);
        } catch (error) {
            console.error("Error fetching restaurant:", error);
        }
    }, [id]);

    useEffect(() => {
        fetchRestaurant();
    }, [fetchRestaurant]);

    // Add product
    const handleAddProduct = async () => {
        if (!productName.trim() || !productPrice || isNaN(productPrice)) {
            alert('Please enter a valid product name and price.');
            return;
        }

        const newProduct = {
            name: productName,
            price: Number(productPrice),
            description: productDescription
        };

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/restaurants/${id}/products`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(newProduct)
            });

            if (res.ok) {
                await fetchRestaurant(); 
                setProductName(''); 
                setProductPrice('');
                setProductDescription('');
            } else {
                alert('Failed to add product');
            }
        } catch (error) {
            console.error("Error adding product:", error);
        }
    };

    const startEditing = (product) => {
        setEditingProductId(product._id || product.id);
        setEditForm({
            name: product.name,
            description: product.description || '',
            price: product.price
        });
    }

    // Delete Product
    const handleDeleteProduct = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/restaurants/${id}/products/${productId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                await fetchRestaurant(); 
            }
        } catch (error) {
            console.error("Error deleting product:", error);
        }
    };

    // Save edit on the server
    const handleSaveEdit = async (productId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`/api/restaurants/${id}/products/${productId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(editForm)
            });

            if (res.ok) {
                await fetchRestaurant(); 
                setEditingProductId(null); 
            } else {
                alert('Failed to update product');
            }
        } catch (error) {
            console.error("Error updating product:", error);
        }
    };
    const handleCompleteSetup = async () => {
        if (productName.trim() || productPrice) {
            if (!productName.trim() || !productPrice || isNaN(productPrice)) {
                alert('You have unsaved product data. Please enter a valid product name and price to add it, or clear the fields before completing setup.');
                return;
            }
            // Await adding the product before navigating away
            await handleAddProduct();
        }
        navigate('/dashboard');
    };

    if (!restaurant) return <div>Loading...</div>;

    return (
        <div className="manage-page">
            <Navbar />
            <div className="manage-container">
                 <div className="manage-header">
                    <h1>Manage {restaurant.name}</h1>
                </div>
                
                <section className="add-product-section">
                    <div className="add-product-inputs">
                    <input 
                        placeholder="Product Name" 
                        value={productName} 
                        onChange={e => setProductName(e.target.value)} 
                    />
                    <input 
                        placeholder="Description (Optional)" 
                        value={productDescription} 
                        onChange={e => setProductDescription(e.target.value)} 
                    />
                    <input 
                        placeholder="Price" 
                        type="number" 
                        value={productPrice} 
                        onChange={e => setProductPrice(e.target.value)} 
                    />
                    </div>
                    <button className="add-btn" onClick={handleAddProduct}>Add Product</button>
                </section>

                {restaurant.products && restaurant.products.length > 0 ? (
                     <ul className="products-list">
                     {restaurant.products.map(p => {
                         const currentId = p._id || p.id;
                         const isEditing = editingProductId === currentId;

                         return (
                             <li key={currentId}>
                                 {isEditing ? (
                                     <div className="edit-product-form">
                                         <input 
                                             value={editForm.name} 
                                             onChange={(e) => setEditForm({...editForm, name: e.target.value})} 
                                             placeholder="Name"
                                         />
                                         <input 
                                             value={editForm.description} 
                                             onChange={(e) => setEditForm({...editForm, description: e.target.value})} 
                                             placeholder="Description"
                                         />
                                         <input 
                                             type="number" 
                                             value={editForm.price} 
                                             onChange={(e) => setEditForm({...editForm, price: e.target.value})} 
                                             placeholder="Price"
                                         />
                                         <div className="edit-actions">
                                             <button className="save-btn" onClick={() => handleSaveEdit(currentId)}>Save</button>
                                             <button className="cancel-btn" onClick={() => setEditingProductId(null)}>Cancel</button>
                                         </div>
                                     </div>
                                 ) : (
                                     <div className="product-view">
                                         <div className="product-info">
                                             <strong>{p.name}</strong>
                                             {p.description && <span className="desc">{p.description}</span>}
                                             <span className="price">₪{p.price}</span>
                                         </div>
                                         <div className="product-actions">
                                             <button className="edit-btn" onClick={() => startEditing(p)}>Edit</button>
                                             <button className="delete-btn" onClick={() => handleDeleteProduct(currentId)}>Delete</button>
                                         </div>
                                     </div>
                                 )}
                             </li>
                         );
                     })}
                 </ul>
                ) : (
                    <p style={{textAlign: 'center', color: 'var(--text-secondary)', marginTop: '30px'}}>No products added yet.</p>
                )}
                <div className="manage-footer">
                    <button className="complete-btn" onClick={handleCompleteSetup}>
                        Complete Setup ✅
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ManageRestaurant;