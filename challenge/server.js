const express = require('express');
const app = express();
const PORT = 8080;

app.use(express.json());

// Mock data store for products
const products = new Map([
  [1, { id: 1, name: 'Laptop', price: 999.99, category: 'Electronics' }],
  [2, { id: 2, name: 'Coffee Mug', price: 12.99, category: 'Kitchen' }],
  [3, { id: 3, name: 'Notebook', price: 5.99, category: 'Stationery' }]
]);

let nextId = 4;

// Challenge 1: GET all products
// TODO: Return all products as an array
app.get('/api/products', (req, res) => {
  // IMPLEMENT ME
});

// Challenge 2: GET single product by ID
// TODO: Return the product with the given ID
// If not found, return 404 with message "Product not found"
app.get('/api/products/:id', (req, res) => {
  // IMPLEMENT ME
});

// Challenge 3: GET products by category (query parameter)
// Example: /api/products/search?category=Electronics
// TODO: Filter products by category from query parameter
// If no category provided, return all products
app.get('/api/products/search', (req, res) => {
  // IMPLEMENT ME
});

// Challenge 4: POST - Create new product
// TODO: Create a new product with name, price, and category
// Validate that all fields are provided
// Return 400 if validation fails
// Return 201 with the new product if successful
app.post('/api/products', (req, res) => {
  // IMPLEMENT ME
});

// Challenge 5: PUT - Update entire product
// TODO: Update product with given ID
// Validate all required fields (name, price, category)
// Return 404 if product not found
// Return 400 if validation fails
app.put('/api/products/:id', (req, res) => {
  // IMPLEMENT ME
});

// Challenge 6: PATCH - Partial update
// TODO: Update only the fields provided in request body
// At least one field must be provided
// Return 404 if product not found
// Return 400 if no fields to update
app.patch('/api/products/:id', (req, res) => {
  // IMPLEMENT ME
});

// Challenge 7: DELETE - Remove product
// TODO: Delete product with given ID
// Return 404 if product not found
// Return success message if deleted
app.delete('/api/products/:id', (req, res) => {
  // IMPLEMENT ME
});

app.listen(PORT, () => {
    console.log(`Challenge server running on http://localhost:${PORT}`);
    console.log('\n=== CHALLENGES TO COMPLETE ===');
    console.log('1. GET all products');
    console.log('2. GET single product by ID');
    console.log('3. GET products by category (query param)');
    console.log('4. POST create new product');
    console.log('5. PUT update entire product');
    console.log('6. PATCH partial update product');
    console.log('7. DELETE remove product');
    console.log('\nTest your implementations in Postman!');
  });