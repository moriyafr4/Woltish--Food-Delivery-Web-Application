import React, { createContext, useState, useContext } from 'react';

// Create the Context
const CartContext = createContext();

// Custom Hook to easily use the cart from any component
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // Add a product to the cart
    const addToCart = (product) => {
        setCartItems((prevItems) => {
            // Check if the product already exists in the cart
            const existingItem = prevItems.find(item => (item.id || item._id) === (product.id || product._id));
            
            if (existingItem) {
                // If it exists, increment the quantity by 1
                return prevItems.map(item => 
                    (item.id || item._id) === (product.id || product._id) 
                        ? { ...item, quantity: item.quantity + 1 } 
                        : item
                );
            }
            // If it doesn't exist, add it with an initial quantity of 1
            return [...prevItems, { ...product, quantity: 1 }];
        });
    };

    // Remove a product from the cart or decrease its quantity
    const removeFromCart = (productId) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find(item => (item.id || item._id) === productId);
            if (existingItem.quantity === 1) {
                // Remove the item completely if quantity reaches 0
                return prevItems.filter(item => (item.id || item._id) !== productId);
            }
            // Otherwise, decrement the quantity by 1
            return prevItems.map(item => 
                (item.id || item._id) === productId 
                    ? { ...item, quantity: item.quantity - 1 } 
                    : item
            );
        });
    };

    // Clear the cart (e.g., after a successful checkout)
    const clearCart = () => setCartItems([]);

    // Calculate the total price of the cart
    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, cartTotal }}>
            {children}
        </CartContext.Provider>
    );
};