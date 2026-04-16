# 💻 VelocityPad | Real-Time Collaborative Code Compiler

**VelocityPad** is a high-performance, multi-user collaborative code editor and compiler designed for seamless pair programming. Built with the **MERN stack**, **Socket.io**, and **GROQ AI**, it allows developers to write, execute, and debug code in a synchronized environment with integrated communication tools.

## 🚀 Live Demo
Experience real-time collaboration here:  
👉 **[CodeSync Live on Vercel](https://velocitypad.in/)**

---

## 🌟 Key Features

* **Real-Time Collaboration:** Instantaneous code synchronization across all users using WebSockets.
* **Integrated Communication:** * **Live Chat:** Real-time text messaging within the coding room.
    * **Voice Call:** Built-in audio communication for seamless pair programming.
* **AI Debugging & Optimization:** Powered by **GROQ AI** to analyze code logic and provide instant fixes for errors.
* **Multi-Language Support:** Execute code in Python, Java, C++, and JavaScript (Node.js).
* **Advanced Editor Tools:**
    * **File Upload:** Import existing code files directly into the editor.
    * **Save to File:** Export your collaborative work to your local machine.
    * **Zoom & Clear:** Customize your view and manage the console output easily.
* **Email Invitation System:** Invite collaborators via **SendGrid** directly from the dashboard.

## 🛠️ Technical Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React.js, Tailwind CSS, Monaco Editor |
| **Backend** | Node.js, Express.js |
| **Real-Time** | Socket.io (WebSockets) |
| **Email Service** | SendGrid  |
| **AI Integration** | GROQ Cloud API |

---

## 📂 Project Structure
```
CodeSync-RealTime/
├── Backend/                 # Express.js Server
│   ├── src/
│   │   ├── config/          # Database & API configurations
│   │   ├── controllers/     # Route logic
│   │   ├── services/        # Business logic & GROQ AI integration
│   │   ├── sockets/         # Socket.io real-time logic
│   │   ├── utils/           # Helper functions
│   │   └── server.js        # Entry point
│   ├── temp/                # Temporary code execution files
│   ├── .env                 # Environment variables (Internal use)
│   └── package.json
├── frontend/                # React.js Client (Vite)
│   ├── src/
│   │   ├── assets/          # Images & Icons
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Client-side utility functions
│   │   ├── App.jsx          # Main application component
│   │   └── main.jsx         # React DOM entry point
│   ├── .env                 # Frontend environment variables
│   ├── package.json
│   └── vite.config.js
├── docs/                    # MANDATORY FOR SUBMISSION
│   ├── Final_Report.pdf     # Project Final Report
│   └── Copyright_Form.pdf   # Filed Copyright Application
└── README.md                # Project Documentation
```

## 💻 Local Setup & Installation

Follow these steps to get the project running locally:

### 1. Clone the Repository
```bash
git clone [https://github.com/Durgesh1008/CodeSyncRealTimeCodeCompilar.git]
cd CodeSync-RealTime
```
### 2. Install Dependencies
## For the Backend:

```Bash
cd server
npm install
```
## For the Frontend:

```Bash
cd ../client
npm install
```

### 3. Environment Variables
## Create a .env file in the server directory:

```Bash
PORT=5000
NODE_ENV=development
GROQ_API_KEY=your_groq_key
SENDGRID_API_KEY=your_sendgrid_key
FRONTEND_URL=your_frontend_url (for sending invitation mail)
```

### 4. Run the Project
## Start Backend:
# Inside /server
```Bash
npm run dev
```

## Start Frontend:
# Inside /client
```Bash
npm start
```

### 👤 Author
Durgesh Kumar
