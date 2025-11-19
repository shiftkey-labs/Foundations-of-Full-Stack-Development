const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Schema defines the shape of documents in the collection
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true, // No two users can have same username
    trim: true, // Remove whitespace from beginning/end
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true, // Store emails in lowercase
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
    // We need to hash this before saving
  }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// PRE-SAVE HOOK
// This function runs BEFORE a user document is saved to the database
// We use it to hash the password
userSchema.pre('save', async function(next) {
  // Only hash the password if it's new or modified
  if (!this.isModified('password')) {
    return next();
  }
  
  // This is hashing the password to make it secure when storing to DB
  // This is a famous one for password, other are SHA-1,SHA-256, SHA-512, argon2, bcrypt, etc.
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// INSTANCE METHOD
// This method can be called on any user document: user.comparePassword()
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    // bcrypt.compare hashes the candidate and compares with stored hash
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// When we send user object to frontend, don't include password
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  return user;
};

// Create and export the model
// First argument is the model name, second is the schema
// Mongoose will create a 'users' collection (lowercase, plural)
module.exports = mongoose.model('User', userSchema);