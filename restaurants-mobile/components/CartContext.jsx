import React, { createContext, useState, useContext, useEffect } from 'react';

import { Alert, Platform } from 'react-native';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const auth = useAuth();

    // Clear cart whenever the auth token changes (login, logout, user switch)
    useEffect(() => {
        setCartItems([]);
    }, [auth?.token]);


    const addToCart = (product) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find(item => (item.id || item._id) === (product.id || product._id));
            
            if (existingItem) {
                return prevItems.map(item => 
                    (item.id || item._id) === (product.id || product._id) 
                        ? { ...item, ...product, quantity: item.quantity + 1 } 
                        : item
                );
            }
            return [...prevItems, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find(item => (item.id || item._id) === productId);
            if (!existingItem) return prevItems;

            if (existingItem.quantity === 1) {
                return prevItems.filter(item => (item.id || item._id) !== productId);
            }
            return prevItems.map(item => 
                (item.id || item._id) === productId 
                    ? { ...item, quantity: item.quantity - 1 } 
                    : item
            );
        });
    };

    const clearCart = () => setCartItems([]);

    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
};