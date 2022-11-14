var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var config = require('./config');
var session = require('express-session');
var nodemailer = require('nodemailer');
var cors = require('cors');
const { Pool, Client } = require('pg')

//=========== API modules ===================
var auth = require('./api/auth');
var supplierInput = require('./api/supplier_input')
var usersModal = require('./api/usersModal')
var buyerModal = require('./api/buyerModal')
var buyerInput = require('./api/buyer_input')

//=========== Create server ===================
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(cors());
var corsOptions = {
	"methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
	"preflightContinue": false,
	credentials: true,
	origin: function (origin, callback){
		console.log("Origin is: " + origin);
		if (origin == config.reactFrontend ) return callback(null, true);
		if (true) {
			return callback(null, true);
		}
		else{
			return callback(null, false);
		}
	},
	"optionsSuccessStatus": 204 // some legacy browsers (IE11, various SmartTVs) choke on 204
}
app.options('*', cors(corsOptions));
//app.use(cors(corsOptions));

app.use(function(req, res, next) {

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
		else { next();}
	}
	catch(ex){
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
supplierInput(app, client);
usersModal(app, client);
buyerModal(app, client);
buyerInput(app, client);

app.listen(config.port, () => {
	console.log("Application is running at localhost:" + config.port)
})