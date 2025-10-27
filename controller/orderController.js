const Order = require('../model/orderModel');

// Create a new order
exports.createOrder = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            country = '',
            streetAddress = '',
            city = '',
            postcode = '',
            phone,
            email,
            shippingInstructions = '',
            total,
            userId,
            productId,
            quantity,
            price,
            payment = 'cod',
            discount = 0,
            shipping = 'standard',
            shippingCost = 0
        } = req.body;

        const order = await Order.create({
            firstName,
            lastName,
            country,
            streetAddress,
            city,
            postcode,
            phone,
            email,
            shippingInstructions,
            total,
            userId,
            productId,
            quantity,
            price,
            payment,
            discount,
            shipping,
            shippingCost
        });

        res.status(201).json({
            status: 'success',
            data: {
                order
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Get all orders
exports.getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().populate('userId').populate('productId');
        
        res.status(200).json({
            status: 'success',
            results: orders.length,
            data: {
                orders
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Get orders by user ID
exports.getOrdersByUser = async (req, res) => {
    try {
        const orders = await Order.find({ userId: req.params.userId })
            .populate('userId')
            .populate('productId');
            
        res.status(200).json({
            status: 'success',
            results: orders.length,
            data: {
                orders
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Get single order
exports.getOrder = async (req, res) => {
    try {
        // Find the order and populate necessary fields
        const order = await Order.findById(req.params.id)
            .populate('userId')
            .populate({
                path: 'productId',
                model: 'Product'
            });
            
        if (!order) {
            return res.status(404).json({
                status: 'fail',
                message: 'No order found with that ID'
            });
        }

        // Transform the order data to match frontend expectations
        const formattedOrder = {
            ...order._doc,
            // Map products to the expected format
            products: order.productId ? order.productId.map((product, index) => ({
                _id: product?._id || `unknown-${index}`,
                name: product?.name || 'Product',
                price: order.price?.[index] || product?.price || 0,
                quantity: order.quantity?.[index] || 1,
                total: (order.price?.[index] || product?.price || 0) * (order.quantity?.[index] || 1),
                image1: product?.images?.[0] || product?.image1 || '',
                img: product?.images?.[0] || product?.image1 || '',
                images: product?.images || [],
                color: product?.color || [],
                size: product?.size || '',
                sku: product?.sku || ''
            })) : []
        };
        
        res.status(200).json({
            status: 'success',
            data: {
                order: formattedOrder
            }
        });
    } catch (err) {
        console.error('Error fetching order:', err);
        res.status(500).json({
            status: 'error',
            message: 'An error occurred while fetching the order',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

// Update an order
exports.updateOrder = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            country,
            streetAddress,
            city,
            postcode,
            phone,
            email,
            shippingInstructions,
            total,
            payment,
            paymentStatus,
            discount,
            shipping,
            shippingCost
        } = req.body;

        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
                firstName,
                lastName,
                country,
                streetAddress,
                city,
                postcode,
                phone,
                email,
                shippingInstructions,
                total,
                payment,
                paymentStatus,
                discount,
                shipping,
                shippingCost
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!order) {
            return res.status(404).json({
                status: 'fail',
                message: 'No order found with that ID'
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                order
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

// Delete an order
exports.deleteOrder = async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);

        if (!order) {
            return res.status(404).json({
                status: 'fail',
                message: 'No order found with that ID'
            });
        }

        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};
