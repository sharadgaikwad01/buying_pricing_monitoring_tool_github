const http = require('http');
var nodemailer = require('nodemailer');
//=========== MonthEnd API Module ===================
module.exports = function(app, con) {
    app.get('/buyer_input', async function(req, res){
		var data = {};
		var supplierIDOptions = [];
		var articleOptions = [];

		var getUniqueSupplierIdQuery = "select distinct t1.suppl_no from vw_suppl_info t1 where country_name='"+req.query.country+"'";

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

        var condition  = '';

		console.log(req.query)

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

        var query = "SELECT row_id, suppl_no, suppl_name, art_no, art_name_tl, current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name FROM public.vw_buyer_details where country_name='"+req.query.country+"' AND buyer_emailid='"+req.query.email+"' AND new_price IS NOT NULL AND request_date IS NOT NULL " + condition;

		console.log("query===========")
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
		console.log(req.body)
		var data = {};

		var query = "call public.usp_update_requestdetails(record_id=>"+req.body.row_id+", in_negotiate_price=>"+req.body.final_price+", in_finalize_date=>'"+req.body.finalize_date+"', in_effective_date=>'"+req.body.effective_date+"', in_metro_comment =>'"+req.body.comment+"')";

		console.log(query)

		await con.query(query, async function(err, result) {
			if (err) {
				console.log(err)
				res.json({ status: false });
				return;
			} else{				
				var query = "SELECT row_id, suppl_no, suppl_name, art_no, art_name_tl, current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name FROM public.vw_buyer_details where country_name='"+req.query.country+"' AND buyer_emailid='"+req.query.email+"' AND new_price IS NOT NULL AND request_date IS NOT NULL ";
				
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
				var query = "SELECT row_id, suppl_no, suppl_name, art_no, art_name_tl, current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name FROM public.vw_buyer_details where country_name='"+req.query.country+"' AND buyer_emailid='"+req.query.email+"' AND new_price IS NOT NULL AND request_date IS NOT NULL ";
				
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

	app.post('/buyer_article_details', async function(req, res){
		var query = "SELECT row_id, suppl_no, suppl_name, art_no, art_name_tl, current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name FROM public.vw_buyer_details where country_name='"+req.query.country+"' AND buyer_emailid='"+req.query.email+"' AND new_price IS NOT NULL AND request_date IS NOT NULL ";
		
		await con.query(query, function(err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else{
				res.json({ status: true, data: result });
				return;
			}			
		});
	});


}
