const express = require('express');
const router = express.Router();
const wishlistController = require('../controller/wishlistController');

// Add product to wishlist
router.post('/add', wishlistController.addToWishlist);

// Get user's wishlist
router.get('/:userId', wishlistController.getWishlist);

// Update wishlist (replace all products)
router.put('/:userId', wishlistController.updateWishlist);

// Delete wishlist
router.delete('/:userId', wishlistController.deleteWishlist);

// Remove product from wishlist
router.delete('/:userId/product/:productId', wishlistController.removeFromWishlist);

module.exports = router;
