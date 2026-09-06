# 🧠 NeuroSync

**NeuroSync** is a full-stack web application designed to bring intelligent, personalized digital experiences into a single platform.

The project is being developed as a collaborative final-year project using **React** for the frontend and **Django REST Framework** for the backend.

---

## 🚀 Project Status

> 🟡 **Currently in Development**

The core authentication system has been implemented, including user registration, login, JWT-based authentication, protected API endpoints, and dashboard authentication.

More NeuroSync features are currently being developed.

---

## 🛠️ Tech Stack

### Frontend

* React.js
* JavaScript (ES6+)
* React Router
* Tailwind CSS

### Backend

* Python
* Django
* Django REST Framework
* Simple JWT

### Database

* PostgreSQL

### Authentication

* JWT Authentication
* Access Tokens
* Refresh Tokens
* HTTP-only Cookies
* Protected API endpoints

### Development Tools

* Git
* GitHub
* VS Code
* Postman

---

## ✨ Current Features

### 🔐 Authentication

* User registration
* User login
* Password authentication
* JWT access token generation
* Refresh token generation
* HTTP-only refresh token cookie
* Protected backend API endpoints
* Authenticated user profile endpoint

### 🖥️ Dashboard

* Authenticated dashboard
* User-specific profile information
* Protected frontend dashboard route
* Integration between React frontend and Django backend

---

## 🏗️ Project Architecture

```text
NeuroSync/
│
├── backend/
│   ├── backend/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── ...
│   │
│   ├── users/
│   │   ├── views.py
│   │   ├── serializers.py
│   │   ├── urls.py
│   │   └── ...
│   │
│   ├── manage.py
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── ...
│   │
│   └── ...
│
└── README.md
```

---

## 🔐 Authentication Flow

NeuroSync currently uses JWT-based authentication.

```text
                ┌──────────────┐
                │    React     │
                │   Frontend   │
                └──────┬───────┘
                       │
                       │ Login credentials
                       ▼
                ┌──────────────┐
                │    Django    │
                │     API      │
                └──────┬───────┘
                       │
                 Authenticate
                       │
                       ▼
              ┌─────────────────┐
              │   JWT Tokens    │
              └────────┬────────┘
                       │
            ┌──────────┴──────────┐
            ▼                     ▼
      Access Token          Refresh Token
      localStorage          HTTP-only Cookie
            │                     │
            ▼                     ▼
       API Requests         Token Refresh
```

Protected API requests use the access token:

```text
Authorization: Bearer <access_token>
```

The Django backend validates the token before allowing access to protected resources.

---

## ⚙️ Getting Started

### 1. Clone the repository

```bash
git clone <YOUR_REPOSITORY_URL>
cd NeuroSync
```

---

# 🔙 Backend Setup

Navigate to the backend:

```bash
cd backend
```

### Create a virtual environment

```bash
python -m venv .venv
```

### Activate the virtual environment

#### Windows

```bash
.venv\Scripts\activate
```

#### macOS / Linux

```bash
source .venv/bin/activate
```

### Install dependencies

```bash
pip install -r requirements.txt
```

### Run migrations

```bash
python manage.py migrate
```

### Start Django server

```bash
python manage.py runserver
```

The backend will run at:

```text
http://127.0.0.1:8000/
```

---

# 🎨 Frontend Setup

Open another terminal and navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm start
```

The frontend will normally run at:

```text
http://localhost:3000/
```

---

## 🔗 API Endpoints

### Authentication

| Method | Endpoint               | Description         |
| ------ | ---------------------- | ------------------- |
| POST   | `/api/users/register/` | Register a new user |
| POST   | `/api/users/login/`    | Authenticate a user |

### User

| Method | Endpoint              | Authentication |
| ------ | --------------------- | -------------- |
| GET    | `/api/users/profile/` | Required       |

Example authenticated request:

```http
GET /api/users/profile/
Authorization: Bearer <access_token>
```

---

## 👥 Team Development

NeuroSync is being developed collaboratively using Git and GitHub.

### Recommended workflow

Create a feature branch before working:

```bash
git checkout -b feature/your-feature
```

Make your changes and commit them:

```bash
git add .
git commit -m "Add your feature"
```

Push your branch:

```bash
git push origin feature/your-feature
```

Then create a **Pull Request** on GitHub for review.

### Branch naming examples

```text
feature/authentication
feature/dashboard
feature/profile
feature/neurosync-ai
fix/login-error
fix/dashboard-ui
```

---

## 🔒 Security Notes

* Access tokens are used for authenticated API requests.
* Refresh tokens are stored using HTTP-only cookies.
* Protected backend endpoints use Django REST Framework authentication.
* Sensitive environment variables should not be committed to GitHub.
* `.env` files and Python virtual environments should be included in `.gitignore`.

---

## 🗺️ Roadmap

The following features are planned as development continues:

* [x] User registration
* [x] User login
* [x] JWT authentication
* [x] Protected backend API
* [x] Authenticated dashboard
* [x] Frontend protected route
* [ ] Access-token refresh flow
* [ ] Logout functionality
* [ ] User profile management
* [ ] Core NeuroSync functionality
* [ ] AI-powered features
* [ ] Additional dashboard features
* [ ] Testing and optimization
* [ ] Production deployment

---

## 🤝 Contributing

Contributions from project team members are welcome.

Before making changes:

```bash
git pull origin main
```

Create a feature branch:

```bash
git checkout -b feature/your-feature
```

After completing your work, push the branch and open a Pull Request.

Please avoid directly pushing unfinished work to `main`.

---

## 📌 Development Philosophy

NeuroSync is being developed incrementally:

```text
Plan
  ↓
Build
  ↓
Test
  ↓
Understand
  ↓
Integrate
  ↓
Improve
```

The goal is not only to build the application, but also to maintain a clean, understandable, and collaborative codebase.

---

## 📄 License

This project is currently being developed as an academic/final-year project.

License details will be added when the project is finalized.
