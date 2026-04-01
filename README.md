# FolkFusion – Sri Lankan Folk Art Preservation Platform

FolkFusion is a MERN stack web application designed to preserve, promote, and empower Sri Lankan folk art industries through a decentralized digital platform. The system allows folk artists to showcase their artworks, connect with communities, and increase visibility while enabling users to explore and support traditional cultural heritage.

---

## 🌐 Live Overview

FolkFusion provides a centralized platform where:

* Folk artists can upload and manage their artworks
* Users can explore traditional Sri Lankan folk art
* Admins can manage artists, artworks, and platform content
* Images are securely stored and managed using Cloudinary

---

## 🧰 Tech Stack

### 🎨 Frontend

<p>
  <img src="https://skillicons.dev/icons?i=react" height="40" alt="React"/>
  <img src="https://skillicons.dev/icons?i=vite" height="40" alt="Vite"/>
  <img src="https://skillicons.dev/icons?i=tailwind" height="40" alt="TailwindCSS"/>
  <img src="https://skillicons.dev/icons?i=js" height="40" alt="JavaScript"/>
  <img src="https://skillicons.dev/icons?i=html" height="40" alt="HTML"/>
  <img src="https://skillicons.dev/icons?i=css" height="40" alt="CSS"/>
</p>

---

### ⚙️ Backend

<p>
  <img src="https://skillicons.dev/icons?i=nodejs" height="40" alt="Node.js"/>
  <img src="https://skillicons.dev/icons?i=express" height="40" alt="Express.js"/>
  <img src="https://skillicons.dev/icons?i=mongodb" height="40" alt="MongoDB"/>
</p>

---

### ☁️ Cloud & Media

<p>
  <img src="https://skillicons.dev/icons?i=cloudinary" height="40" alt="Cloudinary"/>
</p>

---

### 🛠 Tools & Development

<p>
  <img src="https://skillicons.dev/icons?i=git" height="40" alt="Git"/>
  <img src="https://skillicons.dev/icons?i=github" height="40" alt="GitHub"/>
  <img src="https://skillicons.dev/icons?i=vscode" height="40" alt="VS Code"/>
  <img src="https://skillicons.dev/icons?i=postman" height="40" alt="Postman"/>
</p>

---

### 🚀 Deployment

<p>
  <img src="https://skillicons.dev/icons?i=vercel" height="40" alt="Vercel"/>
  <img src="https://skillicons.dev/icons?i=render" height="40" alt="Render"/>
</p>

---

## 📁 Project Structure

```
FolkFusion-web/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middleware/
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── .env.example
│   └── package.json
│
└── README.md
```

## ⚙️ Features

### 👤 User Features

* Browse and explore folk artworks
* View artist profiles
* Search and filter artworks by category
* Responsive modern UI

### 🎨 Artist Features

* Register and login securely
* Upload artworks with images
* Manage artwork details (create, update, delete)
* Cloudinary image upload integration

### 🛠 Admin Features

* Manage artists and artworks
* Monitor platform content
* Role-based access control

---

## ☁️ Cloudinary Image Upload

This project uses Cloudinary for secure image upload and storage.

Features:

* Optimized image delivery
* Secure cloud storage
* Fast image loading
* Automatic image optimization

---

## 🔐 Environment Variables

Create `.env` file in both backend and frontend folders.

Example backend `.env`:

```
PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Example frontend `.env`:

```
VITE_API_URL=http://localhost:5000
```

---

## 🚀 Installation and Setup

### 1. Clone the repository

```
git clone https://github.com/yourusername/FolkFusion-web.git
cd FolkFusion-web
```

---

### 2. Install backend dependencies

```
cd backend
npm install
npm run dev
```

---

### 3. Install frontend dependencies

```
cd frontend
npm install
npm run dev
```

---

## 📸 Image Upload Flow

```
Frontend → Backend API → Cloudinary → Image URL saved in MongoDB → Display in frontend
```

---

## 🔒 Security Features

* JWT Authentication
* Role-based access control
* Secure environment variables
* Protected API routes

---

## 🎯 Project Purpose

The goal of FolkFusion is to digitally preserve Sri Lanka’s traditional folk art industries and provide artists with a modern platform to showcase their work, connect with audiences, and improve their livelihoods.

---

## 👨‍💻 Author

Developed by: R.A.A.I.Jayarathna
Project: Computing Project – FolkFusion
Technology: MERN Stack + Cloudinary

---

## 🤝 Contributions

Contributions, suggestions, and improvements are welcome.

---

## ⭐ Support

If you like this project, please give it a star on GitHub.
