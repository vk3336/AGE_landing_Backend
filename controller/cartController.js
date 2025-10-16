const Cart = require('../models/cartModel');

// Add to cart or update quantity if item exists
const addToCart = async (req, res) => {
    try {
        const { userId, productId, quantity = 1 } = req.body;

        // Check if item already in cart
        let cartItem = await Cart.findOne({ userId, productId });

        if (cartItem) {
            // Update quantity if item exists
            cartItem.quantity += quantity;
            await cartItem.save();
        } else {
            // Add new item to cart
            cartItem = await Cart.create({
                userId,
                productId,
                quantity
            });
        }

        res.status(201).json({
            success: true,
            data: cartItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity, userId } = req.body;

        const cartItem = await Cart.findOneAndUpdate(
            { userId, productId },
            { quantity },
            { new: true, runValidators: true }
        );

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        res.status(200).json({
            success: true,
            data: cartItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const { userId } = req.body;

        const cartItem = await Cart.findOneAndDelete({ userId, productId });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Item removed from cart',
            data: cartItem
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Clear user's cart
const clearCart = async (req, res) => {
    try {
        const { userId } = req.body;
        
        await Cart.deleteMany({ userId });

        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get user's cart
const getCartByUserId = async (req, res) => {
    try {
        const { userId } = req.params;

        const cartItems = await Cart.find({ userId })
            .populate('productId', 'name price image')
            .lean();

        // Calculate total price
        const cartTotal = cartItems.reduce((total, item) => {
            return total + (item.quantity * (item.productId?.price || 0));
        }, 0);

        res.status(200).json({
            success: true,
            data: {
                items: cartItems,
                totalItems: cartItems.length,
                cartTotal
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartByUserId
};
