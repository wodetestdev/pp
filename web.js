const express = require('express')
const path = require('path')
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 5000;
// call the database connectivity function

const add1 = '5 Temasek Boulevard';
const add2 = '#09-01 Suntec Tower Five';
const pcode = '038985';
const cty = 'Singapore';
const curr = 'USD';
const price = '0.01';
var orderID;
var txnID;

//configure bodyparser
const bodyParserJSON = bodyParser.json();
const bodyParserURLEncoded = bodyParser.urlencoded({extended:true});

///// configure app.use() /////
app.use(bodyParserJSON);
app.use(bodyParserURLEncoded);


// set public directory to serve static html files
app.use('/', express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public/views'))


///// Configure Routes /////
app.get('/', function(req, res) {
    res.render('checkout', { address1: add1, address2: add2, postal: pcode, country: cty, currency: curr, price: price });
});

app.get('/complete', function(req, res) {
    res.render('complete', {price:price, txnID:txnID});
});

app.get('*', function(req, res) {
    res.render('error');
});


///// Paypal Routes /////
// 1. Set up your server to make calls to PayPal
// 1a. Import the SDK package
const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

// 1b. Import the PayPal SDK client that was created in `Set up the Server SDK`.
const payPalClient = require('./Common/payPalClient');

// 2. Set up your server to receive a call from the client
app.post('/api/order_complete', async function handleRequest(req, res) {

    // 2a. Get details from the request body
    orderID = req.body.orderID;
    txnID = req.body.transactionID;
    const createTime = req.body.transactionTime;

    console.log(orderID + '/' + txnID + '/' +createTime);

    // 3. Save the transaction in your database
    // await database.saveTransaction(orderID);

    // 6. Return a successful response to the client
    res.sendStatus(200);

})


// web server
app.listen(port, () => console.log('Server listening is on'))
