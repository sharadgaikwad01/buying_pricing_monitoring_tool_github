const http = require('http');
var nodemailer = require('nodemailer');
//=========== MonthEnd API Module ===================
module.exports = function(app, con) {
    app.get('/mintech', async function(req, res){
		var data = {};
        // var query = "SELECT * FROM public.tbl_users where action_status='Open'" + condition;

		var condition  = '';
		var CategoryOptions = [];
		var CountryOptions = [];

        if (req.query.searchName != ''){
            condition = condition + " AND dashboard_name LIKE '%" +req.query.searchName+"%'"
        }

        if (req.query.searchCategory != ''){
            condition = condition +" AND category = '" +req.query.searchCategory+"'"
        }

        if (req.query.searchCountry != ''){
            condition = condition + " AND country_name = '" +req.query.searchCountry+"'"
        }

		var getUniqueCatQuery = "select distinct stratbuyer_name,buyer_emailid,country_name from public.tbl_buyer_details";

		await con.query(getUniqueCatQuery, function (err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else {
				result.rows.forEach(function (value, key) {
					option = { value: value.stratbuyer_name, label: value.stratbuyer_name }
					CategoryOptions.push(option);
				});
				data.CategoryOptions = CategoryOptions;
			}
		});

		var getUniquecountryQuery = "select distinct country_name, row_id from tbl_country_details";
		await con.query(getUniquecountryQuery, function (err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else {
				result.rows.forEach(function(value, key) {
					option = { value: value.country_name, label: value.country_name }
					CountryOptions.push(option);
				});
				data.CountryOptions = CountryOptions;
			}
		});

        var query = "SELECT * FROM public.tbl_mintec_dashboard where dashboard_name IS NOT NULL" + condition;
        // console.log(query)
        // console.log(req.query);

        await con.query(query, function(err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else{
				data.users = result.rows
                res.json({ status: true, data: data });
				return;
            }			
		});
    });
	
	app.post('/add_mintech_input', function(req, res){
		// var role = 'SUPERADMIN';
		var data = {};
		// usp_addNewUser('id','user_name','email','emp_id','user_role')
		if(req.body.user_id == 'undefined' || req.body.user_id == 0){
			sql=`CALL public.usp_addNewUser('0','` + req.body.user_name +`','`+ req.body.email +`','`+ req.body.emp_id +`','`+ req.body.emp_id +`','` + req.body.user_type + `','','','','` + req.body.user_role + `');`;
		}else{
			sql=`CALL public.usp_addNewUser('` + req.body.user_id + `','` + req.body.user_name +`','`+ req.body.email +`','`+ req.body.emp_id +`','`+ req.body.emp_id +`','` + req.body.user_type + `','','','','` + req.body.user_role + `');`;		
		}
		console.log(sql);
		con.query(sql, function(err, result) {
			if (err) {
				console.log(err);
				res.json({ status: false });
				return;
			};	
		});
		if (req.body.searchName != ''){
            condition = condition + " AND dashboard_name LIKE '%" +req.body.searchName+"%'"
        }

        if (req.body.searchCategory != ''){
            condition = condition +" AND category = '" +req.body.searchCategory+"'"
        }

        if (req.body.searchCountry != ''){
            condition = condition + " AND country_name = '" +req.body.searchCountry+"'"
        }

		var query = "SELECT * FROM public.tbl_mintec_dashboard where dashboard_name IS NOT" + condition;
        con.query(query, function(err, result) {
			if (err) {
				res.json({ status: true });
				return;
			} else{
				data.users = result.rows
                res.json({ status: true, data: data });
				return;
            }			
		});
    });

	app.get('/edit_mintech_input', async function(req, res){
		var query = "SELECT * FROM public.tbl_mintec_dashboard where id = '"+req.query.id +"'";
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

	app.get('/mintech_input', async function(req, res){
		var query = "SELECT * FROM public.tbl_mintec_dashboard where email = '"+req.query.email +"'";
		console.log(query);
		await con.query(query, function(err, result) {
			console.log(result);
			console.log(err);
			if (err) {
				res.json({ status: false });
				return;
			} else{
				res.json({ status: true, data: result.rows });
				return;
            }			
		});
	});

	app.post('/delete_mintech_input', async function(req, res){
		var query = "DELETE FROM public.tbl_mintec_dashboard where id = '"+req.body.id +"'";
		console.log(query);
		await con.query(query, async function(err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else{			
				if (req.body.searchName != ''){
					condition = condition + " AND dashboard_name LIKE '%" +req.body.searchName+"%'"
				}
				if (req.body.searchCategory != ''){
					condition = condition +" AND category = '" +req.body.searchCategory+"'"
				}
				if (req.body.searchCountry != ''){
					condition = condition + " AND country_name = '" +req.body.searchCountry+"'"
				}
				var query = "SELECT * FROM public.tbl_mintec_dashboard where dashboard_name IS NOT" + condition;
				await con.query(query, function(err, result) {
					if (err) {
						res.json({ status: false });
						return;
					} else{	
						data.users = result.rows
						res.json({ status: true, data: data });
						return;
					}
				});
            }			
		});
	});
}
