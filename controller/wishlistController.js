const Wishlist = require('../model/Wishlist');

// Add product to wishlist
const addToWishlist = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        
        if (!userId || !productId) {
            return res.status(400).json({ success: false, message: 'User ID and Product ID are required' });
        }

        let wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) {
            // Create new wishlist if it doesn't exist
            wishlist = new Wishlist({
                userId,
                productIds: [productId]
            });
        } else {
            // Add product if not already in wishlist
            if (!wishlist.productIds.includes(productId)) {
                wishlist.productIds.push(productId);
            } else {
                return res.status(400).json({ success: false, message: 'Product already in wishlist' });
            }
        }

        const savedWishlist = await wishlist.save();
        res.status(201).json({ success: true, message: 'Product added to wishlist', data: savedWishlist });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Get user's wishlist
const getWishlist = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const wishlist = await Wishlist.findOne({ userId })
            .populate('productIds', 'name price images')
            .lean();

        if (!wishlist) {
            return res.status(200).json({ success: true, message: 'Wishlist is empty', data: { products: [] } });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Wishlist retrieved successfully', 
            data: { products: wishlist.productIds } 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Update wishlist (replace all products)
const updateWishlist = async (req, res) => {
    try {
        const { userId } = req.params;
        const { productIds } = req.body;

        if (!Array.isArray(productIds)) {
            return res.status(400).json({ success: false, message: 'productIds must be an array' });
        }

        // Remove duplicate product IDs
        const uniqueProductIds = [...new Set(productIds)];

        let wishlist = await Wishlist.findOne({ userId });

        if (!wishlist) {
            // Create new wishlist if it doesn't exist
            wishlist = new Wishlist({
                userId,
                productIds: uniqueProductIds
            });
        } else {
            // Update existing wishlist
            wishlist.productIds = uniqueProductIds;
        }

        const updatedWishlist = await wishlist.save();
        
        // Populate the product details for the response
        const populatedWishlist = await Wishlist.findById(updatedWishlist._id)
            .populate('productIds', 'name price images');

        res.status(200).json({ 
            success: true, 
            message: 'Wishlist updated successfully', 
            data: populatedWishlist 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

// Delete entire wishlist
const deleteWishlist = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const result = await Wishlist.deleteOne({ userId });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: 'Wishlist not found' });
        }
        
        res.status(200).json({ success: true, message: 'Wishlist deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

module.exports = {
    addToWishlist,
    getWishlist,
    updateWishlist,
    deleteWishlist
};
