const http = require('http');
var nodemailer = require('nodemailer');
//=========== MonthEnd API Module ===================
module.exports = function(app, con) {
    app.get('/buyers', async function(req, res){
		var data = {};
        // var query = "SELECT * FROM public.tbl_users where action_status='Open'" + condition;
		var condition  = '';
        var articalIDOptions = [];
        if (req.query.searchName != ''){
            condition = condition + " AND first_name LIKE '%" +req.query.searchName+"%'"
        }
		

        if (req.query.Status != ''){
            condition = condition +" AND active_status = '" +req.query.Status+"'"
        }

        var getUniqueSupplierIdQuery = "select distinct stratbuyer_id, stratbuyer_name from tbl_stratbuyer_details";

		await con.query(getUniqueSupplierIdQuery, function(err, result1) {
			if (err) {
				res.json({ status: false });
				return;
			} else{				
				result1.rows.forEach(function(value, key) {
					option = { value: value.stratbuyer_name, label: value.stratbuyer_name }
					articalIDOptions.push(option);
				});
				//articalIDOptions = articalIDOptions;
            }
		});	

        var query = "SELECT first_name, last_name, buyer_emailid, dept_name, country_name,string_agg(stratbuyer_name,', ') stratbuyer_name FROM public.tbl_buyer_details where buyer_emailid IS NOT NULL" + condition + " group by first_name, last_name, buyer_emailid, dept_name, country_name";
		// var query="Select distinct first_name, last_name, buyer_emailid, dept_name, country_name"
        await con.query(query, function(err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else{
                res.json({ status: true, data: result.rows , options: articalIDOptions });
				return;
            }			
		});
    });

    app.post('/buyers_add_input', async function(req, res){
        console.log(req.body)
		if (req.body.stratbuyer_name) {
			var sql = 'UPDATE tbl_buyer_details SET active_status = ? WHERE buyer_emailid = ?';
			await con.query(sql, ['inactive', req.body.buyer_emailid], function (err, result) {
				if (err) {
					console.log("Update failure. Please try again.");
					res.json({ status: false });
					return;
				};
				if ( result.affectedRows == 0){
					console.log("Invalid Data. No record has been updated.");
					res.json({status:false});
					return;
				}
			});

			req.body.stratbuyer_name.forEach( async function(row, key) {
				option = { value: row.value, label: row.label }
				articalIDOptions.push(option);

			var getUniqueSupplierIdQuery = "select * from tbl_buyer_details WHERE buyer_emailid = ? AND stratbuyer_name=  ?";
			await con.query(getUniqueSupplierIdQuery,[req.body.buyer_emailid, row.label ], async function(err, result1) {
				if ( result1.affectedRows == 0){
					var sql1 = 'INSERT INTO tbl_buyer_details (first_name,last_name,dept_name,buyer_emailid,country_name,startbuyer_id,startbuyer_name,active_status) VALUES (?, ?, ?, ?, ?, ?, ?)'
					await con.query(sql1, [req.body.first_name, req.body.last_name, req.body.dept_name, req.body.country_name,row.value,row.label,'active'], function (err, result) {
						if (err) {
							console.log("Update failure. Please try again.");
							res.json({ status: false });
							return;
						};
					})
				}else{
					var sql1 = 'UPDATE tbl_buyer_details SET active_status = ? WHERE buyer_emailid = ? AND startbuyer_name = ?';
					await con.query(sql1, ['active', req.body.buyer_emailid , row.label], function (err, result) {
						if (err) {
							console.log("Update failure. Please try again.");
							res.json({ status: false });
							return;
						};
					})

				}
			});	
			})
		}
		var condition  = '';
        var articalIDOptions = [];
		var getUniqueSupplierIdQuery = "select distinct stratbuyer_id, stratbuyer_name from tbl_stratbuyer_details";
		await con.query(getUniqueSupplierIdQuery, function(err, result1) {
			if (err) {
				res.json({ status: false });
				return;
			} else{				
				result1.rows.forEach(function(value, key) {
					option = { value: value.stratbuyer_name, label: value.stratbuyer_name }
					articalIDOptions.push(option);
				});
            }
		});	

        var query = "SELECT first_name, last_name, buyer_emailid, dept_name, country_name,string_agg(stratbuyer_name,', ') stratbuyer_name FROM public.tbl_buyer_details where buyer_emailid IS NOT NULL" + condition + " group by first_name, last_name, buyer_emailid, dept_name, country_name";
        await con.query(query, function(err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else{
                res.json({ status: true, data: result.rows , options: articalIDOptions });
				return;
            }			
		});
	
    })
}
