const http = require('http');
var nodemailer = require('nodemailer');
//=========== MonthEnd API Module ===================
module.exports = function(app, con) {
    app.get('/supplier_input', async function(req, res){
		var data = {};
		var supplierIDOptions = [];
		var articleOptions = [];		

		var getUniqueSupplierIdQuery = "SELECT DISTINCT suppl_no FROM public.vw_request_details";

		await con.query(getUniqueSupplierIdQuery, function(err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else{				
				result.rows.forEach(function(value, key) {
					option = { value: value.suppl_no, label: value.suppl_no }
					supplierIDOptions.push(option);
				});
				data.supplierIDOptions = supplierIDOptions;
            }			
		});
		if(req.query.searchSupplierNumber != ''){
			var getUniqueArticleQuery = "SELECT DISTINCT art_no FROM public.vw_request_details WHERE suppl_no = '"+req.query.searchSupplierNumber+"'";

			console.log(getUniqueArticleQuery);

			await con.query(getUniqueArticleQuery, function(err, result) {
				if (err) {
					res.json({ status: false });
					return;
				} else{				
					result.rows.forEach(function(value, key) {
						option = { value: value.art_no, label: value.art_no }
						articleOptions.push(option);
					});
					data.articleOptions = articleOptions;
				}			
			});
		}else{
			data.articleOptions = articleOptions;
		}		

        var condition  = '';

        if (req.query.searchSupplierNumber != ''){
            condition = condition + " AND suppl_no = '" +req.query.searchSupplierNumber+"'"
        }

		console.log(req.query.searchArticleNumber)

        if (req.query.searchArticleNumber != '' && req.query.searchArticleNumber != undefined){
			console.log("I am here")
            condition = condition +" AND art_no = '" +req.query.searchArticleNumber+"'"
        }

        if (req.query.searchRequestedDate != ''){
            condition = condition + " AND request_date = '" +req.query.searchRequestedDate+"'"
        }

        var query = "SELECT country_name, bdm_global_umbrella_no, bdm_global_umbrella_name, suppl_no, suppl_name, suppl_name_tl, vat_no, art_no, art_name, art_name_tl, current_price, request_date, new_price, price_change_reason, suppl_updated_datetime, suppl_updated_by, negotiate_final_price, internal_metro_comment, price_increase_communicated_date, price_increase_effective_date, buyer_name, buyer_updated_datetime, price_increase_perc, agreed_price_increase_perc, price_difference, price_difference_perc, action_status, record_insert_date FROM public.vw_request_details where action_status='Open' and new_price IS NOT NULL and request_date IS NOT NULL " + condition;

        console.log(query)
		
        await con.query(query, function(err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else{
				data.supplierInputs = result.rows
                res.json({ status: true, data: data });
				return;
            }			
		});
    });

	app.post('/add_supplier_input', function(req, res){
		var country = 'HUNGERY';
		sql=`CALL public."usp_addNewRequest"('` + req.body.article_number + `','` + req.body.supplier_number +`','`+ country +`',`+ req.body.new_price +`,'` + req.body.reason + `');`;

		console.log(sql);

		con.query(sql, function(err, result) {
			if (err) {
				console.log(err);
				res.json({ status: false });
				return;
			};
			res.json({ status: true, data: result });
			return;		
		});	
    });

	app.get('/supplier_article_details', async function(req, res){

		var query = "SELECT suppl_no, art_no, art_name_tl, bdm_global_umbrella_name, new_price FROM public.vw_request_details where suppl_no = '"+req.query.supplier_number +"'";

		console.log(query);

		await con.query(query, function(err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else{				
				res.json({ status: true, data: result.rows });
				return;
            }			
		});
	});

	app.post('/delete_supplier_input', async function(req, res){

		var query = "Update FROM public.vw_request_details where id = '"+req.body.id +"'";

		console.log(query);

		await con.query(query, function(err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else{				
				res.json({ status: true, data: result.rows });
				return;
            }			
		});
	});

	app.get('/getArticlesBySupplierNumber', async function(req, res){
		var data = {};
		var articleOptions = [];
		var getUniqueArticleQuery = "SELECT DISTINCT art_no FROM public.vw_request_details WHERE suppl_no = '"+req.query.supplierNumber+"'";
		console.log(getUniqueArticleQuery);
		await con.query(getUniqueArticleQuery, function(err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else{
				result.rows.forEach(function(value, key) {
					option = { value: value.art_no, label: value.art_no }
					articleOptions.push(option);
				});
				data.articleOptions = articleOptions;
				res.json({ status: true, data: data });
				return;
            }			
		});
	});

	app.post('/upload_supplier_input', async function(req, res){
		var supplier_inputs = req.body.supplier_inputs
		supplier_inputs.forEach(function(value, key) {
			console.log("=======================");
			console.log(value);
		});
	});

    var sendEmail = async function() {
		var user_email = "sharad.gaikwad02@metro-gsc.in"
		var password = "metroindia1$"

		// Create the transporter with the required configuration for Outlook
		var transporter = nodemailer.createTransport({
		    host: "outlook.office365.com", 	// hostname
		    secureConnection: false, 		// TLS requires secureConnection to be false
		    port: 443,
            secure: false,
		    auth: {
		        user: user_email,
		        pass: password
		    }
		});

		// setup e-mail data, even with unicode symbols
		var mailOptions = {
		    from: user_email, 	// sender address (who sends)
		    to: 'sharad.gaikwad02@metro-gsc.in', 	// list of receivers (who receives)
		    subject: 'this is subject', 	// Subject line
		    html: 'this is body' 	// html body
		};

		// send mail with defined transport object
		await transporter.sendMail(mailOptions, function(error, info){
		    if(error){
		        return console.log(error);
		    }

		    console.log('Message sent: ' + info.response);
		});
	}
}
