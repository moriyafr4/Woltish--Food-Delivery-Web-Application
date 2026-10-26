import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import MainDashboard from './components/MainDashboard';
import Login from './components/Login';
import Register from './components/Register';
import { AuthProvider } from './components/AuthContext';
import { CartProvider } from './components/CartContext'; // Import the newly created CartProvider
import RestaurantMenu from './components/RestaurantMenu';
import OrderHistory from './components/OrderHistory';
import AddRestaurant from './components/AddRestaurant';
import MyRestaurants from './components/MyRestaurants';
import ManageRestaurant from './components/ManageRestaurant';

const ProtectedRoute = ({ children }) => {
    // Fetch the token the user get
    const token = localStorage.getItem('token'); 
    
    // If there is no token go to the login page
    if (!token) {
        return <Navigate to="/login" replace />;
    }
    
    // If he got a token, go to the main dashboard
    return children;
};

const CustomerRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/login" replace />;
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role === 'owner') return <Navigate to="/dashboard" replace />;
    return children;
};

const OwnerRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token) return <Navigate to="/login" replace />;
    
    // Decode JWT to check role
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.role !== 'owner') return <Navigate to="/dashboard" replace />;
    
    return children;
};


function App() {
    return (
        // Get the provider for all screens can get to the user data
        <AuthProvider>
          <CartProvider>
            <Router>
                <div className="App">
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/dashboard" element={<MainDashboard />} />
                        <Route path="/restaurant/:id" element={<RestaurantMenu />} />
                        <Route path="/orders" element={<CustomerRoute><OrderHistory /></CustomerRoute>} />
                        <Route path="/add-restaurant" element={<OwnerRoute><AddRestaurant /></OwnerRoute>} />
                        <Route path="/my-restaurants" element={<OwnerRoute><MyRestaurants /></OwnerRoute>} />
                        <Route path="/manage-restaurant/:id" element={<OwnerRoute><ManageRestaurant /></OwnerRoute>} />
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                </div>
            </Router>
          </CartProvider>
        </AuthProvider>
    );
}

export default App;