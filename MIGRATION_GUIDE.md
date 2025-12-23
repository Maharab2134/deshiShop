# 📦 Data Migration Guide - Old Images to Cloudinary

If you have existing products with image URLs (string format), this guide will help you migrate them to Cloudinary.

## 🔄 Backward Compatibility

**Good News!** Your implementation is already backward compatible. You don't need to migrate immediately!

### How it works:
- **Old format**: `images: ["https://example.com/image.jpg"]`
- **New format**: `images: [{ url: "https://...", publicId: "..." }]`
- **Helper functions handle both formats automatically**

## 🎯 Migration Options

### Option 1: Gradual Migration (Recommended)
Leave old products as-is. New products will use Cloudinary automatically. Old products will continue working.

**Pros:**
- ✅ No immediate action needed
- ✅ No downtime
- ✅ Works immediately

**Cons:**
- ⚠️ Mixed format in database

### Option 2: Manual Migration
Edit each product in Admin Dashboard and re-upload images.

**Steps:**
1. Login as admin
2. Go to Admin Dashboard → Products
3. Click "Edit" on each product
4. Upload new images from Cloudinary
5. Save product

**Pros:**
- ✅ You can improve image quality
- ✅ Simple and safe
- ✅ No coding required

**Cons:**
- ⚠️ Time consuming for many products
- ⚠️ Manual work

### Option 3: Automated Migration Script
Use a script to migrate all existing images to Cloudinary.

**Warning:** This requires programming knowledge and testing!

## 🛠️ Automated Migration Script (Advanced)

Create a file `/server/migrateImagesToCloudinary.js`:

```javascript
const mongoose = require('mongoose');
const axios = require('axios');
const FormData = require('form-data');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

async function downloadImage(url) {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data);
  } catch (error) {
    console.error('Error downloading image:', error.message);
    return null;
  }
}

async function uploadToCloudinary(imageBuffer, filename) {
  const cloudinary = require('cloudinary').v2;
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'deshishop/products',
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    uploadStream.end(imageBuffer);
  });
}

async function migrateProductImages() {
  try {
    const products = await Product.find({});
    console.log(`Found ${products.length} products to check`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const product of products) {
      try {
        // Skip if already in new format
        if (product.images && product.images.length > 0 && 
            typeof product.images[0] === 'object' && 
            product.images[0].url) {
          console.log(`Skipping ${product.name} - already in new format`);
          skippedCount++;
          continue;
        }

        // Skip if no images
        if (!product.images || product.images.length === 0) {
          console.log(`Skipping ${product.name} - no images`);
          skippedCount++;
          continue;
        }

        console.log(`Migrating ${product.name}...`);
        const newImages = [];

        for (const imageUrl of product.images) {
          // Skip if already string is empty or invalid
          if (!imageUrl || typeof imageUrl !== 'string') {
            continue;
          }

          // Download image
          console.log(`  Downloading: ${imageUrl}`);
          const imageBuffer = await downloadImage(imageUrl);
          
          if (!imageBuffer) {
            console.log(`  Failed to download, keeping original URL`);
            newImages.push({ url: imageUrl, publicId: '' });
            continue;
          }

          // Upload to Cloudinary
          console.log(`  Uploading to Cloudinary...`);
          const result = await uploadToCloudinary(
            imageBuffer, 
            `${product._id}_${Date.now()}`
          );

          newImages.push({
            url: result.secure_url,
            publicId: result.public_id
          });

          console.log(`  ✅ Uploaded successfully`);
        }

        // Update product
        product.images = newImages;
        await product.save();
        
        console.log(`✅ Migrated ${product.name} (${newImages.length} images)`);
        migratedCount++;

      } catch (error) {
        console.error(`❌ Error migrating ${product.name}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n=== Migration Complete ===');
    console.log(`✅ Migrated: ${migratedCount}`);
    console.log(`⏭️  Skipped: ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);

  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run migration
migrateProductImages();
```

### To run the migration script:

1. **Install form-data package** (if not already installed):
   ```bash
   cd server
   npm install form-data
   ```

2. **Run the script**:
   ```bash
   node migrateImagesToCloudinary.js
   ```

3. **Monitor the output** - it will show progress for each product

4. **Verify results**:
   - Check Cloudinary Dashboard for uploaded images
   - Check MongoDB - products should have new image format
   - Test frontend - images should display correctly

## ⚠️ Important Notes for Migration

### Before Running Script:
1. **Backup your database!**
   ```bash
   mongodump --uri="your-mongodb-uri" --out=./backup
   ```

2. **Test on a few products first**
   - Modify script to limit: `const products = await Product.find({}).limit(5);`

3. **Ensure Cloudinary credentials are set**
   - Check `.env` file has all three values

4. **Check your Cloudinary plan limits**
   - Free plan: 25GB storage, 25GB bandwidth/month
   - Make sure you have enough space

### During Migration:
- Don't stop the script mid-way
- Monitor for errors in console
- Check Cloudinary Dashboard for uploads
- Keep internet connection stable

### After Migration:
- Test products on frontend
- Verify images display correctly
- Check database structure
- Test image upload for new products
- Verify image delete works

## 🔍 Verification Queries

### Check which products need migration:
```javascript
// In MongoDB shell or Compass
db.products.find({
  "images.0": { $type: "string" }
}).count()
```

### Check migrated products:
```javascript
// In MongoDB shell or Compass
db.products.find({
  "images.0.url": { $exists: true }
}).count()
```

## 🆘 Troubleshooting Migration

### "Failed to download" errors
- Old URL might be broken or expired
- Script will keep original URL as fallback
- Manually re-upload these images later

### "Upload failed" errors
- Check Cloudinary credentials
- Check internet connection
- Check Cloudinary plan limits
- Wait a bit and retry

### "Out of memory" errors
- Process images in smaller batches
- Add limit to query: `.limit(10)`
- Run script multiple times

## 📊 Recommended Approach

### For Small Projects (<100 products):
✅ **Manual Migration** (Option 2)
- Safest approach
- No risk
- Quality control

### For Medium Projects (100-1000 products):
✅ **Gradual Migration** (Option 1)
- Keep old products as-is
- New products use Cloudinary
- Manually migrate important products

### For Large Projects (>1000 products):
✅ **Automated Script** (Option 3)
- Test thoroughly first
- Backup database
- Run during low traffic
- Monitor closely

## ✅ Success Checklist
- [ ] Database backed up
- [ ] Migration approach chosen
- [ ] Cloudinary credentials verified
- [ ] Test migration on sample products
- [ ] Full migration completed
- [ ] Frontend tested
- [ ] Image upload tested
- [ ] Image delete tested
- [ ] Backup old database kept for safety

---
**Remember**: The helper functions make migration optional. Your app works with both formats! 🎉
