const http = require('http');
var nodemailer = require('nodemailer');
var async = require("async");
//=========== MonthEnd API Module ===================
module.exports = function (app, con) {
	app.get('/buyers', async function (req, res) {
		var data = {};
        // var query = "SELECT * FROM public.tbl_users where action_status='Open'" + condition;
		var condition  = '';
        var articalIDOptions = [];
        var CountryOptions = [];
        var deptOptions = [];

		if (req.query.searchName != '') {
			condition = condition + " AND RTRIM(CONCAT(LTRIM(RTRIM(first_name)) , ' ' , LTRIM(RTRIM(last_name)))) ILIKE '%" +req.query.searchName +"%'"
		}
		if (req.query.searchName != '') {
			condition = condition + " OR RTRIM(LTRIM(RTRIM(buyer_emailid))) ILIKE '%" +req.query.searchName +"%'"
		}

		var getUniqueSupplierIdQuery = "select distinct stratbuyer_id, stratbuyer_name from tbl_stratbuyer_details";
		await con.query(getUniqueSupplierIdQuery, function (err, result1) {
			if (err) {
				res.json({ status: false });
				return;

			} else {				
				result1.rows.forEach(function(value, key) {
					option = { value: value.stratbuyer_id, label: value.stratbuyer_name }
					articalIDOptions.push(option);
				});

				var getUniquecountryQuery = "select distinct country_name, row_id from tbl_country_details";
				con.query(getUniquecountryQuery, function (err2, result2) {
					if (err2) {
						res.json({ status: false });
						return;
					} else {
						result2.rows.forEach(function(value, key) {
							option = { value: value.country_name, label: value.country_name }
							CountryOptions.push(option);
						});

						var getUniquedeptQuery = "select distinct dept_name from tbl_buyer_details";
						
						con.query(getUniquedeptQuery, function(err3, result3) {
							if (err3) {
								res.json({ status: false });
								return;
							} else {
								result3.rows.forEach(function(value, key) {
									option = { value: value.dept_name, label: value.dept_name }
									deptOptions.push(option);
								});
								var query = "SELECT array_agg(row_id) as row_id, first_name, last_name, buyer_emailid, dept_name, country_name,string_agg(stratbuyer_name,', ') stratbuyer_name FROM tbl_buyer_details where buyer_emailid IS NOT NULL AND active_status='active'" + condition + " group by first_name, last_name, buyer_emailid, dept_name, country_name";
								con.query(query, function (err, result) {
									if (err) {
										console.log(err)
										res.json({ status: false });
										return;
									} else {
										res.json({ status: true, data: result.rows , options: articalIDOptions , countryoptions : CountryOptions , deptOptions : deptOptions });
										return;
									}
								});
							}
						});
					}
				});
			}
		});
	});

	app.post('/buyers_add_input', async function (req, res) {
		if (req.body.stratbuyer_name) {
			const stratbuyer_name = Array.prototype.map.call(req.body.stratbuyer_name, function (item) { return item.label; }).join(",")
			var query = "call public.usp_update_buyerdetails ('" + req.body.first_name + "', '" + req.body.last_name + "', '" + req.body.dept_name + "', '" + req.body.buyer_emailid + "', '" + req.body.country_name + "', '" + stratbuyer_name + "')";
			await con.query(query, async function (err, result) {
				if (err) {
					console.log(err)
					res.json({ status: false });
					return;
				} else {
					var condition = '';
					if (req.body.searchName != '') {
						condition = condition + " AND RTRIM(CONCAT(LTRIM(RTRIM(first_name)) , ' ' , LTRIM(RTRIM(last_name)))) ILIKE '%" +req.body.searchName +"%'"
					}
					var queryalldata = "SELECT array_agg(row_id) as row_id, first_name, last_name, buyer_emailid, dept_name, country_name,string_agg(stratbuyer_name,', ') stratbuyer_name FROM tbl_buyer_details where buyer_emailid IS NOT NULL AND active_status='active' " + condition + " group by first_name, last_name, buyer_emailid, dept_name, country_name";
					await con.query(queryalldata, function (errall, resultall) {
						if (errall) {
							res.json({ status: false, message: "fetch all data" });
							return;
						} else {
							res.json({ status: true, data: resultall.rows });
							return;
						}
					});
				}
			});
		} else {
			res.json({ status: false, message: "Category is required." });
			return;
		}
	});

	app.post('/delete_buyer_input', async function (req, res) {
		var len = req.body.row_id.length;
		var count = 0;
		var condition = '';
		if (req.body.searchName != '') {
			condition = condition + " AND RTRIM(CONCAT(LTRIM(RTRIM(first_name)) , ' ' , LTRIM(RTRIM(last_name)))) ILIKE '%" +req.body.searchName +"%'"
		}
		if (req.body.row_id) {
			req.body.row_id.forEach(async function (value, key) {
				var query = "UPDATE tbl_buyer_details SET active_status = 'inactive' WHERE row_id =" + value;
				await con.query(query, async function (err, result) {
					if (err) {
						count++;
					} else {
						count++;
						if (len == count) {
							var queryalldata = "SELECT array_agg(row_id) as row_id, first_name, last_name, buyer_emailid, dept_name, country_name,string_agg(stratbuyer_name,', ') stratbuyer_name FROM tbl_buyer_details where buyer_emailid IS NOT NULL AND active_status='active' " + condition + " group by first_name, last_name, buyer_emailid, dept_name, country_name";
							await con.query(queryalldata, function (errall, resultall) {
								if (errall) {
									res.json({ status: false, message: "Select all insert" });
									return;
								} else {
									res.json({ status: true, data: resultall.rows });
									return;
								}
							});
						}
					}
				});
			});
		}
	});
}