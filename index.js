const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static('public'));

let jsonData = null;

// Use an asynchronous function to fetch data before starting the server
async function fetchData() {
    // Fetch JSON data from the API
    const response = await axios.get('https://s3.amazonaws.com/open-to-cors/assignment.json');
    const data = response.data;

    // Extract data from the 'products' key
    const productsData = data.products || {};

    // Create an array of products with additional ID property
    const productsArray = Object.entries(productsData).map(([id, product]) => ({
      ID: id,
      Popularity: parseInt(product.popularity),
      Price: parseFloat(product.price),
      Title: product.title,
      Subcategory: product.subcategory,
    }));

    // Sort the products array by descending popularity
    jsonData = productsArray.sort((a, b) => b.Popularity - a.Popularity);

}

// Call the asynchronous function to fetch data
fetchData();

// Define a route to render the search form
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Define a route to handle the ID search form submission
app.post('/searchById', (req, res) => {
  const searchId = parseInt(req.body.searchId);
  const result = jsonData.find(product => product.ID === searchId);
  res.json(result);
  console.log(result);
});

// Define a route to handle the Title search form submission
app.post('/searchByTitle', (req, res) => {
  const searchTitle = req.body.searchTitle;
  const result = jsonData.find(product => product.title===searchTitle);
  res.json(result);
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});