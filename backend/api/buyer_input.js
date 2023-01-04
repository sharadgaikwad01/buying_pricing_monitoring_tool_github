const http = require('http');
const Https = require('https');
var nodemailer = require('nodemailer');
var async = require("async");
const fs = require('fs');
const { createSupplierAssortments } = require("./pdf_creation");
const PDFDocument = require('pdfkit');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
var path = require('path');
//=========== MonthEnd API Module ===================
module.exports = function(app, con) {
    app.get('/buyer_input', async function(req, res){
		var data = {};
		var supplierIDOptions = [];
		var categoryOptions = [];

		var getUniqueSupplierIdQuery = "SELECT distinct t.suppl_no FROM public.vw_buyer_details t where t.buyer_emailid = '"+req.query.email+"'";

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

		var getUniqueCatQuery = "select distinct stratbuyer_name,buyer_emailid,country_name from public.tbl_buyer_details where country_name='"+req.query.country+"' AND buyer_emailid='"+req.query.email+"'";

		await con.query(getUniqueCatQuery, function(err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else{		
				result.rows.forEach(function(value, key) {
					option = { value: value.stratbuyer_name, label: value.stratbuyer_name }
					categoryOptions.push(option);
				});
				data.categoryOptions = categoryOptions;
            }
		});

        var condition  = '';

        if (req.query.searchSupplierNumber != ''){
            condition = condition + " AND suppl_no = '" +req.query.searchSupplierNumber+"'"
        }

        if (req.query.searchRequestedDate != '' && req.query.searchRequestedDate != undefined){
			var searchRequestedDate = req.query.searchRequestedDate.split(' ')
            condition = condition = condition + " AND request_date BETWEEN '" +searchRequestedDate[0]+"' and '" +searchRequestedDate[2]+"'" 
        }

		if (req.query.searchStatus != '' && req.query.searchStatus != undefined){
            condition = condition + " AND action_status = '" +req.query.searchStatus+"'"
        }

		if (req.query.searchCategory != '' && req.query.searchCategory != undefined){
            condition = condition + " AND stratbuyer_name = '" +req.query.searchCategory+"'"
        }

        var query = "SELECT row_id, bdm_global_umbrella_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name FROM public.vw_buyer_details where country_name='"+req.query.country+"' AND buyer_emailid='"+req.query.email+"' AND new_price IS NOT NULL AND request_date IS NOT NULL " + condition + " ORDER by action_status ASC";

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


	app.post('/update_buyer_input', async function(req, res){
		var data = {};

		var query = "call public.usp_update_requestdetails(record_id=>"+req.body.row_id+", in_negotiate_price=>"+req.body.final_price+", in_finalize_date=>'"+req.body.finalize_date+"', in_effective_date=>'"+req.body.effective_date+"', in_metro_comment =>'"+req.body.comment+"')";

		console.log(query)

		await con.query(query, async function(err, result) {
			if (err) {
				console.log(err)
				res.json({ status: false });
				return;
			} else{				
				var query = "SELECT row_id, bdm_global_umbrella_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name FROM public.vw_buyer_details where country_name='"+req.body.country+"' AND buyer_emailid='"+req.body.email+"' AND new_price IS NOT NULL AND request_date IS NOT NULL ORDER by action_status ASC";
				
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
            }			
		});
	});

	app.post('/closed_supplier_input', async function(req, res){
		var data = {};
		var query = "call public.usp_update_requestdetails (record_id=>"+req.body.id +", in_action_status => 'closed')";

		await con.query(query, async function(err, result) {
			if (err) {
				console.log(err)
				res.json({ status: false });
				return;
			} else{				
				var query = "SELECT row_id, bdm_global_umbrella_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name FROM public.vw_buyer_details where country_name='"+req.body.country+"' AND buyer_emailid='"+req.body.email+"' AND new_price IS NOT NULL AND request_date IS NOT NULL ORDER by action_status ASC";
				
				await con.query(query, function(err, result) {
					if (err) {
						console.log(err)
						res.json({ status: false });
						return;
					} else{
						data.supplierInputs = result.rows
						res.json({ status: true, data: data });
						return;
					}			
				});
            }			
		});
	});

	app.get('/buyer_article_details', async function(req, res){
		var query = "SELECT row_id, suppl_no, suppl_name, ean_no, art_no, art_name_tl, current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name FROM public.vw_buyer_details where country_name='"+req.query.country+"' AND buyer_emailid='"+req.query.email+"' AND new_price IS NOT NULL AND request_date IS NOT NULL ";
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

	app.get('/buyer_supplier_details', async function(req, res){
		var query = "SELECT bdm_global_umbrella_no, stratbuyer_name, bdm_global_umbrella_name, suppl_no FROM public.vw_request_details where suppl_no='"+req.query.suppl_no+"' AND request_date IS NOT NULL ";
		console.log(query);
		await con.query(query, async function(err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else{
				var query1 = "select * from vw_buyer_dashboard";
				await con.query(query1, function(err1, result1) {
					if (err1) {
						res.json({ status: true, data: result.rows, response: "" });
						return;
					} else{
						res.json({ status: true, data: result.rows, response: result1.rows });
						return;
					}			
				});
			}			
		});
	});

	app.get('/buyer_supplier_details_list', async function(req, res){
		var query = "SELECT row_id, suppl_no, suppl_name, ean_no, art_no, art_name_tl, price_difference_perc, agreed_price_increase_perc, action_status, bdm_global_umbrella_no, bdm_global_umbrella_name FROM public.vw_request_details where country_name='"+req.query.countryname+"' AND suppl_no='"+req.query.suppl_no+"'  ORDER by action_status ASC";
		await con.query(query, async function(err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else{
				res.json({ status: true, data: result.rows });
				return;
			}			
		});
	});

	app.get('/download_supplier_assoerment_pdf', function (req, res) {
		var supplier_number = req.query.supplier_number;
		var query = "select suppl_no, art_no, art_name, frmt_new_price as new_price, frmt_negotiate_final_price as final_price, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date from vw_request_details where action_status='closed' and country_name='" + req.query.country + "' AND SUPPL_NO = '" + req.query.supplier_number + "'";

		con.query(query, async function (err, result) {
			if (err) {
				console.log(err);
				res.contentType("application/pdf");
				res.send();
				return;
			} else {
				if(result.rowCount > 0){
					var assortment_details = result.rows
					var file_path = path.join(__dirname+'/pdf/supplier_assortments_'+supplier_number+'.pdf');
					await createSupplierAssortments(assortment_details, file_path, res, req.query.country, req.query.buyer_name)
				}else{
					res.contentType("application/pdf");
    				res.send();
					return;
				}
				;				
			}
		});
	});

}
