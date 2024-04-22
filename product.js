const express = require('express');
const app = express();
const sql = require('mssql');
const azureStorage = require('azure-storage');
const path = require('path');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname));
app.use(express.static(path.join(__dirname)));

console.log("Express and view engine set up");

// Azure SQL Database connection config
const config = {
    user: 'bitthal',
    password: 'Bit2h@l1234',
    server: 'minorproject.database.windows.net',
    database: 'minorproject',
    driver: 'msnodesqlv8'
};
console.log("SQL Database config set up");

// Blob Storage connection config
const blobService = azureStorage.createBlobService('minorp', 'hIAx5SWgz9FuQV0YbyDd6e6eoljR2bvj3SjeA1xc5KeEQ2eNHkdlRAXivFACOwaTPuayserao9pc+AStkaUBRA==');
const containerName = 'images';
console.log("Blob Storage config set up");

// Function to query SQL Database for product details
async function getProducts() {
    try {
        let pool = await sql.connect(config);
        let products = await pool.request().query('SELECT * FROM Products');

        console.log("Products fetched from SQL Database");
        return products.recordset;
    } catch (err) {
        console.error('SQL Database connection error:', err);
    }
}

// Function to retrieve product images from Blob Storage
function getImageUrl(imageName) {
    let url = blobService.getUrl(containerName, imageName);
    //console.log(`Image URL fetched: ${url}`);
    return url;
}

// Route to render home page with product details
app.get('/home2', async (req, res) => {
    console.log("Received request for home page");
    let products = await getProducts();
    console.log(products);
    let productDetails = [];
    for (let product of products) {
        let imageUrl = getImageUrl(`product-${product.id}.jpg`);  // Assuming image names are <product_id>.jpg
        productDetails.push({
            name: product.name,
            description: product.description,
            price: product.price,
            imageUrl: imageUrl
        });
    }
    console.log("Rendering home page with product details");
    res.render('home2.html', { products: products });
});

app.listen(5050, () => {
    console.log('Server is running on port 5050');
});
