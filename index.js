const express = require('express')
const path = require('path')
const bodyParser = require('body-parser');

const app = express();

const add1 = '5 Temasek Boulevard';
const add2 = '#09-01 Suntec Tower Five';
const pcode = '038985';
const cty = 'Singapore';
const curr = 'USD';
const price = '0.01';

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
    res.render('complete', {price:price});
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

    // 2a. Get the order ID from the request body
    const orderID = req.body.orderID;

    // 3. Call PayPal to get the transaction details
    const request = new checkoutNodeJssdk.orders.OrdersGetRequest(orderID);
    request.headers["prefer"] = "return=representation";

    //let order;
    try {
        const capture = await payPalClient.client().execute(request);
        const captureID = capture.result.purchase_units[0]
        .payments.captures[0].id;
        console.log('oid = ' + orderID + ', ' + 'tid = ' + captureID);
    } catch (err) {
        // 4. Handle any errors from the call
        console.error(err);
        return res.sendStatus(500);
    }

    // 5. Save the transaction in your database
    // await database.saveTransaction(orderID);

    // 6. Return a successful response to the client
    // Show a success message to your buyer
    res.redirect('/complete');
    alert('Transaction completed by ' + request.payer.name.given_name);
    return res.sendStatus(200);
})

// web server
app.listen('8080', () => console.log('Server listening is on'))
