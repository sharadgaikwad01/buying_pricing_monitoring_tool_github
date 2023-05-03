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
const { createSupplierAssortments } = require("./api/pdf_creation");
var path = require('path');


//=========== API modules ===================
var auth = require('./api/auth');
var buyerAuth = require('./api/buyer_auth');
var supplierInput = require('./api/supplier_input')
var usersModal = require('./api/usersModal')
var buyerModal = require('./api/buyerModal')
var buyerInput = require('./api/buyer_input');
var dashboard = require('./api/dashboard');
const { query } = require('express');

//=========== Create server ===================
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//app.use(cors());
var corsOptions = {
	"methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
	"preflightContinue": false,
	credentials: true,
	origin: function (origin, callback) {
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
dashboard(app, client);

app.listen(config.port, () => {
	console.log("Application is running at localhost:" + config.port)
})

var open_request = cron.schedule('* * * * * *', () => {
	var db_query = "select distinct buyer_fullname as name, buyer_emailid, country_name from vw_buyer_details t Where t.request_date=current_date -1 and t.action_status='open'";
	client.query(db_query, (err, result) => {
		if (err) {
			console.log(err)
			return;
		}
		result.rows.forEach(async function (value, key) {	
			var db_query = "select distinct coalesce(suppl_name_tl,suppl_name) as suppl_name, suppl_no, suppl_name, art_no, new_price, price_change_reason, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date from vw_buyer_details t Where t.request_date =current_date-1 and t.action_status= 'open' and t.buyer_emailid ='" + value.buyer_emailid + "'";
			var message = '';
			await client.query(db_query, async (error, b_result) => {
				if (error) {
					return;
				}
				if(b_result.rowCount > 0){
					message = (
						'Hi '+value.name+', <br><br>'+
						'This is a notice that there is a price change request made by supplier on BPMT tool.'+
						'<br>For more information, please visit the BPMT portal. <a href="'+config.reactFrontend+'/buyer_login" >Click here </a><br>'+
						'<br>If you require any assistance, please contact our support email address: support-hyperautomation@metro-gsc.in'+
						'<br><br>Sincerely,'+
						'<br>Team BPMT'+	
						'<br><br><br><p style="font-size: 10px;">Note: This email was sent from a notification-only address that cannot accept incoming email. Please do not reply to this message.</p>'			
					);
					to = value.buyer_emailid;
					//to = 'archanaaditya.deokar@metro-gsc.in'
					subject = 'A new price change request has been submitted by the supplier - BPMT'
					html = message
					//sendEmail(to, subject, html, attachedment=null)	
				}
			});			
		});
	})
});

open_request.stop();

var closed_request = cron.schedule('*/10 * * * * *', () => {
	var db_query = "select distinct buyer_fullname as name, country_name, buyer_emailid from vw_buyer_details t Where t.request_date=current_date-2 and t.action_status='closed'";
	client.query(db_query, (err, result) => {
		if (err) {
			console.log(err)
			return;
		}
		if(result.rowCount > 0){
			result.rows.forEach(async function (value, key) {
				var db_query = "select distinct coalesce(suppl_name_tl,suppl_name) as suppl_name, suppl_no, art_no, art_name, frmt_new_price as new_price, frmt_negotiate_final_price as final_price, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date from vw_buyer_details t Where t.request_date =current_date-2 and t.action_status= 'closed' and t.buyer_emailid ='" + value.buyer_emailid + "'";
				var message = '';
				await client.query(db_query, async (error, b_result) => {
					if (error) {
						console.log(error)
						return;
					}
					if(b_result.rowCount > 0){
						var name = value.name.replace(" ","_");
						var supplier_name = b_result.rows[0].suppl_name;
						var file_path = path.join(__dirname+'/cron-pdf/supplier_assortments_'+name+'.pdf');
						var flag = 'cron-job';
						await createSupplierAssortments(b_result.rows, file_path, null, value.country_name, value.name, flag, supplier_name, value.buyer_emailid)
					}
				});			
			});
		}
	})
});

closed_request.stop();