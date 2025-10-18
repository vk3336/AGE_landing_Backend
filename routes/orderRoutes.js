const express = require('express');
const orderController = require('../controller/orderController');

const router = express.Router();

// Create a new order
router.post('/', orderController.createOrder);

// Get all orders
router.get('/', orderController.getAllOrders);

// Get orders by user ID
router.get('/user/:userId', orderController.getOrdersByUser);

// Get single order
router.get('/:id', orderController.getOrder);

// Delete an order
router.delete('/:id', orderController.deleteOrder);

module.exports = router;