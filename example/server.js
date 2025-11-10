const express = require('express');
const app = express();
const PORT = 8080;

// Middleware to parse JSON
app.use(express.json());

// Mock data
const users = new Map([
  [1, { id: 1, name: 'Alice', email: 'alice@example.com' }],
  [2, { id: 2, name: 'Bob', email: 'bob@example.com' }],
  [3, { id: 3, name: 'Charlie', email: 'charlie@example.com' }]
]);

let nextId = 4;

// GET - Root endpoint
app.get('/', (req, res) => {
  res.send('Hello World');
});

// GET - API endpoint
app.get('/api/', (req, res) => {
  res.send('This is the API endpoint');
});

// GET - Read all users
app.get('/api/users', (req, res) => {
  const allUsers = Array.from(users.values());
  res.json(allUsers);
});

// GET - Read single user by ID
app.get('/api/users/:id', (req, res) => {
  console.log(req.method, req.url, req.params);
  const id = parseInt(req.params.id);
  const user = users.get(id);
  
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// POST - Create new user
app.post('/api/users', (req, res) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }
  
  const newUser = {
    id: nextId++,
    name,
    email
  };
  
  users.set(newUser.id, newUser);
  res.status(201).json(newUser);
});

// PUT - Update entire user
app.put('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email } = req.body;
  
  if (!users.has(id)) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  if (!name || !email) {
    return res.status(400).json({ message: 'Name and email are required' });
  }
  
  const updatedUser = { id, name, email };
  users.set(id, updatedUser);
  res.json(updatedUser);
});

// DELETE - Remove user
app.delete('/api/users/:id', (req, res) => {
  const id = parseInt(req.params.id);
  
  if (users.has(id)) {
    users.delete(id);
    res.json({ message: 'User deleted successfully' });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Test endpoints in Postman:');
  console.log(`  GET    http://localhost:${PORT}/`);
  console.log(`  GET    http://localhost:${PORT}/api/`);
  console.log(`  GET    http://localhost:${PORT}/api/users`);
  console.log(`  GET    http://localhost:${PORT}/api/users/1`);
  console.log(`  POST   http://localhost:${PORT}/api/users`);
  console.log(`  PUT    http://localhost:${PORT}/api/users/1`);
  console.log(`  DELETE http://localhost:${PORT}/api/users/1`);
});