const express = require('express');
const router = express.Router();
const { 
    addToCart, 
    updateCartItem, 
    removeFromCart, 
    clearCart, 
    getCartByUserId,
    getCartItemByProductId
} = require('../controller/cartController');

// Add item to cart
router.post('/add', addToCart);

// Update cart item quantity
router.put('/update/:productId', updateCartItem);

// Remove item from cart
router.delete('/remove/:productId', removeFromCart);

// Clear user's cart
router.delete('/clear/:userId', clearCart);

// Get user's cart
router.get('/user/:userId', getCartByUserId);

// Get cart product by product ID (optionally filtered by user)
// Example: /product/123?userId=456
router.get('/product/:productId', getCartItemByProductId);

module.exports = router;
