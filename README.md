# FormCraft — Dynamic Form Builder

> **ReadyNest Full Stack Development Internship — Week 1**

A full-stack web application that allows users to create dynamic forms, share them via unique links, collect responses in real-time, and view analytics on a dashboard.

---

## 🚀 Live Demo

- **Frontend:** [Vercel link here]
- **Backend API:** [Render link here]

---

## ✨ Features

| Feature | Status |
|---------|--------|
| User Authentication (Register / Login / JWT) | ✅ |
| Dynamic Form Builder (9 field types) | ✅ |
| Drag & Drop Field Reordering | ✅ |
| Form Management (Create / Edit / Delete / Duplicate) | ✅ |
| Publish / Unpublish Forms | ✅ |
| Public Form Sharing via Unique Link | ✅ |
| QR Code Generation for Share Links | ✅ |
| Response Collection with Validation | ✅ |
| Response Dashboard with Search & Filter | ✅ |
| Analytics (Views, Submissions, Completion Rate) | ✅ |
| CSV Export of Responses | ✅ |
| Responsive Dark UI | ✅ |

### Supported Field Types
- Text Input
- Email
- Number
- Text Area
- Dropdown
- Radio Button
- Checkbox
- Date Picker
- Star Rating (1–5)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (Vite) |
| Styling | Vanilla CSS with CSS Variables |
| Routing | React Router DOM v6 |
| Drag & Drop | @dnd-kit/core + @dnd-kit/sortable |
| QR Code | qrcode.react |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose) |
| Authentication | JWT + bcryptjs |
| Validation | Server-side + client-side |

---

## 📁 Project Structure

```
A Dynamic Form Builder/
├── client/                  # React (Vite) frontend
│   ├── src/
│   │   ├── api/             # API call functions
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # AuthContext
│   │   ├── hooks/           # Custom hooks (useToast)
│   │   ├── pages/           # Route pages
│   │   └── utils/           # Helper functions
│   └── package.json
│
└── server/                  # Express backend
    ├── src/
    │   ├── controllers/     # Business logic
    │   ├── middleware/      # Auth middleware
    │   ├── models/          # Mongoose schemas
    │   ├── routes/          # Route definitions
    │   └── utils/           # JWT helpers
    └── package.json
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/dynamic-form-builder.git
cd dynamic-form-builder
```

### 2. Set up the server
```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
npm run dev
```

### 3. Set up the client
```bash
cd client
npm install
npm run dev
```

### 4. Open in browser
```
http://localhost:5173
```

---

## 🔐 Environment Variables

### `server/.env`
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/formbuilder
JWT_SECRET=your_super_secret_key_here
CLIENT_URL=http://localhost:5173
```

### `client/.env`
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🔌 API Reference

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register a new user |
| POST | `/api/auth/login` | ❌ | Login and receive JWT |
| GET | `/api/auth/me` | ✅ | Get current user |
| GET | `/api/forms` | ✅ | List all my forms |
| POST | `/api/forms` | ✅ | Create a new form |
| GET | `/api/forms/:id` | ✅ | Get a form by ID |
| PUT | `/api/forms/:id` | ✅ | Update a form |
| DELETE | `/api/forms/:id` | ✅ | Delete a form |
| POST | `/api/forms/:id/duplicate` | ✅ | Duplicate a form |
| GET | `/api/forms/share/:shareId` | ❌ | Get public form |
| POST | `/api/responses/:formId` | ❌ | Submit a response |
| GET | `/api/responses/:formId` | ✅ | Get all responses |
| GET | `/api/responses/:formId/export` | ✅ | Export CSV data |

---

## 🚢 Deployment

### Frontend (Vercel)
```bash
# In client/ directory
npm run build
# Deploy the dist/ folder to Vercel
```

### Backend (Render)
- Connect your GitHub repo to Render
- Set environment variables in Render dashboard
- Build command: `npm install`
- Start command: `node src/app.js`

---

## 👨‍💻 Author

Built as part of the **ReadyNest Full Stack Development Internship (Week 1)**.

---

*Built with ❤ using React + Express + MongoDB*
