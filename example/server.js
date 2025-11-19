const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

// dotenv.config();

const app = express();
app.use(express.json());

MONGO_URI = "mongodb://localhost:27017/test"

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  // .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));


// CREATE (POST /users)
app.post("/users", async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL (GET /users)
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

// UPDATE (PUT /users/:id)
app.put("/users/:id", async (req, res) => {
  try {
    const updated = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json(updated);
  } catch {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

// DELETE (DELETE /users/:id)
app.delete("/users/:id", async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted" });
  } catch {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

// GET /users/age-range?min=20&max=30
app.get("/users/age-range", async (req, res) => {
  const { min, max } = req.query;

  if (!min || !max) {
    return res.status(400).json({ error: "min and max query params are required" });
  }

  try {
    const users = await User.find({
      age: { $gte: Number(min), $lte: Number(max) }
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /users/min-age?value=18
app.get("/users/min-age", async (req, res) => {
  const { value } = req.query;

  if (!value) {
    return res.status(400).json({ error: "value query param is required" });
  }

  try {
    const users = await User.find({
      age: { $gte: Number(value) }
    });
    console.log(users)
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /users/max-age?value=30
app.get("/users/max", async (req, res) => {
  const { value } = req.query;
  try {
    const users = await User.find({
      age: { $lte: Number(value) }
    });

    console.log(users)
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /users/domain?value=dal.ca
app.get("/users/domain", async (req, res) => {
  const { value } = req.query;

  if (!value) {
    return res.status(400).json({ error: "value query param is required" });
  }

  try {
    const regex = new RegExp(`@${value}$`, "i"); // e.g. /@dal\.ca$/i
    const users = await User.find({ email: regex });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /users/search
// Example: /users/search?minAge=20&maxAge=30&domain=dal.ca&name=has&sort=-age

app.get("/users/search", async (req, res) => {
  try {
    const { minAge, maxAge, domain, name, sort } = req.query;

    // Start a mongoose query
    let query = User.find();

    // Minimum age filter
    if (minAge) {
      query = query.where("age").gte(Number(minAge));
    }

    // Maximum age filter
    if (maxAge) {
      query = query.where("age").lte(Number(maxAge));
    }

    // Filter by email domain
    if (domain) {
      const regex = new RegExp(`@${domain}$`, "i");
      query = query.where("email").regex(regex);
    }

    // Partial name search (case-insensitive)
    if (name) {
      const regex = new RegExp(name, "i");
      query = query.where("name").regex(regex);
    }

    // Sorting
    if (sort) {
      query = query.sort(sort); 
      // examples: ?sort=name or ?sort=-age
    }

    // Execute the query
    const users = await query;

    res.json(users);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ ONE (GET /users/:id)
app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

PORT = 8000
// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

