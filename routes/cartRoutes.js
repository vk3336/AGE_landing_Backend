const express = require('express');
const router = express.Router();
const { 
    addToCart, 
    updateCartItem, 
    removeFromCart, 
    clearCart, 
    getCartByUserId 
} = require('../controller/cartController');

// Add item to cart
router.post('/add', addToCart);

// Update cart item quantity
router.put('/update/:productId', updateCartItem);

// Remove item from cart
router.delete('/remove/:productId', removeFromCart);

// Clear user's cart
router.delete('/clear', clearCart);

// Get user's cart
router.get('/user/:userId', getCartByUserId);

module.exports = router;
