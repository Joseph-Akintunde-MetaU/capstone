# capstone
## 📂 Table of Contents

* [About]
* [Tech Stack]
* [Features]
* [Installation]
* [Environment Variables]
* [Usage]
* [Deployment]
* [Contributing]
* [Contact]

---

## About

This app demonstrates Recipe generation, pantry planning, food and resource conservation, meal planning and scheduling, and smarter and efficient grocery shopping.

* **React** for the user interface
* **Express.js + Firebase** for backend logic and RESTful APIs
* **Firebase Authentication** for secure login/signup
* **Firestore** as a cloud NoSQL database
* **Java SDK** as a dependency on scheduling cloud functions

---

## Tech Stack

* **Frontend**: React.js, Firebase SDK, CSS
* **Backend**: Express.js, Firebase, Java SDK
* **Database**: Firestore (Firebase)
* **Auth**: Firebase Authentication
* **Hosting (optional)**: Firebase Hosting

---

## Features

* User authentication (Signup/Login/Logout)
* CRUD operations with Firestore
* Real-time data updates
* RESTful API endpoints (Express)
* Modular frontend/backend structure
* User interaction logs

## ⚙️ Installation

Clone the repo:

```bash
git clone https://github.com/Joseph-Akintunde-MetaU/capstone/
cd capstone
```

### 🔧 Backend Setup

```bash
cd server
npm install
firebase emulators:start
```

### 🎨 Frontend Setup

```bash
cd client
yarn install
yarn start
```

---

## Environment Variables

To run this website, you would need: 

Frontend:

REACT_APP_FIREBASE_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID
REACT_APP_API_KEY - Spoonacular API

Backend:

REACT_APP_SPOONACULAR_API_KEY


## Usage

Start both frontend and backend servers:

# In separate terminals
Frontend - yarn start
Backend - firebase emulators:start 


## Deployment

* **Frontend (React)**: Deploy to [Firebase Hosting](https://firebase.google.com/docs/hosting), [Vercel](https://vercel.com), or [Netlify](https://netlify.com)
* **Backend (Express)**: 


## Contributing
**Joseph Akintunde**
**Jay Rajput**
**Chan Kim**
**Zikun Lin**


## 📬 Contact

**Joseph Akintunde**
**jakintunde@claflin.edu**
**803-347-1831**
