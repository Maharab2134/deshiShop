# deshiShop

A full-stack e-commerce web application built with the MERN stack (MongoDB, Express, React, Node.js).

## Features
- User authentication (register, login, JWT)
- Product browsing, search, and filtering
- Shopping cart and wishlist
- Order placement and order history
- Admin dashboard for managing products, categories, users, and orders
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
  ```

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
