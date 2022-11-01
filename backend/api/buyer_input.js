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

        if (req.query.searchSupplierNumber != ''){
            condition = condition + " AND suppl_no = '" +req.query.searchSupplierNumber+"'"
        }

        if (req.query.searchArticleNumber != '' && req.query.searchArticleNumber != undefined){
            condition = condition +" AND art_no = '" +req.query.searchArticleNumber+"'"
        }

        var query = "SELECT row_id, suppl_no, suppl_name, art_no, art_name_tl, current_price, new_price, price_difference_perc, to_char(request_date, 'YYYY-MM-dd') as request_date, price_change_reason, action_status, to_char(negotiate_final_price, 'YYYY-MM-dd') as negotiate_final_price, to_char(price_increase_effective_date, 'YYYY-MM-dd') as price_increase_effective_date FROM public.vw_request_details where country_name='"+req.query.country+"' AND new_price IS NOT NULL AND request_date IS NOT NULL " + condition;

		console.log("buyer query ===================")
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

}
