# TimeLux – Luxury Watch E-commerce Website

**TimeLux** is a modern luxury watch e-commerce website designed to provide customers with a premium and convenient online shopping experience.

The website features an elegant dark theme, stylish product displays, shopping cart functionality, and multiple ordering options.

## ✨ Features

### Customer Features
- Modern and responsive luxury-themed design
- Browse men's, women's, and couple watches
- Explore watch brands and collections
- View detailed product information and images
- Search for watches
- Add products to the shopping cart
- Increase or decrease product quantities
- Remove products from the cart
- View product prices and discounts
- Quick Order option
- WhatsApp Order option

### Admin Features
- Admin authentication
- Admin dashboard
- Add new watch products
- Edit existing products
- Manage product information and prices
- Upload product images
- Manage product availability

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| React.js | Frontend development |
| Vite | Development and build tool |
| Tailwind CSS | UI styling |
| React Router | Page navigation |
| Firebase Authentication | User authentication |
| Cloud Firestore | Database |
| Cloudinary | Product image hosting |
| Vercel | Website deployment |
| Git & GitHub | Version control |

## 📁 Project Structure

```text
TimeLux/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   └── main.jsx
│   │
│   ├── package.json
│   └── index.html
│
└── README.md
```

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Open the Frontend Folder

```bash
cd TimeLux/frontend
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file inside the `frontend` folder and add the required Firebase and Cloudinary configuration.

Use your own project credentials. Never upload private credentials or secrets to GitHub.

### 5. Run the Development Server

```bash
npm run dev
```

Open the local URL provided by Vite in your browser.

## 🏗️ Build for Production

```bash
npm run build
```

The production files will be generated inside the `dist` folder.

## 🌐 Deployment

TimeLux can be deployed using **Vercel**.

Recommended Vercel settings:

- Framework Preset: Vite
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

## 🔐 Security

- Firebase Authentication is used for login.
- Admin access should be restricted using verified user roles.
- Firestore Security Rules should protect sensitive data.
- Never expose private keys or secrets in public repositories.

## 🎯 Project Goal

The goal of TimeLux is to create a professional online shopping platform where customers can explore luxury watches, manage their carts, and place orders conveniently.

---

**TimeLux – Experience Timeless Elegance.**

