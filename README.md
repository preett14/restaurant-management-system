# Restaurant Backend API

A complete backend project for a restaurant system with these features:
- User Authentication (Register/Login)
- View Menu
- Add / Update / Delete Menu (Admin only)
- Place Order
- View My Orders

## Tech Stack
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication

## Project Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from example:
```bash
copy .env.example .env
```

3. Update `.env` values:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/restaurantdb
JWT_SECRET=your_super_secret_key
```

4. Start server:
```bash
npm run dev
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Menu
- `GET /api/menu` - View menu (public)
- `POST /api/menu` - Add menu item (admin)
- `PUT /api/menu/:id` - Update menu item (admin)
- `DELETE /api/menu/:id` - Delete menu item (admin)

### Orders
- `POST /api/orders` - Place order (logged in user)
- `GET /api/orders/my-orders` - View own orders (logged in user)

## Request Examples

### Register
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "123456",
  "role": "admin"
}
```

### Login
```json
{
  "email": "admin@example.com",
  "password": "123456"
}
```

### Create Menu Item (Admin)
```json
{
  "name": "Paneer Tikka",
  "description": "Spicy grilled paneer cubes",
  "price": 280,
  "category": "Starter",
  "isAvailable": true
}
```

### Place Order
```json
{
  "items": [
    {
      "menuItemId": "MENU_ITEM_ID_HERE",
      "quantity": 2
    }
  ]
}
```

## Authorization
For protected routes, pass JWT token in headers:
```bash
Authorization: Bearer <your_token>
```

## Notes
- Create at least one admin account using `role: "admin"` during registration.
- Only admin can manage menu items.
- Users can place orders and view their own order history.
