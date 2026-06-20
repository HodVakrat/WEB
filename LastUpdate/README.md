<div align="center">

# 🧮 MathematiKids

### Making math fun for kids — one adaptive quiz at a time.

An interactive web app that helps children **aged 6–12** practice math through
adaptive quizzes, an AI helper, rewards, and a cosmetic avatar shop.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-38BDF8?logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209-47A248?logo=mongodb&logoColor=white)
![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-8E75B2?logo=googlegemini&logoColor=white)

</div>

---

## ✨ Overview

**MathematiKids** is a **MERN-style** single-page app built around a **Netflix-style account model**:
a parent creates one account and adds several **kid profiles**, then each kid logs into their own
profile to play. Quizzes **adapt their difficulty in real time** to the child's performance, an
**AI buddy** offers help when they're stuck, and correct answers earn **coins** that can be spent
on **avatars** in the shop.

---

## 🎯 Features

- 🧠 **Adaptive difficulty** — the quiz auto-adjusts between **Easy / Medium / Hard** based on the child's streak (no manual level picking).
- ➕ **Six subjects, age-gated** — Addition & Subtraction (6+), Multiplication & Division (9+), Fractions & Percentages (11+).
- ⏱️ **Per-question timer** — freezes automatically while the child reads help from the AI buddy.
- 🤖 **AI buddy (MathBuddy)** — powered by **Google Gemini**; gives a **Hint** first, and only then unlocks the full **Answer**.
- ⭐ **Coins by difficulty** — Easy = **3**, Medium = **7**, Hard = **20** per correct answer.
- 🛍️ **Avatar shop** — spend coins on fun avatars.
- 📚 **Per-profile history** — every quiz is saved, with filtering and summary stats.
- 👨‍👩‍👧 **Parent accounts** — manage multiple kid profiles (add / edit / delete).
- 🌗 **Light & dark theme** — remembers your choice.

---

## 🧱 Tech Stack

| Layer        | Technologies                                                              |
| ------------ | ------------------------------------------------------------------------- |
| **Frontend** | React 19, Vite 8, Tailwind CSS v4, React Compiler                         |
| **Backend**  | Node.js, Express 5, Mongoose 9                                            |
| **Database** | MongoDB (local)                                                           |
| **AI**       | Google Gemini (`@google/generative-ai`, model `gemini-2.5-flash`)         |

---

## 🏗️ Architecture

The project follows a clean, **layered architecture** (low coupling, high cohesion):

```
Component  →  Service  →  Route  →  Controller  →  Model  →  MongoDB
 (React)     (fetch)     (Express)   (logic)      (Mongoose)
```

- The **frontend** never knows about URLs or `fetch` directly — every server call goes through a **Service**.
- The **server** owns all trusted logic (points, validation) and talks to MongoDB through **Mongoose models**.
- Navigation is **state-driven** via a manual `ComponentSwitcher` (no router): `Login → Parent → Dashboard → Quiz`.

---

## 📁 Project Structure

```
LastUpdate/
├─ public/
├─ src/
│  ├─ UIComponents/
│  │  ├─ ComponentSwitcher.jsx   # manual router + header/footer + session restore
│  │  └─ AvatarShop.jsx          # the coin shop
│  ├─ UsersManager/
│  │  ├─ Login.jsx / Register.jsx
│  │  ├─ ParentScreen.jsx        # kid-profile management
│  │  ├─ MathDashboard.jsx       # pick a subject + rewards legend
│  │  ├─ QuizPage.jsx            # adaptive quiz engine + timer
│  │  ├─ BotHelper.jsx           # AI buddy (Gemini)
│  │  └─ HistoryPage.jsx         # per-profile quiz history
│  ├─ services/                  # AuthService / ProfileService / ResultService
│  ├─ logic/QuizLogic.js         # pure question generators
│  ├─ ThemeContext.jsx           # light/dark theme
│  ├─ App.jsx
│  └─ main.jsx
├─ server/
│  ├─ controllers/               # auth / profile / result
│  ├─ models/                    # Parent / Result
│  ├─ routes/                    # auth / profile / result
│  ├─ app.js                     # Express entry point (port 5000)
│  └─ db.js                      # MongoDB connection
├─ .env                          # VITE_API_KEY (not committed)
├─ vite.config.js
└─ package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (LTS recommended)
- **MongoDB** running locally on `mongodb://localhost:27017`
- A **Google Gemini API key** (for the AI buddy)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```bash
VITE_API_KEY=your_google_gemini_api_key
```

### 3. Make sure MongoDB is running

The server connects to `mongodb://localhost:27017/mathematikids`
(the database and collections are created automatically on first write).

### 4. Run the app (two terminals)

```bash
# Terminal 1 — backend API (http://localhost:5000)
npm run server

# Terminal 2 — frontend dev server (http://localhost:5173)
npm run dev
```

Then open **http://localhost:5173** and create a parent account to begin.

---

## 🔌 API Reference

All routes are mounted under `/api`.

| Method   | Endpoint                          | Description                          |
| -------- | --------------------------------- | ------------------------------------ |
| `POST`   | `/auth/register`                  | Create a parent account              |
| `POST`   | `/auth/login`                     | Log in                               |
| `GET`    | `/parents/:id`                    | Fetch a parent (session restore)     |
| `POST`   | `/profiles`                       | Add a kid profile                    |
| `PUT`    | `/profiles/:profileId`            | Edit a profile                       |
| `DELETE` | `/profiles/:profileId`            | Delete a profile (cascades results)  |
| `PUT`    | `/profiles/:profileId/avatar`     | Buy / equip an avatar                |
| `POST`   | `/results`                        | Save a finished quiz + award coins   |
| `GET`    | `/results/:profileId`             | Get a profile's quiz history         |
| `GET`    | `/health`                         | Health check                         |

---

## 📜 Available Scripts

| Script            | Description                          |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the Vite frontend dev server   |
| `npm run server`  | Start the Express API (`--watch`)    |
| `npm run build`   | Build the frontend for production    |
| `npm run preview` | Preview the production build         |
| `npm run lint`    | Run ESLint                           |

---

## 🎓 Course Context

Developed as the course project for **Advanced Internet Technologies (61776)**
at **Braude College of Engineering** — Group **B3**.

---

<div align="center">

**© 2026 MathematiKids — Making math fun for kids! 🧮**

</div>
