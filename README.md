# RD Forms — Premium Dynamic Form Builder

> **ReadyNest Full Stack Development Internship — Week 1 Project**

**RD Forms** is a professional, full-stack SaaS application that enables users to create dynamic forms, share them via unique links or QR codes, collect responses in real-time, and analyze submission data through an intuitive, premium dashboard. 

Built with a focus on modern UX/UI using a custom **Teal + Cyan design system**, RD Forms rivals commercial platforms with its seamless Drag & Drop interface and comprehensive analytics.

---

## ✨ Core Features & Requirements Fulfilled

| Feature Requirement | Implementation Status |
|---------------------|-----------------------|
| **User Authentication** | ✅ Secure JWT-based Login & Registration with encrypted passwords. |
| **Dynamic Form Builder** | ✅ 9 supported field types with real-time preview and properties editing. |
| **Drag & Drop Reordering** | ✅ Implemented using `@dnd-kit` for seamless form architecture. |
| **Form Management** | ✅ Complete CRUD operations (Create, Edit, Delete, Duplicate). |
| **Publishing & Sharing** | ✅ Toggle Draft/Live states. Share via unique generated URL links. |
| **QR Code Generation** | ✅ Instant QR Code generation for physical or fast-mobile sharing. |
| **Response Collection** | ✅ Public forms handle validation and real-time database submission. |
| **Analytics Dashboard** | ✅ Tracks Total Forms, Published Status, Form Views, and Completion Rates. |
| **Data Export** | ✅ 1-click CSV Export for all form responses. |
| **Premium UI/UX** | ✅ Fully responsive "Teal + Cyan" dark mode design using Poppins typography. |

### Supported Form Fields
1. **Text Input**: Short-form text.
2. **Email**: Validated email input.
3. **Number**: Numeric values only.
4. **Text Area**: Long-form paragraph text.
5. **Dropdown**: Single-select from custom options.
6. **Radio Button**: Single-select visible options.
7. **Checkbox**: Multi-select options.
8. **Date Picker**: Calendar date selection.
9. **Star Rating**: 1 to 5 visual star rating.

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | React 18 (Vite) |
| **Design System** | Custom Vanilla CSS (Tokens, CSS Variables) |
| **Routing** | React Router DOM v6 |
| **Drag & Drop** | `@dnd-kit/core` & `@dnd-kit/sortable` |
| **Backend API** | Node.js + Express.js |
| **Database** | MongoDB (Mongoose ORM) |
| **Authentication** | JWT (JSON Web Tokens) + bcryptjs |

---

## 📁 Project Architecture

```
RD-Forms/
├── client/                  # React (Vite) Frontend Environment
│   ├── src/
│   │   ├── api/             # Axios API client wrapper
│   │   ├── components/      # Reusable UI (Sidebar, Modals)
│   │   ├── context/         # React Context (Auth)
│   │   ├── hooks/           # Custom hooks (e.g. useToast)
│   │   └── pages/           # Main Views (Dashboard, Builder, PublicForm)
│   └── index.css            # Global Teal+Cyan Design System
│
└── server/                  # Node.js/Express Backend
    ├── src/
    │   ├── controllers/     # Business logic
    │   ├── middleware/      # JWT verification middleware
    │   ├── models/          # Mongoose DB Schemas (User, Form, Response)
    │   └── routes/          # Express API route definitions
    └── app.js               # Server entry point
```

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js v18+
- MongoDB Atlas cluster (Free Tier)

### 1. Clone the repository
```bash
git clone https://github.com/devagyarai/RD-Forms.git
cd RD-Forms
```

### 2. Configure & Run Backend
```bash
cd server
npm install
# Create a .env file based on .env.example with MONGO_URI and JWT_SECRET
npm run dev
```

### 3. Configure & Run Frontend
```bash
cd client
npm install
npm run dev
```

### 4. View Application
Open `http://localhost:5173` in your browser.

---

## 🚀 Deployment Instructions

- **Frontend (Vercel)**: Import the `client` directory as a Vite project. The `vercel.json` rewrite file is already included. Set `VITE_API_URL` to the backend deployment URL.
- **Backend (Render)**: Import the `server` directory as a Node Web Service. Set `MONGO_URI`, `JWT_SECRET`, and `CLIENT_URL` (pointing to your Vercel URL).

---

## 👨‍💻 Author

Built by **Devagya Rai** for the **ReadyNest Full Stack Development Internship (Week 1)**. 

*Designed and engineered to meet professional, production-ready SaaS standards.*
