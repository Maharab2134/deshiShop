# 🚀 Quick Start Guide - Cloudinary Setup

## Step 1: Get Cloudinary Credentials (2 minutes)
1. Go to https://cloudinary.com/
2. Sign up for FREE account
3. Copy these from Dashboard:
   - Cloud Name
   - API Key
   - API Secret

## Step 2: Add to .env File (1 minute)
Open `/server/.env` and add:
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_API_KEY=your-api-key-here
CLOUDINARY_API_SECRET=your-api-secret-here
```

## Step 3: Restart Server (30 seconds)
```bash
cd server
npm run dev
```

## Step 4: Test Upload (1 minute)
1. Open http://localhost:3000
2. Login as admin
3. Go to Admin Dashboard
4. Click "Add Product"
5. Click "Upload Image" button
6. Select an image
7. Image uploads automatically!

## ✅ That's It! You're Ready!

## 📖 Need More Help?
- English Guide: `CLOUDINARY_SETUP.md`
- Bangla Guide: `CLOUDINARY_SETUP_BANGLA.md`
- Full Summary: `CLOUDINARY_IMPLEMENTATION_SUMMARY.md`

## 🔥 What You Can Do Now:
✅ Upload product images (up to 5 per product)
✅ Upload category images
✅ Delete uploaded images
✅ Preview images before saving
✅ All images automatically optimized

## 🎯 File Limits:
- Products: 5MB per image, up to 5 images
- Categories: 3MB per image
- Avatars: 2MB per image

## 🆘 Common Issues:
**Image won't upload?**
- Check .env credentials are correct
- Make sure you restarted server
- Check file size (must be under limit)

**"No file uploaded" error?**
- Make sure you selected an image file
- Check file type (JPG, PNG, WEBP, GIF only)

**Need admin access?**
- Make sure you're logged in as admin user
- Check JWT token is valid

---
💡 **Pro Tip**: Check Cloudinary Dashboard to see your uploaded images!
