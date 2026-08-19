<div align="center">

# FolkFusion

### *Discover the Beauty of Folk Arts*

A full-stack web application dedicated to preserving and promoting Sri Lankan traditional folk arts — connecting artists, collectors, and cultural enthusiasts on one unified platform.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

</div>

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Docker Setup](#docker-setup-recommended)
  - [Manual Setup](#manual-setup)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Authentication & Roles](#authentication--roles)
- [Frontend Pages](#frontend-pages)
- [Database Models](#database-models)
- [Key Features Deep Dive](#key-features-deep-dive)
- [Scripts](#scripts)

---

## Features

| Feature | Description |
|---|---|
| **Multi-Role System** | SuperAdmin, Provincial Admin, and Artist roles with distinct dashboards and permissions |
| **Province-Based Architecture** | All 9 Sri Lankan provinces with scoped data isolation per admin |
| **Artwork Gallery** | Browse, search, like, and discover 26+ folk art categories with featured highlighting |
| **E-Commerce Marketplace** | Full order lifecycle with Stripe payments, shipping, and tracking |
| **Course Management** | In-person courses at historical venues with enrollment, scheduling, and certification |
| **Event Management** | Workshops, exhibitions, festivals with artist registration and capacity limits |
| **Donations** | Stripe-powered donations with receipt generation and email confirmations |
| **Learning Hub** | Free educational content by category with chapters, progress tracking, and traditional patterns |
| **AI Chatbot** | Groq LLaMA3-powered chatbot with live platform data, multi-language support, and image analysis |
| **AI Dashboard Insights** | AI-powered analytics and recommendations for artists and admins |
| **Real-Time Notifications** | Socket.IO push notifications with unread badge across all dashboards |
| **AR/3D Viewer** | Three.js 3D model viewer with QR codes for mobile AR experience |
| **Multi-Language** | English, Sinhala, and Tamil via Google Translate integration |
| **Email Service** | Professionally designed HTML templates for donations, orders, and status updates |
| **Historical Places** | Heritage site database with images, cultural importance, and art associations |
| **PDF Generation** | Invoice and report generation with jsPDF |

---

## Tech Stack

### Frontend
| Library | Purpose |
|---|---|
| React 18 + Vite | UI framework and build tool |
| React Router DOM | Client-side routing |
| Tailwind CSS 4 | Utility-first styling |
| Axios | HTTP client |
| Recharts | Dashboard charts and data visualization |
| Stripe React | Payment processing UI |
| Socket.IO Client | Real-time notification listener |
| Three.js | 3D/AR model viewer |
| jsPDF | PDF report/invoice generation |
| Lucide React / React Icons | Icon libraries |

### Backend
| Library | Purpose |
|---|---|
| Express.js | Web framework |
| Mongoose | MongoDB ODM |
| JSON Web Tokens | Authentication |
| bcryptjs | Password hashing |
| Cloudinary + Multer | Image hosting and uploads |
| Stripe | Payment processing and webhooks |
| Socket.IO | Real-time notification server |
| Nodemailer | Transactional emails |
| Groq SDK | AI chatbot and dashboard insights |
| express-validator | Input validation |

### Infrastructure
| Tool | Purpose |
|---|---|
| MongoDB 7 | Primary database |
| Nginx | Frontend serving and reverse proxy |
| Docker Compose | Multi-service orchestration |
| ngrok | Local tunnel for mobile AR testing |

---

## Architecture

```
                         +-----------------+
                         |   Nginx :3000   |
                         | (React SPA)     |
                         +--------+--------+
                                  |
                         +--------v--------+
                         |  Express :5000  |
                         |  + Socket.IO    |
                         +--------+--------+
                                  |
                    +-------------+-------------+
                    |                           |
           +--------v--------+       +---------v--------+
           |   MongoDB :27017 |       |   Cloudinary     |
           |   (Docker vol)   |       |   (Image CDN)    |
           +------------------+       +------------------+
                    |
           +--------v--------+
           |   Stripe API    |
           |   (Payments)    |
           +-----------------+
                    |
           +--------v--------+
           |   Groq API      |
           |   (LLaMA3 AI)   |
           +-----------------+
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v20+
- [npm](https://www.npmjs.com/) v9+
- [Docker](https://www.docker.com/) & Docker Compose (recommended)
- A [MongoDB](https://www.mongodb.com/) instance (local or Atlas)
- Accounts for: [Cloudinary](https://cloudinary.com/), [Stripe](https://stripe.com/), [Groq](https://groq.com/)

### Docker Setup (Recommended)

1. **Clone the repository**

   ```bash
   git clone https://github.com/ayeshijayarathna/FolkFusion.git
   cd FolkFusion
   ```

2. **Configure environment variables**

   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

   Edit `backend/.env` and `frontend/.env` with your API keys (see [Environment Variables](#environment-variables)).

3. **Start all services**

   ```bash
   docker-compose up -d
   ```

   This starts three containers:
   | Service | Port | Description |
   |---|---|---|
   | `folkfusion-frontend` | `3000` | React SPA served via Nginx |
   | `folkfusion-backend` | `5000` | Express API server |
   | `folkfusion-mongodb` | `27017` | MongoDB 7 database |

4. **Seed the database**

   ```bash
   docker exec folkfusion-backend node src/scripts/seedAll.js
   ```

5. **Open the application**

   - Frontend: [http://localhost:3000](http://localhost:3000)
   - API: [http://localhost:5000/api](http://localhost:5000/api)
   - Health check: [http://localhost:5000/health](http://localhost:5000/health)

### Manual Setup

1. **Clone and install dependencies**

   ```bash
   git clone https://github.com/ayeshijayarathna/FolkFusion.git
   cd FolkFusion

   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Configure environment variables** (same as Docker setup above)

3. **Start MongoDB** locally or update `MONGODB_URI` to point to your Atlas cluster

4. **Run the backend**

   ```bash
   cd backend
   npm run dev     # development with hot-reload
   # or
   npm start       # production
   ```

5. **Run the frontend**

   ```bash
   cd frontend
   npm run dev     # starts on port 5173 with proxy to backend
   ```

6. **Seed the database**

   ```bash
   cd backend
   node src/scripts/seedAll.js
   ```

---

## Project Structure

```
FolkFusion/
├── docker-compose.yml
├── backend/
│   ├── Dockerfile
│   ├── .env.example
│   ├── public/models/              # 3D GLB model files
│   └── src/
│       ├── server.js               # Express + Socket.IO entry point
│       ├── config/                 # DB, Cloudinary configs
│       ├── middleware/              # Auth & RBAC middleware
│       ├── models/                 # 18 Mongoose models
│       ├── routes/                 # 17 route modules
│       ├── controllers/            # 15 controller files
│       ├── services/               # Email, notifications
│       └── scripts/                # Database seed scripts
└── frontend/
    ├── Dockerfile
    ├── .env.example
    ├── public/                     # Static assets
    └── src/
        ├── App.jsx                 # Router definitions
        ├── components/             # Navbar, Footer, Chatbot, LanguageSwitcher
        ├── context/                # Auth, SuperAdmin Auth, Socket contexts
        ├── services/               # API client and functions
        ├── hooks/                  # Custom React hooks
        ├── utils/                  # Constants (provinces, categories)
        └── pages/
            ├── Login/              # Artist, Admin, SuperAdmin logins
            ├── artist/             # Artist dashboard + sections
            ├── admin/              # Admin dashboard + sections
            ├── superadmin/         # SuperAdmin dashboard + sections
            └── public/             # 20+ public-facing pages
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string | `mongodb://mongodb:27017/folkfusion` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `JWT_SECRET` | Secret for JWT signing | *(use a strong random string)* |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | *(from Cloudinary dashboard)* |
| `CLOUDINARY_API_KEY` | Cloudinary API key | *(from Cloudinary dashboard)* |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | *(from Cloudinary dashboard)* |
| `STRIPE_SECRET_KEY` | Stripe secret key | *(from Stripe dashboard)* |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | *(from Stripe dashboard)* |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `EMAIL_HOST` | SMTP host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP port | `587` |
| `EMAIL_USER` | Email address | *(your email)* |
| `EMAIL_PASS` | Email app password | *(your app password)* |
| `EMAIL_FROM` | Sender display name | `"FolkFusion" <you@example.com>` |
| `GROQ_API_KEY` | Groq API key for AI features | *(from Groq dashboard)* |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | *(from Stripe dashboard)* |

---

## API Overview

The backend exposes **150+ endpoints** across 17 route modules, all prefixed with `/api`.

| Route Module | Base Path | Key Endpoints |
|---|---|---|
| Auth | `/api/auth` | Login, register, profile, password change |
| SuperAdmin | `/api/super-admin` | Admin CRUD, platform stats, settings |
| Admin | `/api/admin` | Profile, courses, AI insights |
| Artists | `/api/artists` | CRUD, approval workflow, dashboard, AI insights |
| Artworks | `/api/artworks` | CRUD, likes, views, featured, stats |
| AR Artworks | `/api/ar-artworks` | 3D model CRUD, publish, reorder |
| Marketplace | `/api/marketplace` | Listings, orders, sales, revenue tracking |
| Events | `/api/events` | CRUD, registration, stats |
| Courses | `/api/courses` | CRUD, featured, enrollment |
| Donations | `/api/donations` | Create, webhook, stats, acknowledgment |
| Payments | `/api/payments` | Stripe intents, webhooks, order tracking |
| News | `/api/news` | CRUD, featured, province news |
| Learning | `/api/learning` | Categories, chapters, patterns, progress, reviews |
| Historical Places | `/api/historical-places` | CRUD, image management, stats |
| Inquiries | `/api/inquiries` | Submit, reply, stats |
| Notifications | `/api/notifications` | List, read, unread count, clear |
| Chat | `/api/chat` | AI chatbot messaging |

Full API documentation with request/response examples can be found in the route and controller files under `backend/src/`.

---

## Authentication & Roles

### Role Hierarchy

```
SuperAdmin (platform-wide)
    └── Provincial Admin (one per province)
            └── Artist (managed by their province admin)
```

### Auth Flow

- JWT tokens with `Bearer` scheme
- Tokens stored in `localStorage` (separate keys for SuperAdmin vs Artist/Admin)
- Passwords hashed with bcrypt (12 rounds)
- Middleware stack: `protect` → `restrictTo(roles)` → `checkArtistApproval` → `checkProvinceAccess`

### Role Permissions

| Action | SuperAdmin | Admin | Artist |
|---|:---:|:---:|:---:|
| Manage platform admins | Yes | -- | -- |
| Manage learning content | Yes | -- | -- |
| Manage AR artworks | Yes | -- | -- |
| Manage reviews | Yes | -- | -- |
| Manage artists (province) | Yes | Yes | -- |
| Manage artworks (province) | Yes | Yes | -- |
| Manage courses/events | Yes | Yes | -- |
| Manage news/donations | Yes | Yes | -- |
| Manage marketplace | Yes | Yes | -- |
| View AI insights | -- | Yes | Yes |
| Create artworks | -- | -- | Yes* |
| List marketplace items | -- | -- | Yes* |
| Register for events | -- | -- | Yes* |

*\*Requires admin approval*

---

## Frontend Pages

### Public Pages

| Route | Page |
|---|---|
| `/` | Home — hero, featured artworks, new arrivals, artists, news |
| `/artists` | Browse all artists |
| `/artists/:id` | Artist profile |
| `/gallery` | Artwork gallery with filters |
| `/gallery/:id` | Artwork detail |
| `/categories` | Browse 26+ folk art categories |
| `/marketplace` | Buy folk art items |
| `/track-order` | Track order by reference |
| `/events` | Cultural events |
| `/events/:id` | Event detail |
| `/courses` | Learning courses |
| `/courses/:id` | Course detail |
| `/learning` | Free learning hub |
| `/news` | Cultural news |
| `/news/:id` | News article |
| `/historical-places` | Heritage sites |
| `/historical-places/:id` | Place detail |
| `/donations` | Support folk arts |
| `/ar-view/:id` | 3D/AR model viewer |
| `/partnership` | Partnership inquiries |
| `/privacy-policy` | Privacy policy |
| `/terms-and-conditions` | Terms and conditions |

### Dashboards

| Path | Role | Sections |
|---|---|---|
| `/artist/dashboard/*` | Artist | Overview, Artworks, Marketplace, Orders, Profile, Notifications, Inquiries |
| `/admin/*` | Admin | Overview, Artists, Artworks, Courses, Events, Sales, Donations, News, Inquiries, Historical Places, Contact Admins, Notifications, Settings |
| `/super-admin/dashboard/*` | SuperAdmin | Overview, Admin Accounts, Learning Content, Learning Users, AR Artworks, Reviews, Settings |

---

## Database Models

| Model | Description |
|---|---|
| **User** | Base auth model — email, password, role, province, approval status |
| **Admin** | Provincial admin profile linked to User |
| **SuperAdmin** | Super admin profile linked to User |
| **Artist** | Artist profile — bio, specialization, experience, social media, statistics |
| **Artwork** | Artwork listing — images, category, province, dimensions, materials, pricing |
| **ARArtwork** | 3D AR model — GLB file reference, publish status, display order |
| **MarketplaceItem** | Marketplace listing — stock, shipping, analytics, revenue |
| **Sale** | Order record — buyer, payment, shipping, tracking |
| **Payment** | Stripe payment tracking — intent ID, webhook events |
| **Event** | Cultural event — type, dates, participants, fees, capacity |
| **Course** | Training course — syllabus, schedule, instructor, certification |
| **News** | News article — category, images, province, views |
| **Donation** | Donation record — donor info, amount, purpose, receipt |
| **Notification** | Push notification — type, message, read status |
| **Inquiry** | Contact inquiry — status tracking, admin replies |
| **Historicalplace** | Heritage site — description, images, facilities |
| **LearningContent** | Learning hub content — category, chapters, publish status |
| **TraditionalPattern** | Traditional art patterns — image, description, order |
| **LearningUser** | Learning platform user — progress tracking per category |
| **Review** | Learning platform review — rating, status (pending/approved/rejected) |
---

## Key Features Deep Dive

### AI Chatbot
Powered by Groq LLaMA3 (`llama-3.3-70b-versatile`), the chatbot:
- Fetches **live platform data** (artists, events, marketplace, courses, news) for contextual responses
- Supports **image upload** for artwork analysis (`llama-3.2-11b-vision-preview`)
- Responds in the user's language (English, Sinhala, or Tamil)
- Maintains session history with 2-hour TTL

### AI Dashboard Insights
Both artists and admins get AI-powered analytics:
- **Artist Insights**: Artwork performance, sales analysis, marketplace optimization
- **Admin Insights**: Province-level metrics, artist management, course/event performance
- Returns structured recommendations with actionable steps

### Real-Time Notifications
- Socket.IO private rooms per user
- 13 notification types (artwork likes, sales, events, donations, inquiries, etc.)
- Persistent storage with unread count badge
- Instant delivery across all connected clients

### Payment Processing
- Stripe Elements for secure card input
- Payment Intents API for marketplace purchases
- Webhook endpoint for payment confirmation
- Multiple methods: card, bank transfer, cash on delivery

### Province-Based Architecture
All 9 provinces operate as independent zones:
- Western, Central, Southern, Northern, Eastern, North Western, North Central, Uva, Sabaragamuwa
- Admins only see and manage data from their province
- Artists, artworks, events, courses, and news are province-scoped

---

## Scripts

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start development server with hot-reload |
| `npm start` | Start production server |
| `npm run seed` | Seed 9 provincial admin accounts |
| `npm run create:admin` | Create Admin profile documents |
| `node src/scripts/Seedsuperadmin.js` | Seed super admin account |
| `node src/scripts/seedLearning.js` | Seed learning content categories |
| `node src/scripts/seedAll.js` | Run all seed scripts at once |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server on port 5173 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |

---

<div align="center">

**Built with care to preserve the cultural heritage of Sri Lanka**

[FolkFusion](https://github.com/ayeshijayarathna/FolkFusion)

</div>
