# 🚀 ThreadForge

A full-stack discussion platform featuring recursive comment threads, JWT authentication, and a credit-based engagement system.

### 🌐 Live Demo

**Frontend:** https://threadforge-lemon.vercel.app

**Backend API:** https://threadforge-nirs.onrender.com

> Note: The backend is hosted on Render's free tier and may take a few seconds to wake up after inactivity.

---

## ✨ Features

* 🔐 JWT Authentication
* 📝 Create and manage discussion posts
* 💬 Unlimited nested comment threads
* 🧠 Recursive comment rendering
* 💰 Credit-based engagement system
* 🔄 Automatic credit rollback on comment deletion
* 👤 Protected user routes
* 📱 Responsive UI
* ⚡ Fast Vite-powered frontend

---

## 🛠 Tech Stack

### Frontend

* React
* TypeScript
* Vite
* React Router
* Axios
* Tailwind CSS
* Context API

### Backend

* Node.js
* Express
* TypeScript
* MongoDB
* Mongoose
* JWT Authentication

### Deployment

* Vercel (Frontend)
* Render (Backend)
* MongoDB Atlas

---

## 🏗 Architecture

```text
Frontend (React + Vite)
        │
        ▼
REST API (Express)
        │
        ▼
MongoDB Atlas
```

Authentication flow:

```text
User Login
    │
    ▼
JWT Generated
    │
    ▼
Stored Client-Side
    │
    ▼
Axios Interceptor
    │
    ▼
Protected API Requests
```

---

## 💰 Credit System

ThreadForge rewards post authors when discussions occur on their posts.

Credits are awarded based on comment depth:

```text
Reward = First Term + (Depth - 1) × Common Difference
```

Example:

| Depth         | Credits |
| ------------- | ------- |
| Root Comment  | 1       |
| Reply Level 1 | 3       |
| Reply Level 2 | 5       |
| Reply Level 3 | 7       |

When comments are deleted, associated credits are automatically rolled back while preserving thread structure.

---

## 🌳 Recursive Comments

ThreadForge supports unlimited nested discussions through a parent-child comment model.

```text
Comment A
└── Comment B
    └── Comment C
        └── Comment D
```

The backend stores comments as a flat collection, while the frontend builds a recursive tree structure for rendering.

---

## 📂 Project Structure

```text
ThreadForge
├── forum-frontend
│   ├── src
│   └── public
│
├── forum-backend
│   ├── src
│   └── dist
│
└── README.md
```

---

## ⚙️ Local Setup

### Clone Repository

```bash
git clone https://github.com/IchigoAni-19/threadforge.git

cd threadforge
```

### Backend

```bash
cd forum-backend

npm install

npm run dev
```

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
CREDIT_FIRST_TERM=1
CREDIT_COMMON_DIFFERENCE=2
```

### Frontend

```bash
cd forum-frontend

npm install

npm run dev
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 📡 Core API Routes

### Authentication

```text
POST /api/auth/signup
POST /api/auth/login
```

### Users

```text
GET /api/users/me
```

### Posts

```text
GET    /api/posts
GET    /api/posts/:id
POST   /api/posts
```

### Comments

```text
GET    /api/comments/post/:postId
POST   /api/comments
POST   /api/comments/reply
DELETE /api/comments/:id
```

---

## 🚀 Deployment

Frontend is deployed on Vercel.

Backend is deployed on Render.

Production environment variable:

```env
VITE_API_URL=https://threadforge-nirs.onrender.com/api
```

---

## 📸 Preview

Add screenshots or GIF demos here.

---

## 🤝 License

This project is open for learning, exploration, and portfolio review purposes.

---

Built with React, TypeScript, Express, and MongoDB.
