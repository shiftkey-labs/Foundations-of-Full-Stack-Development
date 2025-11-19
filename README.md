# Battle of the Memes - Full Stack Reference Project

A complete meme voting application built with the MERN stack. This project demonstrates all the core concepts you'll need for your fullstack course project.

## Table of Contents
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Understanding the Architecture](#understanding-the-architecture)
- [API Documentation](#api-documentation)
- [Key Concepts Explained](#key-concepts-explained)

---

## Tech Stack

**Frontend:**
- React with Vite
- React Router for navigation
- Tailwind CSS for styling
- Axios for API calls

**Backend:**
- Node.js & Express
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- Multer for file uploads (optional)

---

## Project Structure

```
battle-of-memes (root) /
├── client/                 # Frontend React app
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # Auth context
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                # Backend Express app
│   ├── models/           # Mongoose schemas
│   ├── routes/           # API routes
│   ├── middleware/       # Custom middleware
│   ├── server.js         # Entry point
│   └── package.json
│
└── README.md
```

**Why this structure?**
Separating frontend and backend into distinct folders makes it easier to:
- Deploy them independently (Vercel for frontend, Render for backend)
- Work on one without affecting the other
- Scale and maintain each part separately
- Collaborate with team members in larger projects

---

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (community server) or MongoDB Atlas (free tier)
- Git

### Backend Setup

1. **Navigate to server directory:**
```bash
cd server
npm install
```

2. **Create `.env` file in server directory (copy from sample.env):**

3. **Start the backend:**
```bash
npm start 
```

Server will run on `http://localhost:8000`

### Frontend Setup

**Navigate to client directory:**
```bash
cd client
npm install
```

1. **Start the frontend:**
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

---

## Understanding the Architecture

### How Authentication Works (JWT Flow)

1. **User Signs Up:**
   - Frontend sends username, email, password
   - Backend hashes password with bcrypt
   - User saved to database
   - JWT token generated and returned

2. **User Logs In:**
   - Frontend sends email and password
   - Backend compares hashed password
   - If match, JWT token generated and returned
   - Frontend stores token in localStorage

3. **Protected Requests:**
   - Frontend includes token in Authorization header
   - Backend middleware verifies token
   - If valid, request proceeds; if not, returns 401 error

**Why JWT?**
- Stateless: Server doesn't need to store session data
- Scalable: Works across multiple servers
- Contains user info: No database lookup needed for every request

### Database Relationships

```
User ──┬── Meme (one user has many memes)
       │
       └── Comment (one user has many comments)

Meme ──┬── Comment (one meme has many comments)
       │
       └── Vote (one meme has many votes)

Vote ─── User (one user can vote on many memes)
```

**Why separate Vote collection?**
- Prevents duplicate votes (one vote per user per meme)
- Easy to query vote counts
- Can track upvotes vs downvotes separately

---

## API Documentation

### Authentication Routes

**POST** `/api/auth/signup`
```json
Request:
{
  "username": "memeLord",
  "email": "memes@example.com",
  "password": "secure123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "username": "memeLord",
    "email": "memes@example.com"
  }
}
```

**POST** `/api/auth/login`
```json
Request:
{
  "email": "memes@example.com",
  "password": "secure123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": { ... }
}
```

### Meme Routes

**GET** `/api/memes` - Get all memes (public)

**POST** `/api/memes` - Create new meme (protected)
```json
Request:
{
  "title": "My Funny Meme",
  "imageUrl": "https://example.com/meme.jpg"
}
Headers: {
  "Authorization": "Bearer <token>"
}
```

**PUT** `/api/memes/:id` - Update meme (protected, owner only)

**DELETE** `/api/memes/:id` - Delete meme (protected, owner only)

**POST** `/api/memes/:id/vote` - Vote on meme (protected)
```json
Request:
{
  "voteType": "up" // or "down"
}
```

### Leaderboard Route

**GET** `/api/leaderboard` - Get top memes by votes

---

## 🧠 Key Concepts Explained

### 1. Password Hashing with bcrypt

**Why we never store plain passwords:**
```javascript
// ❌ NEVER DO THIS
const user = new User({
  password: "mypassword123"
});

// ALWAYS HASH
const hashedPassword = await bcrypt.hash(password, 10);
const user = new User({
  password: hashedPassword
});
```

**What the number 10 means:**
The "salt rounds" - higher numbers are more secure but slower. 10 is a good balance.

### 2. Middleware for Route Protection

```javascript
// middleware/auth.js
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // Add user ID to request
    next(); // Continue to route handler
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
```

**How to use:**
```javascript
// Protected route
router.post('/memes', verifyToken, createMeme);
```

### 3. React Context for Global Auth State

**Why use Context?**
Instead of passing user data through every component as props (prop drilling), Context provides a global state accessible anywhere.

```javascript
// context/AuthContext.jsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  
  // Login, logout, check auth status
  
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Use anywhere:
const { user, logout } = useContext(AuthContext);
```

### 4. CORS - Connecting Frontend to Backend

```javascript
// server.js
const cors = require('cors');

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
```

**What is CORS?**
Cross-Origin Resource Sharing allows your frontend (port 5173) to make requests to your backend (port 8000). Without it, browsers block these requests for security.

### 5. Error Handling Best Practices

```javascript
// No Try and No Catch = Bad :(
app.post('/api/memes', async (req, res) => {
  const meme = await Meme.create(req.body);
  res.json(meme);
});

// Try and Catch :)
app.post('/api/memes', async (req, res) => {
  try {
    const meme = await Meme.create(req.body);
    res.status(201).json(meme);
  } catch (error) {
    console.error('Error creating meme:', error);
    res.status(500).json({ 
      message: "Failed to create meme",
      error: error.message 
    });
  }
});
```

**Why?**
- Prevents server crashes
- Provides helpful error messages to frontend
- Makes debugging easier

### Frontend Form Validation

```javascript
const [errors, setErrors] = useState({});

const validateForm = () => {
  const newErrors = {};
  
  if (!title.trim()) {
    newErrors.title = "Title is required";
  }
  
  if (!imageUrl.trim()) {
    newErrors.imageUrl = "Image URL is required";
  } else if (!isValidUrl(imageUrl)) {
    newErrors.imageUrl = "Please enter a valid URL";
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

**Why validate on frontend AND backend?**
- Frontend: Better user experience (instant feedback)
- Backend: Security (never trust client data)

--
## Tips for Your Own Project

1. **Start with the data model** - Design your database schema first
2. **Build backend API completely before frontend** - Test with Postman/Thunder Client
3. **One feature at a time** - Don't try to build everything at once
4. **Git commits frequently** - Commit after each working feature
5. **Handle errors everywhere** - Both frontend and backend
6. **Test authentication thoroughly** - This is where most bugs happen
7. **Use meaningful variable names** - Your future self will thank you (trust bro)
8. **Add loading states** - Makes your app feel more professional (or cooler)

---

## Common Issues & Solutions

**MongoDB connection fails:**

- Check your IP whitelist in MongoDB Atlas or local MongoDB
- Ensure password doesn't contain special characters (or URL encode it)

**CORS errors:**

- Check backend CORS configuration
- Verify frontend is sending credentials correctly
- Ensure API URL is correct in frontend .env

**JWT token not working:**

- Check token is saved to localStorage
- Verify Authorization header format: `Bearer <token>`
- Ensure JWT_SECRET is the same for signing and verifying

**Can't login after signup:**

- Check password hashing in signup
- Verify password comparison in login

---

## Additional Resources

- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [React Router Tutorial](https://reactrouter.com/en/main/start/tutorial)
- [JWT.io](https://jwt.io/) - Decode and understand JWTs
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

## Contributing

This is a reference project for learning. Feel free to:

- Fork it and experiment
- Use it as a template for your own project
- Suggest improvements via issues
- 
---

**Remember:** This project is a learning tool. Understand each part, don't just copy-paste. The goal is to learn the concepts so you can build your own unique application!