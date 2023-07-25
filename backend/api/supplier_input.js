const http = require('http');
const Https = require('https');
var nodemailer = require('nodemailer');
var async = require("async");
const fs = require('fs');
const PDFDocument = require('pdfkit');
const { dirname } = require('path');
const appDir = dirname(require.main.filename);
var path = require('path');

//=========== MonthEnd API Module ===================
module.exports = function (app, con) {
	app.get('/supplier_input', async function (req, res) {
		var data = {};
		var supplierIDOptions = [];
		var articleOptions = [];

		console.log("supplier_input======================")
		// console.log(req.query)

		var getUniqueSupplierIdQuery = "select distinct t1.suppl_no from vw_suppl_info t1 where country_name='" + req.query.country + "' AND vat_no='" + req.query.vat_number + "'";

		await con.query(getUniqueSupplierIdQuery, function (err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else {
				result.rows.forEach(function (value, key) {
					option = { value: value.suppl_no, label: value.suppl_no }
					supplierIDOptions.push(option);
				});
				data.supplierIDOptions = supplierIDOptions;
				data.supplierInputCount = result.rowCount
			}
		});

		if (req.query.searchSupplierNumber != '') {
			var getUniqueArticleQuery = "select DISTINCT art_no, art_name from vw_artinfo_with_request  Where suppl_no='" + req.query.searchSupplierNumber + "' and country_name ='" + req.query.country + "' and vat_no ='" + req.query.vat_number + "'";
			await con.query(getUniqueArticleQuery, function (err, result) {
				if (err) {
					res.json({ status: false });
					return;
				} else {
					result.rows.forEach(function (value, key) {
						option = { value: value.art_no, label: value.art_no + " - " + value.art_name }
						articleOptions.push(option);
					});
					data.articleOptions = articleOptions;
				}
			});
		} else {
			data.articleOptions = articleOptions;
		}

		var condition = '';

		if (req.query.searchSupplierNumber != '') {
			condition = condition + " AND suppl_no = '" + req.query.searchSupplierNumber + "'"
		}

		if (req.query.searchArticleNumber != '' && req.query.searchArticleNumber != undefined) {
			condition = condition + " AND art_no = '" + req.query.searchArticleNumber + "'"
		}

		if (req.query.searchRequestedDate != '') {
			var searchRequestedDate = req.query.searchRequestedDate.split(' ')
			condition = condition + " AND request_date BETWEEN '" + searchRequestedDate[0] + "' and '" + searchRequestedDate[2] + "'"
		}

		if (req.query.searchStatus != '') {
			condition = condition + " AND action_status = '" + req.query.searchStatus + "'"
		}		

		var query = "SELECT ean_no, row_id, suppl_no, vat_no, art_no, art_name, new_price, frmt_new_price, to_char(request_date, 'dd-mm-YYYY') as request_date, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, action_status, price_change_reason, previous_request_days FROM public.vw_request_details where country_name='" + req.query.country + "' AND vat_no='" + req.query.vat_number + "' AND new_price IS NOT NULL AND request_date IS NOT NULL " + condition + " ORDER BY action_status DESC, row_id DESC";

		await con.query(query, function (err, result) {
			if (err) {
				console.log(err);
				res.json({ status: false });
				return;
			} else {
				// console.log(result.rows);
				data.supplierInputs = result.rows
				res.json({ status: true, data: data });
				return;
			}
		});
	});

	app.post('/add_supplier_input', function (req, res) {
		var data = {};
		sql = `CALL public."usp_addNewRequest"('` + req.body.article_number + `','` + req.body.supplier_number + `','` + req.body.country + `',` + req.body.new_price + `,'` + req.body.reason + `','` + req.body.price_effective_date + `','` + req.body.email + `');`;	

		// console.log(sql);
		con.query(sql, async function (err, result) {
			if (err) {
				res.json({ status: false });
				return;
			};
			//sendEmail(to, subject, html)
			var query = "SELECT ean_no, row_id, vat_no, suppl_no, art_no, art_name, new_price, frmt_new_price, to_char(request_date, 'dd-mm-YYYY') as request_date, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, action_status, price_change_reason FROM public.vw_request_details where country_name='" + req.body.country + "' AND vat_no='" + req.body.vat_number + "' AND new_price IS NOT NULL AND request_date IS NOT NULL ORDER BY action_status DESC, row_id DESC";

			await con.query(query, function (err, result) {
				if (err) {
					res.json({ status: false });
					return;
				} else {
					data.supplierInputs = result.rows
					res.json({ status: true, data: data });
					return;
				}
			});
		});
	});

	app.get('/supplier_article_details', async function (req, res) {
		
		if(req.query.vat_number){
			var query = "select country_name, vat_no, suppl_no, art_no, art_name, umbrella_name, '' as new_price, '' as price_change_reason, '' as price_increase_effective_date from vw_art_info where vat_no='" + req.query.vat_number + "' and country_name='" + req.query.country + "' AND SUPPL_NO IN (" + req.query.supplier_number + ")";
		} else {
			var query = "select country_name, vat_no, suppl_no, art_no, art_name, umbrella_name, '' as new_price, '' as price_change_reason, '' as price_increase_effective_date from vw_artinfo_without_request where country_name='" + req.query.country + "' AND SUPPL_NO IN (" + req.query.supplier_number + ")";
		}

		await con.query(query, function (err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else {
				res.json({ status: true, data: result.rows });
				return;
			}
		});
	});
	


	app.post('/delete_supplier_input', async function (req, res) {

		var data = {};
		var query = "call public.usp_update_requestdetails (record_id=>" + req.body.id + ", in_is_deleted=> true)";
		await con.query(query, function (err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else {
				var condition = '';

				if (req.body.searchSupplierNumber != '') {
					condition = condition + " AND suppl_no = '" + req.body.searchSupplierNumber + "'"
				}

				if (req.body.searchArticleNumber != '' && req.body.searchArticleNumber != undefined) {
					condition = condition + " AND art_no = '" + req.body.searchArticleNumber + "'"
				}

				if (req.body.searchRequestedDate != '') {
					var searchRequestedDate = req.body.searchRequestedDate.split(' ')
					condition = condition + " AND request_date BETWEEN '" + searchRequestedDate[0] + "' and '" + searchRequestedDate[2] + "'"
				}

				if (req.body.searchStatus != '') {
					condition = condition + " AND action_status = '" + req.body.searchStatus + "'"
				}

				var query = "SELECT ean_no, row_id, vat_no, suppl_no, art_no, art_name, new_price, frmt_new_price, to_char(request_date, 'dd-mm-YYYY') as request_date, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, action_status, price_change_reason FROM public.vw_request_details where country_name='" + req.body.country + "' AND vat_no='" + req.body.vat_number + "' AND new_price IS NOT NULL AND request_date IS NOT NULL " + condition + " ORDER BY action_status DESC, row_id DESC";

				con.query(query, function (err, result) {
					if (err) {
						res.json({ status: false });
						return;
					} else {
						data.supplierInputs = result.rows
						res.json({ status: true, data: data });
						return;
					}
				});

			}
		});
	});

	app.post('/update_supplier_input', async function (req, res) {		
		var data = {};
		var query = "call public.usp_update_requestdetails (record_id=>" + req.body.row_id + ", in_new_price=>" + req.body.new_price + ", in_reason=>'" + req.body.reason + "', in_effective_date=>'" + req.body.price_effective_date + "', in_updated_by=>'" + req.body.email + "')";

		// console.log(query);
		
		await con.query(query, function (err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else {
				var condition = '';

				if (req.body.searchSupplierNumber != '' && req.body.searchSupplierNumber != undefined) {
					condition = condition + " AND suppl_no = '" + req.body.searchSupplierNumber + "'"
				}

				if (req.body.searchArticleNumber != '' && req.body.searchArticleNumber != undefined) {
					condition = condition + " AND art_no = '" + req.body.searchArticleNumber + "'"
				}

				if (req.body.searchRequestedDate != '' && req.body.searchRequestedDate != undefined) {
					var searchRequestedDate = req.body.searchRequestedDate.split(' ')
					condition = condition + " AND request_date BETWEEN '" + searchRequestedDate[0] + "' and '" + searchRequestedDate[2] + "'"
				}

				if (req.body.searchStatus != '' && req.body.searchStatus != undefined ) {
					condition = condition + " AND action_status = '" + req.body.searchStatus + "'"
				}

				var query = "SELECT ean_no, row_id, suppl_no, art_no, art_name, new_price, frmt_new_price, to_char(request_date, 'dd-mm-YYYY') as request_date, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, action_status, price_change_reason FROM public.vw_request_details where country_name='" + req.body.country + "' AND vat_no='" + req.body.vat_number + "' AND new_price IS NOT NULL AND request_date IS NOT NULL " + condition + " ORDER BY action_status DESC, row_id DESC";

				con.query(query, function (err, result) {
					if (err) {
						console.log(err)
						res.json({ status: false });
						return;
					} else {
						data.supplierInputs = result.rows
						res.json({ status: true, data: data });
						return;
					}
				});
			}
		});
	});

	app.get('/getArticlesBySupplierNumber', async function (req, res) {
		var data = {};
		var articleOptions = [];
		console.log("getUniqueArticleQuery=============")	
		if(req.query.supplierNumber =='undefined' || req.query.country == 'undefined'){
			res.json({ status: false });
			return;
		}
		if (req.query.flag && req.query.vat_number) {
			var getUniqueArticleQuery = "select DISTINCT art_no, art_name from vw_artinfo_with_request  Where suppl_no='" + req.query.supplierNumber + "' and country_name ='" + req.query.country + "' and vat_no ='" + req.query.vat_number + "'"
		} else {
			var getUniqueArticleQuery = "SELECT DISTINCT art_no, art_name FROM public.vw_artinfo_without_request Where suppl_no='" + req.query.supplierNumber + "' and country_name ='" + req.query.country + "'"
		}
		
		
		// console.log(getUniqueArticleQuery)
		await con.query(getUniqueArticleQuery, function (err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else {
				result.rows.forEach(function (value, key) {
					option = { value: value.art_no, label: value.art_no + " - " + value.art_name }
					articleOptions.push(option);
				});
				data.articleOptions = articleOptions;
				res.json({ status: true, data: data });
				return;
			}
		});
	});

	// app.post('/upload_supplier_input', async function (req, res) {
	// 	var data = {};
	// 	var supplier_inputs = req.body.supplier_inputs
	// 	var len = supplier_inputs.length;
	// 	var sucess_count = 0;
	// 	var error_count = 0;
	// 	async.waterfall([
	// 		function (callback) {
	// 			supplier_inputs.forEach(async function (value, key) {
	// 				if (value.new_price && value.new_price != 'null' && value.new_price != undefined && value.new_price != null) {
	// 					if (value.new_price > 0) {
	// 						sql = `CALL public."usp_addNewRequest"('` + value.art_no + `','` + value.suppl_no + `','` + value.country_name + `',` + value.new_price + `,'` + value.price_change_reason + `','` + value.price_increase_effective_date + `');`;

	// 						con.query(sql, function (err, result) {
	// 							if (err) {
	// 								error_count++;
	// 							} else {
	// 								sucess_count++;
	// 							}
	// 						});
	// 					}
	// 				}
	// 			});
	// 			callback(null,sucess_count, error_count)
	// 		},
	// 		function (sucess_count, error_count, callback) {
	// 			var query = "SELECT ean_no, row_id, suppl_no, art_no, art_name, new_price, frmt_new_price, to_char(request_date, 'dd-mm-YYYY') as request_date, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, action_status, price_change_reason FROM public.vw_request_details where country_name='" + req.body.country + "' AND vat_no='" + req.body.vat_number + "' AND new_price IS NOT NULL AND request_date IS NOT NULL ORDER BY action_status DESC, row_id DESC";

	// 			con.query(query, function (err, result) {
	// 				if (err) {
	// 					res.json({ status: false });
	// 					return;
	// 				} else {
	// 					data.supplierInputs = result.rows
	// 					res.json({ status: true, data: data, sucess_count:sucess_count, error_count:error_count });
	// 					return;
	// 				}
	// 			});
	// 		}
	// 	]);
	// });
	app.post('/upload_supplier_input', async function (req, res) {
		var data = {};
		var supplier_inputs = req.body.supplier_inputs
		var len = supplier_inputs.length;
		var sucess_count = 0;
		var error_count = 0;
		var count = 0;
		// console.log(supplier_inputs);
		async.waterfall([
			function (callback) {
				supplier_inputs.forEach(async function (value, key) {
					// console.log(value)
					if (value.new_price && value.new_price != 'null' && value.new_price != undefined && value.new_price != null) {
						if (value.new_price > 0) {
							sql = `CALL public."usp_addNewRequest"('` + value.art_no + `','` + value.suppl_no + `','` + value.country_name + `',` + value.new_price + `,'` + value.price_change_reason + `','` + value.price_increase_effective_date + `','` + req.body.email + `');`;
							await con.query(sql, function (err, result) {
								if (err) {
									error_count++;
									if((sucess_count+error_count+count) == len){
										callback(null, sucess_count, error_count)
									}
								} else {
									sucess_count++;
									if((sucess_count+error_count+count) == len){
										callback(null, sucess_count, error_count)
									}
								}
							});
						} else {
							count++;
							if((sucess_count+error_count+count) == len){
								callback(null, sucess_count, error_count)
							}
						}
					}else {
						count++;
						if((sucess_count+error_count+count) == len){
							callback(null, sucess_count, error_count)
						}
					}
				});
			},
			function (sucess_count, error_count, callback) {
				var query = "SELECT ean_no, row_id, vat_no, suppl_no, art_no, art_name, new_price, frmt_new_price, to_char(request_date, 'dd-mm-YYYY') as request_date, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, action_status, price_change_reason FROM public.vw_request_details where country_name='" + req.body.country + "' AND vat_no='" + req.body.vat_number + "' AND new_price IS NOT NULL AND request_date IS NOT NULL ORDER BY action_status DESC, row_id DESC";
				con.query(query, function (err, result) {
					if (err) {
						res.json({ status: false });
						return;
					} else {
						data.supplierInputs = result.rows
						res.json({ status: true, data: data, sucess_count:sucess_count, error_count:error_count });
						return;
					}
				});
			}
		]);
	});

	app.get('/notifications', async function (req, res) {
		
		var query = "select row_id, statuscol, country_name, art_no, art_name, suppl_no, suppl_name, msg, new_price from tbl_notification where country_name='" + req.query.country+"'";
		// var query = "select row_id, statuscol, country_name, art_no, art_name, suppl_no, suppl_name, msg, new_price, created_at from tbl_notification";
		// console.log(req.query.country);
		// console.log(query);
		await con.query(query, function (err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else {
				res.json({ status: true, data: result.rows });
				return;
			}
		});
	});
	
	app.post('/notificationread', async function (req, res) {
		var query = "UPDATE tbl_notification SET statuscol = '1' WHERE row_id =" + req.body.params;
		await con.query(query, async function (err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else {
				var query = "select row_id, statuscol, country_name, art_no, art_name, suppl_no, suppl_name, msg, new_price, created_at from tbl_notification where statuscol=0";
		await con.query(query, function (err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else {
				res.json({ status: true, data: result.rows });
				return;
			}
		});
			}
		});
		// var query = "select row_id, country_name, art_no, art_name, suppl_no, suppl_name, msg, new_price from tbl_notification where country_name='" + req.query.country;
	});
}
