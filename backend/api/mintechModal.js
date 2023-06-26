const http = require('http');
var nodemailer = require('nodemailer');
var async = require("async");
//=========== MonthEnd API Module ===================
module.exports = function(app, con) {
    app.get('/mintech', async function(req, res){
		var data = {};
        // var query = "SELECT * FROM public.tbl_users where action_status='Open'" + condition;

		var condition  = '';
		var CategoryOptions = [];
		var CountryOptions = [];

        if (req.query.searchName != ''){
            condition = condition + " AND dashboard_name ILIKE '%" +req.query.searchName+"%'"
        }

        if (req.query.searchCategory != ''){
            condition = condition +" AND stratbuyer_category = '" +req.query.searchCategory+"'"
        }

        // if (req.query.searchCountry != ''){
        //     condition = condition + " AND country_name = '" +req.query.searchCountry+"'"
        // }

		var getUniqueCatQuery = "select distinct stratbuyer_name,stratbuyer_id from public.tbl_stratbuyer_details";

		await con.query(getUniqueCatQuery, function (err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else {
				result.rows.forEach(function (row, key) {
					option = { value: row.stratbuyer_name.trim(), label: row.stratbuyer_name.trim() }
					CategoryOptions.push(option);
				});
				data.CategoryOptions = CategoryOptions;
			}
		});

		// var getUniquecountryQuery = "select distinct country_name, row_id from tbl_country_details";
		// await con.query(getUniquecountryQuery, function (err, result) {
		// 	if (err) {
		// 		res.json({ status: false });
		// 		return;
		// 	} else {
		// 		result.rows.forEach(function(value, key) {
		// 			option = { value: value.country_name, label: value.country_name }
		// 			CountryOptions.push(option);
		// 		});
		// 		data.CountryOptions = CountryOptions;
		// 	}
		// });

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
		var condition  = '';
		var sql  = '';
		console.log(req.body);
		// usp_addNewUser('id','user_name','email','emp_id','user_role')
		if(req.body.user_id == 'undefined' || req.body.user_id == 0){
			sql=`CALL public.usp_mitech_dashboard('0','` + req.body.stratbuyer_category +`','`+ req.body.mintec_sub_category +`','`+ req.body.dashboard_name +`','`+ req.body.dashboard_url +`','` + req.body.is_deleted + `','` + req.body.created_by + `');`;
		}else{
			sql=`CALL public.usp_mitech_dashboard('` + req.body.user_id + `','` + req.body.stratbuyer_category +`','`+ req.body.mintec_sub_category +`','`+ req.body.dashboard_name +`','`+ req.body.dashboard_url +`','` + req.body.is_deleted + `','` + req.body.created_by + `');`;		
		}
		// usp_addMintech('0','region','country_name','category','sub_category','dashboard_name','dashboard_url','created_by')
		console.log(sql);
		con.query(sql, function(err, result) {
			if (err) {
				console.log(err);
				res.json({ status: false, message:'Error in Procedure' });
				return;
			}else{
				if (req.body.searchName != ''){
					condition = condition + " AND dashboard_name ILIKE '%" +req.body.searchName+"%'"
				}
				if (req.body.searchCategory != ''){
					condition = condition +" AND stratbuyer_category = '" +req.body.searchCategory+"'"
				}
				var query = "SELECT * FROM public.tbl_mintec_dashboard where dashboard_name IS NOT NULL" + condition;
				con.query(query, function(err, result) {
					if (err) {
						res.json({ status: false, message:'Error in All Data' });
						return;
					} else{
						data.users = result.rows
						res.json({ status: true, data: data });
						return;
					}			
				});
			}	
		});

        // console.log(query)
        // console.log(req.query);

        
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
		var query = "SELECT * FROM public.tbl_mintec_dashboard where id = '"+req.query.id +"'";
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
		console.log(res.body);
		var condition  = '';
		var data = {};
		console.log(query);
		await con.query(query, async function(err, result) {
			if (err) {
				res.json({ status: false, message:'Error in delete' });
				return;
			} else{			
				if (req.body.searchName != ''){
					condition = condition + " AND dashboard_name ILIKE '%" +req.body.searchName+"%'"
				}
				if (req.body.searchCategory != ''){
					condition = condition +" AND stratbuyer_category = '" +req.body.searchCategory+"'"
				}
				var query = "SELECT * FROM public.tbl_mintec_dashboard where dashboard_name IS NOT NULL" + condition;
				con.query(query, function(err, result) {
					if (err) {
						res.json({ status: false, message:'Error in All Data' });
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

	app.post('/upload_mintech_input', async function (req, res) {
		var data = {};
		var mintech_inputs = req.body.mintech_inputs
		// var created_by = req.body.created_by
		var len = mintech_inputs.length;
		var sucess_count = 0;
		var error_count = 0;
		// var count = 0;
		var condition  = '';
		console.log(mintech_inputs[0].dashboard_name);
		var value = mintech_inputs[0];
		async.waterfall([
			function (callback) {
				try{
					mintech_inputs.forEach(function (value, key) {
						if (value.dashboard_name && value.dashboard_name != 'null' && value.dashboard_name != undefined && value.dashboard_name != null) {
								var sql=`CALL public.usp_mitech_dashboard('0','` + value.stratbuyer_category +`','`+ value.mintec_sub_category +`','`+ value.dashboard_name +`','`+ value.dashboard_url +`','1','` + req.body.created_by + `');`;
								//var sql = `CALL public.usp_mitech_dashboard('0','` + value.stratbuyer_category +`','`+ value.mintec_sub_category +`','`+ value.dashboard_name +`','`+ value.dashboard_url +`','0','` + req.body.created_by + `');`;
								console.log(sql);
								con.query(sql, function(err, result) {
									if (err) {
										error_count++;
										console.log(err.message);
										// res.json({ status: false, message:err.message });
										// return;
										if(error_count+sucess_count == len){
											callback(null, sucess_count, error_count)
										}
									} else {
										// count++;
										sucess_count++;
										// res.json({ status: true, message:'success' });
										// return;
										if(error_count+sucess_count == len){
											callback(null, sucess_count, error_count)
										}
									}
								});
						}
					});
				}catch(error){
					console.log(error);
				}
				
			},
			function (sucess_count, error_count, callback) {
				if (req.body.searchName != ''){
					condition = condition + " AND dashboard_name ILIKE '%" +req.body.searchName+"%'"
				}
				if (req.body.searchCategory != ''){
					condition = condition +" AND stratbuyer_category ILIKE '%" +req.body.searchCategory+"%'"
				}
				var query = "SELECT * FROM public.tbl_mintec_dashboard where dashboard_name IS NOT NULL"+ condition;
				con.query(query, function(err, result) {
					if (err) {
						res.json({ status: false, message:'Error in All Data' });
						return;
					} else{
						data.users = result.rows
						res.json({ status: true, data: data, sucess_count, error_count });
						return;
					}			
				});
			}
		]);
	});
}
