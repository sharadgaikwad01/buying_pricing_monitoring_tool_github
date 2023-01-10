const http = require('http');
const Https = require('https');
var nodemailer = require('nodemailer');
var async = require("async");
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
var path = require('path');

//=================================== sendEmail ==============================================

async function sendEmail (to, subject, html, attachedment=null) {
	// Create the transporter with the required configuration for Outlook
	var transporter = nodemailer.createTransport({
		host: "viruswall.mgi.de", // hostname
		secureConnection: false,
		secure: false,
		port: 25
	});

	// setup e-mail data, even with unicode symbols
	var mailOptions = {
		from: 'sharad.gaikwad02@metro-gsc.in', 	// sender address (who sends)
		to: to, 	// list of receivers (who receives)
		subject: subject, 	// Subject line
		html: html 	// html body
	};

	// send mail with defined transport object
	await transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			return console.log(error);
		}
		console.log('Message sent: ' + info.response);
	});
}

module.exports = {
    sendEmail
};