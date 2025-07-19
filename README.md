
# 🗳️ Online Voting and Feedback System for Universities

## 📌 Overview

This project is a full-stack web application designed to simplify and digitize the voting and feedback process in university settings. Students can securely log in, vote for professors across different subjects, and submit detailed feedback. Admins can monitor all data in real-time using a secure dashboard that includes visual analysis and exportable reports.

---

## ✨ Key Features

### 🔐 Authentication
- Student and admin login/registration
- Passwords hashed using `bcrypt`
- Session-based authentication

### 👨‍🎓 Student Panel
- Vote for professors (only once per subject)
- Submit feedback on each professor
- Smooth, responsive UI with clear instructions
- Prevents duplicate voting or feedback

### 👨‍💼 Admin Panel
- Secure login to view dashboard
- Real-time feedback and vote analysis
- Visualizations using **Chart.js**
- Download full feedback as `.csv` file
- Session-based access control

---

## 🧰 Tech Stack

| Layer      | Tech Used                      |
|------------|--------------------------------|
| Backend    | Node.js, Express.js            |
| Frontend   | EJS (Embedded JavaScript), HTML, CSS, JS |
| Database   | PostgreSQL (managed via pgAdmin) |
| Security   | bcrypt, express-session        |
| Charts     | Chart.js                       |
| Deployment | Render                         |

---

## 📁 Folder Structure

```
/voting-system
│
├── /views               # EJS templates for frontend (login, register, dashboards)
│   ├── admin-dashboard.ejs
│   ├── student-home.ejs
│   └── ...
│
├── /public              # Static assets (CSS, client-side JS)
│   ├── /css
│   ├── /js
│
├── /routes              # Route handlers
│   ├── admin.js
│   ├── student.js
│
├── /controllers         # Business logic
│   ├── adminController.js
│   ├── studentController.js
│
├── /config              # Database connection
│   └── db.js
│
├── server.js            # Main server file
├── database.sql         # SQL script to create required tables
├── package.json         # Project metadata and dependencies
└── README.md            # Project documentation (you’re reading it!)
```

---

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/voting-system.git
cd voting-system
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up PostgreSQL Database
- Open **pgAdmin** or **psql**
- Manually create tables using `database.sql`
- Make sure your credentials are correct

```

### 4. Start the Server
```bash
node server.js
```

> Visit: `http://localhost:3000/`

---

## 📊 Admin Dashboard

- Live bar charts for vote count per professor
- Feedback visualization per subject
- Filters to view by subject or overall stats
- CSV download button to export all feedback data

---

## 🔐 Example Credentials

| Role    | Username | Password     |
|---------|----------|--------------|
| Admin   | KcKabir2   | 2222    |
| Student | Register from frontend |

---

## 📤 Deployment Notes

- Designed for easy deployment on **Render**
- PostgreSQL DB should be hosted separately (e.g., Render PostgreSQL, ElephantSQL)
- Ensure environment variables are correctly set in the Render dashboard
- HTTPS enforced in production

---

## 📃 License

MIT License  
Free to use, modify, and build upon with credit.

---

## 👤 Author

**Kabir Chauhan**  
Email: kckabir123@gmail.com
GitHub: [@KcKabir](https://github.com/KcKabir)  
---

## 🙌 Acknowledgements

- PostgreSQL for the powerful relational DB
- Chart.js for charting and visualization
- Node.js & Express for backend power
- Everyone who encouraged this project ✨

---
THANK YOU!!!!!!
