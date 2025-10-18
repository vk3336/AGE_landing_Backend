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
        const order = await Order.findById(req.params.id)
            .populate('userId')
            .populate('productId');
            
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
        res.status(404).json({
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
