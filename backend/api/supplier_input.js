const http = require('http');
var nodemailer = require('nodemailer');
//=========== MonthEnd API Module ===================
module.exports = function(app, con) {
    app.get('/supplier_input', async function(req, res){
		var data = {};
		var supplierIDOptions = [];
		var articleOptions = [];

		var getUniqueSupplierIdQuery = "select distinct t1.suppl_no from vw_suppl_info t1 where country_name='"+req.query.country+"' AND vat_no='"+req.query.vat_number+"'";

		console.log(getUniqueSupplierIdQuery);

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
			var getUniqueArticleQuery = "select distinct art.art_no from tbl_article art inner join tbl_supplier suppl ON art.suppl_no = suppl.suppl_no and art.umbrella_no = suppl.umbrella_no and art.country_name = suppl.country_name Where suppl.suppl_no='"+req.query.searchSupplierNumber+"' and suppl.country_name ='"+req.query.country+"' and suppl.vat_no ='"+req.query.vat_number+"'";

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

		console.log(req.query.country);

        if (req.query.searchSupplierNumber != ''){
            condition = condition + " AND suppl_no = '" +req.query.searchSupplierNumber+"'"
        }

        if (req.query.searchArticleNumber != '' && req.query.searchArticleNumber != undefined){
            condition = condition +" AND art_no = '" +req.query.searchArticleNumber+"'"
        }

        if (req.query.searchRequestedDate != ''){
            condition = condition + " AND request_date = '" +req.query.searchRequestedDate+"'"
        }

		if (req.query.searchStatus != ''){
            condition = condition + " AND action_status = '" +req.query.searchStatus+"'"
        }

        var query = "SELECT suppl_no, art_no, art_name, new_price, to_char(request_date, 'YYYY-MM-dd') as request_date, to_char(negotiate_final_price, 'YYYY-MM-dd') as negotiate_final_price, to_char(price_increase_communicated_date, 'YYYY-MM-dd') as price_increase_communicated_date, price_increase_effective_date, action_status FROM public.vw_request_details where country_name='"+req.query.country+"' AND vat_no='"+req.query.vat_number+"' AND new_price IS NOT NULL AND request_date IS NOT NULL " + condition;
		
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
		var data = {};
		sql=`CALL public."usp_addNewRequest"('` + req.body.article_number + `','` + req.body.supplier_number +`','`+ req.body.country +`',`+ req.body.new_price +`,'` + req.body.reason + `');`;

		con.query(sql, async function(err, result) {
			if (err) {
				console.log(err);
				res.json({ status: false });
				return;
			};

			var query = "SELECT suppl_no, art_no, art_name, new_price, to_char(request_date, 'YYYY-MM-dd') as request_date, to_char(negotiate_final_price, 'YYYY-MM-dd') as negotiate_final_price, to_char(price_increase_communicated_date, 'YYYY-MM-dd') as price_increase_communicated_date, price_increase_effective_date, action_status FROM public.vw_request_details where country_name='"+req.body.country+"' AND vat_no='"+req.body.vat_number+"' AND new_price IS NOT NULL AND request_date IS NOT NULL ";

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
    });

	app.get('/supplier_article_details', async function(req, res){

		var query = "select art.country_name, vat_no, art.suppl_no, art_no, art_name_tl, umbrella_name, '' as new_price, '' as price_change_reason from tbl_article art inner join tbl_supplier suppl ON art.suppl_no = suppl.suppl_no and art.umbrella_no = suppl.umbrella_no and art.country_name = suppl.country_name Where suppl.suppl_no='"+req.query.supplier_number +"' and suppl.country_name ='"+req.query.country +"' and suppl.vat_no ='"+req.query.vat_number +"'";

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

		var query = "Update FROM public.vw_request_details where row_id = '"+req.body.id +"'";

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

		var getUniqueArticleQuery = "select distinct art.art_no from tbl_article art inner join tbl_supplier suppl ON art.suppl_no = suppl.suppl_no and art.umbrella_no = suppl.umbrella_no and art.country_name = suppl.country_name Where suppl.suppl_no='"+req.query.supplierNumber+"' and suppl.country_name ='"+req.query.country+"' and suppl.vat_no ='"+req.query.vat_number+"'";

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
		var data = {};
		var supplier_inputs = req.body.supplier_inputs
		var len = 0;		
		var sucess_count = 0;
		var error_count = 0;

		await supplier_inputs.forEach(async function(value, key) {
			if(value.new_price && value.new_price != 'null' && value.new_price != undefined && value.new_price != null ){
				sql=`CALL public."usp_addNewRequest"('` + value.art_no + `','` +value.suppl_no +`','`+ value.country_name +`',`+ value.new_price +`,'` + value.price_change_reason + `');`;

				await con.query(sql, function(err, result) {
					if (err) {
						console.log(err.message)
						if (err.message = 'Duplicate entry'){
							res.json({ status: false, message: "Duplicate entry" });
							return;
						}
					} else {
						sucess_count = +(sucess_count + 1);
						console.log(len-1)
						console.log(sucess_count)
						if( len-1 == sucess_count){
							var query = "SELECT suppl_no, art_no, art_name, new_price, to_char(request_date, 'YYYY-MM-dd') as request_date, to_char(negotiate_final_price, 'YYYY-MM-dd') as negotiate_final_price, to_char(price_increase_communicated_date, 'YYYY-MM-dd') as price_increase_communicated_date, price_increase_effective_date, action_status FROM public.vw_request_details where country_name='"+req.body.country+"' AND vat_no='"+req.body.vat_number+"' AND new_price IS NOT NULL AND request_date IS NOT NULL ";
							
							con.query(query, function(err, result) {
								if (err) {
									res.json({ status: false });
									return;
								} else{
									data.supplierInputs = result.rows
									res.json({ status: true, data: data });
									return;
								}			
							});
						}
					}					
				});
			}			
		});		
	});

    var sendEmail = async function() {
		var user_email = "sharad.gaikwad02@metro-gsc.in"
		var password = "metroindia1$"

		// Create the transporter with the required configuration for Outlook
		var transporter = nodemailer.createTransport({
		    host: "viruswall.mgi.de", 	// hostname
		    secureConnection: false, 		// TLS requires secureConnection to be false
		    port: 25,
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
