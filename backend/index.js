var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var config = require('./config');
var session = require('express-session');
var nodemailer = require('nodemailer');
var cors = require('cors');
const { Pool, Client } = require('pg')
var cron = require('node-cron');

const { sendEmail } = require("./api/sendEmail");

//=========== API modules ===================
var auth = require('./api/auth');
var buyerAuth = require('./api/buyer_auth');
var supplierInput = require('./api/supplier_input')
var usersModal = require('./api/usersModal')
var buyerModal = require('./api/buyerModal')
var buyerInput = require('./api/buyer_input');
const { query } = require('express');

//=========== Create server ===================
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

console.log(config.reactFrontend)
console.log("config.nodebackend=============================")
console.log(config.nodebackend)

//app.use(cors());
var corsOptions = {
	"methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
	"preflightContinue": false,
	credentials: true,
	origin: function (origin, callback) {
		console.log("Origin is ======================: " + origin);
		if (origin == config.reactFrontend) return callback(null, true);
		if (true) {
			return callback(null, true);
		}
		else {
			return callback(null, false);
		}
	},
	"optionsSuccessStatus": 204 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.options('*', cors(corsOptions));
//app.use(cors(corsOptions));

app.use(function (req, res, next) {

	// Website you wish to allow to connect
	// //have you check oringin in header
	console.log(req.headers.origin);
	res.setHeader('Access-Control-Allow-Origin', config.reactFrontend);
	console.log(req.headers.origin);
	//res.setHeader('Access-Control-Allow-Origin', req.headers.origin);

	// Request methods you wish to allow
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');

	// Request headers you wish to allow
	res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');

	// Set to true if you need the website to include cookies in the requests sent
	// to the API (e.g. in case you use sessions)
	res.setHeader('Access-Control-Allow-Credentials', true);

	// Pass to next layer of middleware
	next();
});

app.use(function (req, res, next) {
	try {
		/*option request handle */
		if (req.method === 'OPTIONS') {
			// //   console.log('!OPTIONS');
			var headers = {};
			// // IE8 does not allow domains to be specif	ied, just the *
			let origin = req.headers.origin;
			headers["Access-Control-Allow-Origin"] = config.reactFrontend;
			headers["Access-Control-Allow-Methods"] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
			headers["Access-Control-Allow-Credentials"] = true;
			headers["Access-Control-Max-Age"] = "86400"; // 24 hours
			headers["Access-Control-Allow-Headers"] = "origin, X-Requested-With, Content-Type, Accept";
			// headers["Access-Control-Allow-Headers"] = "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept";
			res.writeHead(200, headers);
			return res.end();
		}
		else { next(); }
	}
	catch (ex) {
		console.log(ex);
	}
});

//=========== Mysql connect ===================

const client = new Client({
	user: config.db_user,
	host: config.db_host,
	database: config.db_name,
	password: config.db_password,
	port: config.db_port,
})
client.connect();

client.query('SELECT NOW()', (err, res) => {
	if (err) {
		console.error('pg Connection Error: ' + err.message);
		process.exit();
	}
	console.log("pg server connected ....");
})
//========= Import api module ==================

app.use("/", auth)
// app.use("/", auth)
app.use("/buyer", buyerAuth)
supplierInput(app, client);
usersModal(app, client);
buyerModal(app, client);
buyerInput(app, client);

app.listen(config.port, () => {
	console.log("Application is running at localhost:" + config.port)
})

cron.schedule('*/5 * * * * *', () => {
	var db_query = "select distinct buyer_emailid from vw_buyer_details t Where t.request_date=current_date -1 and t.action_status='open'";
	client.query(db_query, (err, result) => {
		if (err) {
			return;
		}
		result.rows.forEach(async function (value, key) {
			var message = (
				'<table style="border: 1px solid #333;">' +
				'<thead>' +
				'<th> Supplier Number </th>' +
				'<th> Article Number </th>' +
				'<th> Requested Price </th>' +
				'<th> Reason </th>' +
				'<th> Price Effective Date </th>' +
				'</thead>'
			);
			var db_query = "select distinct suppl_no, art_no, new_price, price_change_reason, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date from vw_buyer_details t Where t.request_date =current_date-1 and t.action_status= 'open' and t.buyer_emailid ='" + value.buyer_emailid + "'";
			await client.query(db_query, (error, b_result) => {
				if (error) {
					return;
				}
				b_result.rows.forEach(function (value1, key1) {
					message += (
						'<tr>' +
						'<td>' + value1.suppl_no + '</td>' +
						'<td>' + value1.art_no + '</td>' +
						'<td>' + value1.new_price + '</td>' +
						'<td>' + value1.price_change_reason + '</td>' +
						'<td>' + value1.price_increase_effective_date + '</td>' +
						'</tr>'
					);
				});
				to = 'sharad.gaikwad02@metro-gsc.in'
				subject = 'Test Mail'
				html = message
				//sendEmail(to, subject, html, attachedment=null)		
			});			
		});
	})
});