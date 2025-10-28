const Cart = require('../model/cartModel');

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
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({
                success: false,
                message: 'User ID is required'
            });
        }
        
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
            .populate('productId')
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
// Get cart item by product ID with user and product details
const getCartItemByProductId = async (req, res) => {
    try {
        const { productId } = req.params;
        const { userId } = req.query; // Optional: If you want to filter by user as well

        const query = { productId };
        if (userId) {
            query.userId = userId;
        }

        const cartItem = await Cart.findOne(query)
            .populate('userId') // Populate user details
            .populate('productId') // Populate all product details
            .lean();

        if (!cartItem) {
            let errorMessage = `No cart item found with productId: ${productId}`;
            
            // Add more context to the error message
            if (userId) {
                errorMessage += ` for userId: ${userId}`;
                
                // Check if user exists
                const User = require('../model/userModel');
                const userExists = await User.exists({ _id: userId });
                if (!userExists) {
                    errorMessage += ' (User not found)';
                } else {
                    // Check if user has any items in cart
                    const userCart = await Cart.find({ userId });
                    if (userCart.length === 0) {
                        errorMessage += ' (User has no items in cart)';
                    }
                }
            }

            // Check if product exists in any cart
            const productInAnyCart = await Cart.findOne({ productId });
            if (productInAnyCart) {
                errorMessage += ' (Product exists in another user\'s cart)';
            } else {
                // Check if product exists in products collection
                const Product = require('../model/Product');
                const productExists = await Product.exists({ _id: productId });
                if (!productExists) {
                    errorMessage += ' (Product does not exist in database)';
                }
            }

            return res.status(404).json({
                success: false,
                message: errorMessage,
                details: 'Please verify the product ID and user ID are correct.'
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

module.exports = {
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
    getCartByUserId,
    getCartItemByProductId
};
