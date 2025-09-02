const express = require('express');
const { auth } = require('../middleware/auth');
const Wishlist = require('../models/Wishlist');

const router = express.Router();

// Get wishlist
router.get('/', auth, async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ user: req.userId }).populate('items');
    
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.userId, items: [] });
      await wishlist.save();
    }
    
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add to wishlist
router.post('/add', auth, async (req, res) => {
  try {
    const { productId } = req.body;
    
    let wishlist = await Wishlist.findOne({ user: req.userId });
    
    if (!wishlist) {
      wishlist = new Wishlist({ user: req.userId, items: [] });
    }
    
    if (!wishlist.items.includes(productId)) {
      wishlist.items.push(productId);
    }
    
    await wishlist.save();
    await wishlist.populate('items');
    
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove from wishlist
router.delete('/remove', auth, async (req, res) => {
  try {
    const { productId } = req.body;
    
    const wishlist = await Wishlist.findOne({ user: req.userId });
    
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }
    
    wishlist.items = wishlist.items.filter(item => item.toString() !== productId);
    
    await wishlist.save();
    await wishlist.populate('items');
    
    res.json(wishlist);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Check if product is in wishlist
router.get('/check', auth, async (req, res) => {
  try {
    const { productId } = req.query;
    
    const wishlist = await Wishlist.findOne({ user: req.userId });
    
    if (!wishlist) {
      return res.json({ isInWishlist: false });
    }
    
    const isInWishlist = wishlist.items.some(item => item.toString() === productId);
    
    res.json({ isInWishlist });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;