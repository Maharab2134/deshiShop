# deshiShop

A full-stack e-commerce web application built with the MERN stack (MongoDB, Express, React, Node.js).

## Features
- User authentication (register, login, JWT)
- Product browsing, search, and filtering
- Shopping cart and wishlist
- Order placement and order history
- Admin dashboard for managing products, categories, users, and orders
- **Image upload with Cloudinary** - Upload and manage product, category, and user images
- Responsive UI with Material-UI

## Project Structure
```
client/   # React frontend
server/   # Node.js/Express backend
```

## Getting Started

### Prerequisites
- Node.js & npm
- MongoDB

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/Maharab2134/deshiShop.git
   cd deshiShop
   ```
2. Install server dependencies:
   ```bash
   cd server
   npm install
   ```
3. Install client dependencies:
   ```bash
   cd ../client
   npm install
   ```

### Environment Variables
- Create a `.env` file in the `server/` directory with:
  ```env
  MONGODB_URI=mongodb://localhost:27017/deshishop
  JWT_SECRET=your_jwt_secret
  PORT=5000
  
  # Cloudinary Configuration (Required for image uploads)
  CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
  CLOUDINARY_API_KEY=your_cloudinary_api_key
  CLOUDINARY_API_SECRET=your_cloudinary_api_secret
  ```
- See `server/.env.example` for a template
- **For Cloudinary setup**, refer to [CLOUDINARY_SETUP.md](CLOUDINARY_SETUP.md) for detailed instructions

### Running the App
- Start the backend:
  ```bash
  cd server
  npm run dev
  ```
- Start the frontend:
  ```bash
  cd client
  npm start
  ```
- Visit [http://localhost:3000](http://localhost:3000)

## License
MIT.
