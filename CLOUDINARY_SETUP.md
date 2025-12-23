# Cloudinary Image Upload Setup Guide

## Overview
This project now uses **Cloudinary** for all image uploads including:
- Product images (multiple images per product)
- Category images
- User avatars/profile pictures

## Setup Instructions

### 1. Create a Cloudinary Account
1. Visit [Cloudinary](https://cloudinary.com/) and create a free account
2. After signing up, go to your Dashboard
3. You'll see your **Cloud Name**, **API Key**, and **API Secret**

### 2. Configure Environment Variables
Add the following to your `/server/.env` file:

```env
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

Replace the values with your actual Cloudinary credentials from the dashboard.

### 3. Install Dependencies (Already Done)
The following packages have been installed:
- `cloudinary` - Cloudinary SDK
- `multer` - File upload middleware
- `multer-storage-cloudinary` - Multer storage for Cloudinary

### 4. Restart Your Server
```bash
cd server
npm run dev
```

## Features Implemented

### Backend (Server)

#### New Files Created:
1. **`/server/config/cloudinary.js`**
   - Cloudinary configuration
   - Multer setup for different upload types
   - Storage configurations for products, avatars, and categories

2. **`/server/routes/upload.js`**
   - Upload endpoints for images
   - Delete endpoint for removing images
   - Authentication and admin authorization

#### Updated Files:
1. **`/server/index.js`**
   - Added upload route: `/api/upload`

2. **`/server/models/Product.js`**
   - Updated images field to store both URL and publicId:
   ```javascript
   images: [{
     url: String,
     publicId: String
   }]
   ```

3. **`/server/models/User.js`**
   - Added avatar field with Cloudinary structure

4. **`/server/models/Category.js`**
   - Updated image field with Cloudinary structure

### Frontend (Client)

#### New Files Created:
1. **`/client/src/utils/imageHelper.js`**
   - Helper functions to extract image URLs from different formats
   - Backward compatible with old string-based URLs

#### Updated Files:
1. **`/client/src/components/Admin/AdminDashboard.js`**
   - Added image upload functionality in ProductDialog
   - Added image upload functionality in CategoryDialog
   - Upload progress indicators
   - Image preview with delete option
   - Multiple image support for products

## API Endpoints

### Upload Endpoints (Admin Only)

#### Upload Single Product Image
```
POST /api/upload/product
Headers: Authorization: Bearer <token>
Body: FormData with 'image' field
Response: { success: true, imageUrl: string, publicId: string }
```

#### Upload Multiple Product Images
```
POST /api/upload/products
Headers: Authorization: Bearer <token>
Body: FormData with 'images' field (max 5 images)
Response: { success: true, images: [{ imageUrl, publicId }] }
```

#### Upload Category Image
```
POST /api/upload/category
Headers: Authorization: Bearer <token>
Body: FormData with 'image' field
Response: { success: true, imageUrl: string, publicId: string }
```

#### Upload User Avatar (Authenticated Users)
```
POST /api/upload/avatar
Headers: Authorization: Bearer <token>
Body: FormData with 'avatar' field
Response: { success: true, imageUrl: string, publicId: string }
```

#### Delete Image
```
DELETE /api/upload/delete/:publicId
Headers: Authorization: Bearer <token>
Note: Replace '/' in publicId with '--' in the URL
```

## Usage in Admin Dashboard

### Adding a Product with Images:
1. Click "Add Product" button
2. Fill in product details
3. Click "Upload Image" button
4. Select an image file (max 5MB)
5. Image will be uploaded to Cloudinary automatically
6. Preview will appear with delete option
7. You can upload multiple images
8. Click "Create" to save the product

### Adding a Category with Image:
1. Click "Add Category" button
2. Fill in category details
3. Click "Upload Image" button
4. Select an image file (max 3MB)
5. Image will be uploaded to Cloudinary automatically
6. Preview will appear with delete option
7. Click "Create" to save the category

## Image Constraints

- **Product Images**: Max 5MB per image, up to 5 images, resized to max 1000x1000px
- **Category Images**: Max 3MB per image, resized to max 800x800px
- **User Avatars**: Max 2MB per image, resized to 500x500px (face-centered)
- **Allowed Formats**: JPG, JPEG, PNG, WEBP, GIF

## Folder Structure in Cloudinary

Images are organized in Cloudinary folders:
- `deshishop/products/` - Product images
- `deshishop/categories/` - Category images
- `deshishop/avatars/` - User avatars

## Backward Compatibility

The implementation is backward compatible with existing string-based image URLs. The helper functions in `/client/src/utils/imageHelper.js` handle both:
- Old format: `images: ["https://image-url.jpg"]`
- New format: `images: [{ url: "https://...", publicId: "..." }]`

## Testing the Implementation

1. **Start the server**: 
   ```bash
   cd server
   npm run dev
   ```

2. **Start the client**:
   ```bash
   cd client
   npm start
   ```

3. **Login as admin** and navigate to Admin Dashboard

4. **Try uploading a product image**:
   - Click "Add Product"
   - Fill in details
   - Upload an image
   - Check Cloudinary dashboard to see the uploaded image

## Troubleshooting

### Common Issues:

1. **"No file uploaded" error**
   - Ensure file input has `accept="image/*"` attribute
   - Check file size limits

2. **"Failed to upload image"**
   - Verify Cloudinary credentials in `.env` file
   - Check server logs for detailed error messages
   - Ensure internet connection is stable

3. **Images not displaying**
   - Check browser console for errors
   - Verify image URLs in database
   - Ensure Cloudinary URLs are accessible

4. **Authentication errors**
   - Ensure you're logged in as admin
   - Check JWT token validity
   - Verify auth middleware is working

## Security Notes

- All upload endpoints require authentication
- Product and category uploads require admin role
- Image deletion requires admin role
- File types and sizes are validated
- Cloudinary credentials should never be exposed to client

## Next Steps (Optional Enhancements)

1. Add image compression before upload
2. Add drag-and-drop image upload
3. Add bulk image upload
4. Add image cropping/editing functionality
5. Add image optimization settings
6. Implement user avatar upload in profile page

## Support

For Cloudinary documentation, visit: https://cloudinary.com/documentation
For issues, check the server logs and browser console for detailed error messages.
