const express = require('express');
const Order = require('../models/Order');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Process payment
router.post('/process', auth, async (req, res) => {
  try {
    const { orderId, paymentMethod, transactionId } = req.body;
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check if user owns this order
    if (order.user.toString() !== req.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Update order with payment information
    order.paymentMethod = paymentMethod;
    order.transactionId = transactionId;
    order.paymentStatus = 'completed';
    
    await order.save();
    
    res.json({ message: 'Payment processed successfully', order });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// bKash payment callback
router.post('/bkash/callback', async (req, res) => {
  try {
    // This would handle bKash payment callbacks in a real implementation
    // For demo purposes, we'll just log the data
    console.log('bKash callback received:', req.body);
    
    res.json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;