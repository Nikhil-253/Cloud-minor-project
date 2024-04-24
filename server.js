
// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path'); // Import path module
// Create Express app
const app = express();
const port = process.env.PORT || 5050;

//For connecting to product data base
//const express = require('express');
//const app = express();
const sql = require('mssql');
const azureStorage = require('azure-storage');
//const path = require('path');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname));
app.use(express.static(path.join(__dirname)));

// Database connection
const connection = mysql.createConnection({
    host: 'database-1.cji6es2kuoxh.us-east-2.rds.amazonaws.com',
    user: 'sagar',
    password: 'sagarkarar',
    database: 'logindatabase'
});

connection.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        return;
    }
    console.log('Connected to database.');
});

// Middleware
app.use(bodyParser.json());

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
app.use(express.static(path.join(__dirname))); // Assuming login.html is in the "login" directory
// Login endpoint
app.post('/login', (req, res) => {
    // Handle POST request to /login
    // Retrieve login credentials from request body
    const { email, username, password } = req.body;
    console.log("Easy login");
    let query = `SELECT * FROM login_details WHERE username = '${username}' AND password = '${password}'`;
    
    // Check if email is provided
    if (email) {
        query = `SELECT * FROM login_details WHERE email = '${email}' AND username = '${username}' AND password = '${password}'`;
    }

    // Execute query
    connection.query(query, (error, results, fields) => {
        if (error) {
            console.error('Error querying database: ' + error.stack);
            res.status(500).json({ success: false, message: 'Internal server error' });
            return;
        }

        // Check if user exists
        if (results.length > 0) {
            res.json({ success: true });
        } else {
            res.json({ success: false });
        }
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server is running on port http://localhost:${port}`);
    // console.log('listening at http://localhost:${}');
});
/*const express = require('express');
const app = express();
const path = require('path');

// Serve static files from the same directory as your server.js file
app.use(express.static(path.join(__dirname)));

app.listen(port, () => {
  console.log('Server is running on port ${port}');
});*/


//For connecting to product data base
/*const express = require('express');
const app = express();
const sql = require('mssql');
const azureStorage = require('azure-storage');
const path = require('path');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.set('views', path.join(__dirname));
app.use(express.static(path.join(__dirname)));*/

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
// Redirect from root URL to /home2
app.get('/', (req, res) => {
    res.redirect('/home2');
  });

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
// Function to query SQL Database for product details
async function getPlacedProducts(userid) {
    try {
        let pool = await sql.connect(config);
        let request = pool.request()
            .input('Username', sql.NVarChar(255), userid);

        let products = await request.query(`SELECT * FROM usercart WHERE Username = @Username AND status='ordered'`);
        return products.recordset;
    } catch (err) {
        console.error('SQL Database connection error:', err);
    }
}
// Route to render home page with product details
app.get('/myorders', async (req, res) => {
    console.log("Received request for home page");
    const userid = req.query.userid; // Retrieve the user ID from the query parameters

    console.log("Received request for my orders page for user:", userid);
    let ordered = await getPlacedProducts(userid);
    console.log(ordered);
    let orderedDetails = [];
    for (let order of ordered) {
       // let imageUrl = getImageUrl(`product-${order.id}.jpg`);  // Assuming image names are <product_id>.jpg
        orderedDetails.push({
            orderid:order.ProductId,
            name: order.name,
            description: order.description,
            price: order.price,
            imageUrl: order.imageUrl,
            status:order.status

        });
    }
    console.log("Rendering home page with product details");
    res.render('myorders.html', { orders: ordered });
});

// Middleware
app.use(bodyParser.json());

// Database configuration
const config2 = {
    server: 'productserverassign.database.windows.net',
    database: 'demo_productdb',
    user: 'serveradmin',
    password: 'S1g1r@K1r1r',
    options: {
        encrypt: true // For Azure SQL Database
    }
};
// Add entry to usercart table
app.post('/addEntry', async (req, res) => {
    try {
        const pool1 = await sql.connect(config2);
        // Display message in terminal when database connection is established
        console.log('Connected to database');
        
        const { Username, Name, Description, Price, ImageURL, Quantity, status } = req.body;
        const result = await pool1.request()
            .input('Username',Username)
            .input('Name', sql.NVarChar(255), Name)
            .input('Description', sql.NVarChar(sql.MAX), Description)
            .input('Price', sql.Decimal(10, 2), Price)
            .input('ImageURL', sql.NVarChar(255), ImageURL)
            .input('Quantity', sql.Int, Quantity)
            .input('status', sql.NVarChar(255),status)
            .query('INSERT INTO usercart (Username, Name, Description, Price, ImageURL, Quantity, status) VALUES (@Username, @Name, @Description, @Price, @ImageURL, @Quantity, @status)');
        
        res.status(200).send('Entry added successfully');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error adding entry');
    }
});
//usercart
// Route to fetch data from Azure SQL via GET method
app.get('/usercart', async (req, res) => {
    try {
        // Connect to the Azure SQL Database
        await sql.connect(config);

        // Retrieve the userid from the query parameters
        const userid = req.query.userid;
        console.log(userid);

        // Query to fetch cart items for the specified userid
        const result = await sql.query`SELECT * FROM usercart WHERE Username = ${userid} AND status='unordered'`;

        // Send the fetched data as a response
        res.json(result.recordset);
    } catch (error) {
        console.error('Error querying database:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Route to decrease quantity
app.put('/decreaseQuantity/:productId', async (req, res) => {
    const { productId } = req.params;
    try {
        await sql.query`UPDATE usercart SET Quantity = Quantity - 1 WHERE ProductId = ${productId}`;
        // Check if quantity is zero after decreasing
        const result = await sql.query`SELECT Quantity FROM usercart WHERE ProductId = ${productId}`;
        if (result.recordset[0].Quantity === 0) {
            // If quantity is zero, delete the item from the database
            await sql.query`DELETE FROM usercart WHERE ProductId = ${productId}`;
        }
        res.sendStatus(200);
    } catch (error) {
        console.error('Error updating quantity:', error);
        res.status(500).send('Internal Server Error');
    }
});


// Route to increase quantity
app.put('/increaseQuantity/:productId', async (req, res) => {
    const { productId } = req.params;
    try {
        await sql.query`UPDATE usercart SET Quantity = Quantity + 1 WHERE ProductId = ${productId}`;
        res.sendStatus(200);
    } catch (error) {
        console.error('Error updating quantity:', error);
        res.status(500).send('Internal Server Error');
    }
});
//payments logic

// Route to handle the POST request for marking entries as "ordered"
app.post('/markAsOrdered', async (req, res) => {
    try {
        // Connect to the Azure SQL Database
        await sql.connect(config);

        // Extract userid and totalCost from the request body
        const { userid, totalCartValue } = req.body;

        // Update the status for entries in usercart table with the given userid
        await sql.query`UPDATE usercart SET status = 'ordered' WHERE Username = ${userid}`;

        res.json({ message: 'Payment successful!', totalCartValue });
    } catch (error) {
        console.error('Error marking entries as ordered:', error);
        res.status(500).send('Internal Server Error');
    }
});



/*app.listen(port, () => {
    console.log('Server is running on port ${port}');
});*/
