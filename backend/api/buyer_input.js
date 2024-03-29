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
module.exports = function (app, con) {
	app.get('/buyer_input', async function (req, res) {
		var data = {};
		var supplierIDOptions = [];
		var supplierListOption = [];
		var categoryOptions = [];
		var condition = '';
		var searchRequestedstartDate = '';
		var searchRequestedendDate = '';
		try {
			
		// var getUniqueSupplierIdQuery = "SELECT distinct suppl_no FROM public.func_buyer_details('" + req.query.country + "', '" + req.query.email + "')"
		var getUniqueSupplierIdQuery = "SELECT distinct suppl_no FROM public.vw_suppl_with_buyer where buyer_emailid = '" + req.query.email + "' AND country_name='" + req.query.country + "'";
		// var getUniqueSupplierIdQuery = "SELECT distinct suppl_no FROM public.vw_suppl_with_buyer where buyer_emailid = 'aurora.pena@makro.es' AND country_name='" + req.query.country + "'";
		// var getUniqueSupplierIdQuery = "SELECT distinct suppl_no FROM public.vw_suppl_with_buyer where buyer_emailid = '" + req.query.email + "'";
		await con.query(getUniqueSupplierIdQuery, function (err, result) {
			if (err) {
				console.log(err)
				return res.status(201).json({ status: false, message: "supplierIDOptions" });
				
			} else {
				result.rows.forEach(function (value, key) {
					option = { value: value.suppl_no, label: value.suppl_no }
					supplierIDOptions.push(option);
				});
				data.supplierIDOptions = supplierIDOptions;
			}
		});
		var getUniqueCatQuery = "select distinct trim(stratbuyer_name) as stratbuyer_name, buyer_emailid, country_name from public.tbl_buyer_details where country_name='" + req.query.country + "' AND buyer_emailid='" + req.query.email + "' AND active_status='active'";
		// console.log(getUniqueCatQuery)
		await con.query(getUniqueCatQuery, function (err, result) {
			if (err) {
				return res.status(201).json({ status: false, message: "categoryOptions" });
			} else {
				result.rows.forEach(function (value, key) {
					option = { value: value.stratbuyer_name, label: value.stratbuyer_name }
					categoryOptions.push(option);
				});
				data.categoryOptions = categoryOptions;
			}
		});

		var query = "SELECT suppl_no, suppl_name, buyer_emailid, stratbuy_domain_id, stratbuyer_name FROM public.vw_suppl_with_buyer where country_name='" + req.query.country + "' AND buyer_emailid='" + req.query.email + "'";
		await con.query(query, async function (err, result) {
			if (err) {
				console.log(err)
				return res.status(201).json({ status: false, message: "supplierListOption" });
				
			} else {
				result.rows.forEach(function (value, key) {
					option = { value: value.suppl_no, label: value.suppl_no +" - "+ value.suppl_name}
					supplierListOption.push(option);
				});
				data.supplierListOption = supplierListOption;
			}
		});
		
		if (req.query.searchSupplierNumber != '') {
			condition = condition + " AND suppl_no = '" + req.query.searchSupplierNumber + "'"
		}

		if (req.query.searchRequestedDate != '' && req.query.searchRequestedDate != undefined) {
			var searchRequestedDate = req.query.searchRequestedDate.split(' ');
			searchRequestedstartDate = searchRequestedDate[0];
			searchRequestedendDate = searchRequestedDate[1];
			condition = condition = condition + " AND request_date BETWEEN '" + searchRequestedDate[0] + "' and '" + searchRequestedDate[2] + "'"
		}

		if (req.query.searchStatus != '' && req.query.searchStatus != undefined) {
			if(req.query.searchStatus == 'yet_to_approve'){
				condition = condition + " AND negotiate_final_price IS NOT NULL AND price_increase_communicated_date IS NOT NULL AND action_status='open'"
			}else{
				condition = condition + " AND action_status = '" + req.query.searchStatus + "'"
			}
		}

		if (req.query.searchCategory != '' && req.query.searchCategory != undefined) {
			condition = condition + " AND trim(stratbuyer_name) = '" + req.query.searchCategory + "'"
		}
		var query3 = "SELECT row_id , bdm_global_umbrella_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, current_price, frmt_current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name, price_increase_perc, vat_no, is_revoke, created_by, previous_request_days FROM public.func_buyer_details('" + req.query.country + "', '" + req.query.email + "') where new_price IS NOT NULL AND request_date IS NOT NULL"+ condition+" ORDER BY action_status DESC, row_id DESC"
		// var query3 = "SELECT row_id , bdm_global_umbrella_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, frmt_current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name, price_increase_perc, vat_no, is_revoke, created_by, previous_request_days FROM public.func_buyer_details('" + req.query.country + "', '" + req.query.email + "', '"+ req.query.searchSupplierNumber +"' , '" + searchRequestedstartDate + "', '" + searchRequestedendDate + "','" + req.query.searchStatus + "','" + req.query.searchCategory + "')";
		console.log(query3)
		con.query(query3, function (err3, result3) {
			if (err3) {
				return res.status(200).json({ status: false, message: "ALL" });
				
			} else {
				const pageCount = Math.ceil(result3.rows.length / 7);
				let page = parseInt(req.query.currentPage);
				if (!page) { page = 1;}
				if (page > pageCount) {
					page = pageCount
				}
				data.page = page;
				data.pageCount = pageCount;
				// data.supplierInputs = result3.rows.slice(page * 7 - 7, page * 7);
				console.log('buyer_input');
				data.supplierInputs = result3.rows;
				// res.json({ status: true, data: data });
				// return;
				return res.status(200).json({  status: true, data: data });
			}
		});
		} catch(e) {
			console.log(e);
			return res.status(200).json({ status: false, message: "Server Error" });
			// [Error: Uh oh!]
		}
	});

	app.get('/buyer_input_log', async function (req, res) {
		var data = {};
		var supplierIDOptions = [];
		
		var categoryOptions = [];
		var condition = '';
		var searchRequestedstartDate = '';
		var searchRequestedendDate = '';
		try {
		var getUniqueSupplierIdQuery = "SELECT distinct suppl_no FROM tbl_request_details_log"
		await con.query(getUniqueSupplierIdQuery, function (err, result) {
			if (err) {
				console.log(err)
				res.json({ status: false });
				return;
			} else {
				result.rows.forEach(function (value, key) {
					option = { value: value.suppl_no, label: value.suppl_no }
					supplierIDOptions.push(option);
				});
				data.supplierIDOptions = supplierIDOptions;
			}
		});
		var getUniqueCatQuery = "select distinct trim(stratbuyer_name) as stratbuyer_name, buyer_emailid, country_name from public.tbl_buyer_details where country_name='" + req.query.country + "' AND buyer_emailid='" + req.query.email + "' AND active_status='active'";

		// console.log(getUniqueCatQuery)
		await con.query(getUniqueCatQuery, function (err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else {
				result.rows.forEach(function (value, key) {
					option = { value: value.stratbuyer_name, label: value.stratbuyer_name }
					categoryOptions.push(option);
				});
				data.categoryOptions = categoryOptions;
			}
		});
		
		if (req.query.searchSupplierNumber != '') {
			condition = condition + " AND suppl_no = '" + req.query.searchSupplierNumber + "'"
		}

		if (req.query.searchRequestedDate != '' && req.query.searchRequestedDate != undefined) {
			var searchRequestedDate = req.query.searchRequestedDate.split(' ');
			searchRequestedstartDate = searchRequestedDate[0];
			searchRequestedendDate = searchRequestedDate[1];
			condition = condition = condition + " AND request_date BETWEEN '" + searchRequestedDate[0] + "' and '" + searchRequestedDate[2] + "'"
		}

		if (req.query.searchStatus != '' && req.query.searchStatus != undefined) {
			if(req.query.searchStatus == 'yet_to_approve'){
				condition = condition + " AND negotiate_final_price IS NOT NULL AND price_increase_communicated_date IS NOT NULL AND action_status='open'"
			}else{
				condition = condition + " AND action_status = '" + req.query.searchStatus + "'"
			}
		}

		// if (req.query.searchCategory != '' && req.query.searchCategory != undefined) {
		// 	condition = condition + " AND stratbuyer_name = '" + req.query.searchCategory + "'"
		// }
		// var query3 = "SELECT row_id , bdm_global_umbrella_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, current_price, frmt_current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name, price_increase_perc, vat_no, is_revoke, created_by, previous_request_days FROM public.func_buyer_details('" + req.query.country + "', '" + req.query.email + "') where new_price IS NOT NULL AND request_date IS NOT NULL"+ condition+" ORDER BY action_status DESC, row_id DESC"
		var query3 = "SELECT * from tbl_request_details_log where new_price IS NOT NULL AND request_date IS NOT NULL" + condition;
		// console.log(query3)
		con.query(query3, function (err3, result3) {
			if (err3) {
				res.json({ status: false });
				return;
			} else {
				const pageCount = Math.ceil(result3.rows.length / 7);
				let page = parseInt(req.query.currentPage);
				if (!page) { page = 1;}
				if (page > pageCount) {
					page = pageCount
				}
				data.page = page;
				data.pageCount = pageCount;
				// data.supplierInputs = result3.rows.slice(page * 7 - 7, page * 7);
				console.log('buyer_input');
				data.supplierInputs = result3.rows;
				res.json({ status: true, data: data });
				return;
			}
		});
		} catch(e) {
			console.log(e);
			return res.status(200).json({ status: false, message: "Server Error" });
			// [Error: Uh oh!]
		}
	});
	
	app.get('/reports', async function (req, res) {
		var data = {};
		var condition = '';
		var searchRequestedstartDate = '';
		var searchRequestedendDate = '';
		var BPAcount = [];
		var supplierIDOptions = [];
		var countryIDOptions = [];
		var categoryOptions = [];
		if (req.query.searchSupplierNumber != '') {
			condition = condition + " AND suppl_no = '" + req.query.searchSupplierNumber + "'"
		}
		if (req.query.searchRequestedDate != '' && req.query.searchRequestedDate != undefined) {
			var searchRequestedDate = req.query.searchRequestedDate.split(' ');
			searchRequestedstartDate = searchRequestedDate[0];
			searchRequestedendDate = searchRequestedDate[1];
			// console.log(searchRequestedDate)
			condition = condition = condition + " AND price_date_from BETWEEN '" + searchRequestedDate[0] + "' and '" + searchRequestedDate[2] + "'"
		}

		// if (req.query.searchCategory != '' && req.query.searchCategory != undefined) {
		// 	condition = condition + " AND catman_buy_domain_desc = '" + req.query.searchCategory + "'"
		// }

		if (req.query.searchCountry != '' && req.query.searchCountry != undefined) {
			condition = condition + " AND country_name = '" + req.query.searchCountry + "'"
		}
		if (req.query.user_type != '' && req.query.user_type != undefined && req.query.user_type == 'ADMIN') {
			condition = condition + " AND country_name = '" + req.query.country + "'"
		}
		
		if (req.query.searchName != '' && req.query.searchName != undefined) {
			condition = condition + " AND RTRIM(LTRIM(RTRIM(suppl_name))) ILIKE '%" +req.query.searchName +"%'"
			// condition = condition + " AND suppl_name = '" + req.query.searchName + "'"
		}

		// var getUniqueSupplierIdQuery = "SELECT distinct suppl_no FROM public.func_buyer_details('" + req.query.country + "', '" + req.query.email + "')"
		var getUniqueSupplierIdQuery = "SELECT distinct suppl_no FROM public.vw_mdw_vs_bpa_tool"
		var getUniquecountryQuery = "SELECT distinct country_name FROM public.vw_mdw_vs_bpa_tool"

		// var getUniqueSupplierIdQuery = "SELECT distinct suppl_no FROM public.vw_suppl_with_buyer where buyer_emailid = '" + req.query.email + "'";
		await con.query(getUniqueSupplierIdQuery, function (err, result) {
			if (err) {
				res.json({ status: false ,message : 0 });
				return;
			} else {
				result.rows.forEach(function (value, key) {
					option = { value: value.suppl_no, label: value.suppl_no }
					supplierIDOptions.push(option);
				});
				data.supplierIDOptions = supplierIDOptions;
			}
		});
		
		await con.query(getUniquecountryQuery, function (err, result) {
			if (err) {
				res.json({ status: false ,message : 0 });
				return;
			} else {
				result.rows.forEach(function (value, key) {
					option = { value: value.country_name, label: value.country_name }
					countryIDOptions.push(option);
				});
				data.countryIDOptions = countryIDOptions;
			}
		});
	
		var query4 = "SELECT count(bpa_tool) FROM public.vw_mdw_vs_bpa_tool where bpa_tool='Yes' AND unit_nnbp IS NOT NULL"+ condition;
		await con.query(query4, async function (err, result) {
			if (err) {
				res.json({ status: false ,message : 2 });
				return;
			} else {
				data.BPAcount = result.rows[0].count;
			}
		});

		var query = "SELECT country_name, suppl_no, suppl_name, stratbuy_domain_id, art_no, art_name, catman_buy_domain_desc, unit_nnbp, price_date_from, bpa_tool FROM public.vw_mdw_vs_bpa_tool where unit_nnbp IS NOT NULL"+ condition;
		con.query(query, function (err, result) {
			if (err) {
				// console.log(err);
				res.json({ status: false ,message : 3});
				return;
			} else {
				console.log('reports');
				data.supplierInputs = result.rows;
				res.json({ status: true, data: data });
				return;
			}
		});
	});

	app.get('/reportss', async function (req, res) {
		var data = {};
		if (req.query.user_type != '' && req.query.user_type != undefined && req.query.user_type == 'ADMIN') {
			var query = "SELECT country_name, overall_bpa_count, bpa_count_yes, bpa_count_no, mdw_count FROM public.vw_mdw_vs_bpa_tool_country_summary WHERE country_name = '" + req.query.country + "'";
		}else{
			var query = "SELECT country_name, overall_bpa_count, bpa_count_yes, bpa_count_no, mdw_count FROM public.vw_mdw_vs_bpa_tool_country_summary;";

		}
		con.query(query, function (err, result) {
			if (err) {
				// console.log(err);
				res.json({ status: false ,message : 3});
				return;
			} else {
				console.log('reports');
				data.supplierInputs = result.rows;
				res.json({ status: true, data: data });
				return;
			}
		});
	});

	app.post('/update_buyer_input', async function (req, res) {
		var data = {};
		try {
		var query = "call public.usp_update_requestdetails(record_id=>" + req.body.row_id + ", in_new_price=>" + req.body.newPrice + ", in_negotiate_price=>" + req.body.final_price + ", in_finalize_date=>'" + req.body.finalize_date + "', in_effective_date=>'" + req.body.effective_date + "', in_metro_comment =>'" + req.body.comment + "', in_updated_by =>'" + req.body.email + "')";
		await con.query(query, async function (err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else {
				// var query = "SELECT row_id, bdm_global_umbrella_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, frmt_current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name, price_increase_perc, vat_no, is_revoke, created_by, previous_request_days FROM public.func_buyer_details('" + req.body.country + "', '" + req.body.email + "') where new_price IS NOT NULL AND request_date IS NOT NULL ORDER BY action_status DESC, row_id DESC";
				// var query = "SELECT row_id, bdm_global_umbrella_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, current_price, frmt_current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name, price_increase_perc, vat_no, is_revoke, created_by, previous_request_days FROM public.func_buyer_details('" + req.body.country + "', '" + req.body.email + "') where new_price IS NOT NULL AND request_date IS NOT NULL ORDER BY action_status DESC, row_id DESC";
				// var query = "SELECT row_id , bdm_global_umbrella_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, frmt_current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name, price_increase_perc, vat_no, is_revoke, created_by, previous_request_days FROM public.func_buyer_details('" + req.body.country + "', '" + req.body.email + "', '' , '', '','','')";
				var query = "SELECT row_id , bdm_global_umbrella_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, current_price, frmt_current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name, price_increase_perc, vat_no, is_revoke, created_by, previous_request_days FROM public.func_buyer_details('" + req.body.country + "', '" + req.body.email + "') where new_price IS NOT NULL AND request_date IS NOT NULL ORDER BY action_status DESC, row_id DESC"

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
			}
		});
		} catch(e) {
			console.log(e);
			return res.status(200).json({ status: false, message: "Server Error" });
			// [Error: Uh oh!]
		}
	});

	app.post('/closed_and_revoke_input', async function (req, res) {
		var data = {};
		try {
		if (req.body.flag == 1) {
			var query = "call public.usp_update_requestdetails (record_id=>" + req.body.id + ", in_action_status => 'closed', in_updated_by =>'" + req.body.email + "')";
		} else {
			var query = "call public.usp_update_requestdetails (record_id=>" + req.body.id + ", in_action_status => 'open', in_updated_by =>'" + req.body.email + "')";
		}
		await con.query(query, async function (err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else {
				var query = "SELECT row_id, bdm_global_umbrella_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, current_price, frmt_current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name, price_increase_perc, vat_no, is_revoke, created_by, previous_request_days FROM public.func_buyer_details('" + req.body.country + "', '" + req.body.email + "') where new_price IS NOT NULL AND request_date IS NOT NULL ORDER BY action_status DESC, row_id DESC";
				// var query = "SELECT row_id , bdm_global_umbrella_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, frmt_current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name, price_increase_perc, vat_no, is_revoke, created_by, previous_request_days FROM public.func_buyer_details('" + req.body.country + "', '" + req.body.email + "', '' , '', '','','')";


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
			}
		});
		} catch(e) {
			console.log(e);
			return res.status(200).json({ status: false, message: "Server Error" });
			// [Error: Uh oh!]
		}
	});

	app.get('/buyer_article_details', async function (req, res) {
		var condition = '';
		try {
		if (req.query.searchSupplierNumber != '' && req.query.searchSupplierNumber != undefined) {
			condition = condition + " AND suppl_no = '" + req.query.searchSupplierNumber + "'"
		}
		
		if (req.query.supplier_number != '' && req.query.supplier_number != undefined) {
			condition = condition + " AND suppl_no IN (" + req.query.supplier_number + ")"
		}

		if (req.query.searchRequestedDate != '' && req.query.searchRequestedDate != undefined) {
			var searchRequestedDate = req.query.searchRequestedDate.split(' ')
			condition = condition = condition + " AND request_date BETWEEN '" + searchRequestedDate[0] + "' and '" + searchRequestedDate[2] + "'"
		}

		if (req.query.searchStatus != '' && req.query.searchStatus != undefined) {
			condition = condition + " AND action_status = '" + req.query.searchStatus + "'"
		}

		if (req.query.searchCategory != '' && req.query.searchCategory != undefined) {
			condition = condition + " AND stratbuyer_name = '" + req.query.searchCategory + "'"
		}

		var date_format = 'dd-mm-YYYY';

		if (req.query.flag != '' && req.query.flag != undefined && req.query.flag != '') {
			condition = condition + " AND negotiate_final_price IS NULL AND price_increase_communicated_date IS NULL"
			date_format = 'yyyy-mm-dd';
			// date_format = 'dd-mm-YYYY';
		}

		var query = "SELECT row_id , bdm_global_umbrella_no, mikg_art_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, current_price, frmt_current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, '"+date_format+"') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, '"+date_format+"') as price_increase_communicated_date, to_char(price_increase_effective_date, '"+ date_format+"') as price_increase_effective_date, stratbuyer_name, price_increase_perc, vat_no, is_revoke, created_by, previous_request_days FROM public.func_buyer_details('" + req.query.country + "', '" + req.query.email + "') where new_price IS NOT NULL AND request_date IS NOT NULL"+ condition+" ORDER BY action_status DESC, row_id DESC"

		console.log("query================= buyer_article_details")
		// console.log(query)
		
		await con.query(query, function (err, result) {
			if (err) {
				console.log(err)
				res.json({ status: false });
				return;
			} else {
				res.json({ status: true, data: result.rows });
				return;
			}
		});
		} catch(e) {
			console.log(e);
			return res.status(200).json({ status: false, message: "Server Error" });
			// [Error: Uh oh!]
		}
	});

	app.get('/buyer_supplier_details', async function (req, res) {
		try {
		var query = "SELECT bdm_global_umbrella_no, stratbuyer_name, bdm_global_umbrella_name, suppl_no FROM public.vw_request_details where suppl_no='" + req.query.suppl_no + "' AND request_date IS NOT NULL limit 1";
		await con.query(query, async function (err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else {
				if (result.rows && result.rows[0]) {
					var query1 = "select * from vw_buyer_dashboard where stratbuyer_name ='" + result.rows[0].stratbuyer_name + "'";
					await con.query(query1, function (err1, result1) {
						if (err1) {
							res.json({ status: true, data: result.rows, response: "" });
							return;
						} else {
							res.json({ status: true, data: result.rows, response: result1.rows });
							return;
						}
					});
				} else {
					res.json({ status: true, data: result.rows, response: "" });
					return;
				}
				
			}
		});
		} catch(e) {
			console.log(e);
			return res.status(200).json({ status: false, message: "Server Error" });
			// [Error: Uh oh!]
		}
	});

	app.get('/buyer_supplier_details_list', async function (req, res) {
		var query = "SELECT row_id, suppl_no, suppl_name, ean_no, art_no, art_name_tl, price_increase_perc, agreed_price_increase_perc, action_status, bdm_global_umbrella_no, bdm_global_umbrella_name FROM public.vw_request_details where country_name='" + req.query.countryname + "' AND suppl_no='" + req.query.suppl_no + "'  ORDER BY action_status DESC, row_id DESC";
		await con.query(query, async function (err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else {
				res.json({ status: true, data: result.rows });
				return;
			}
		});
	});

	app.get('/download_supplier_assoerment_pdf', function (req, res) {
		try {
		var supplier_number = req.query.supplier_number;
		var query = "select coalesce(suppl_name_tl,suppl_name) as suppl_name, suppl_no, art_no, art_name, frmt_new_price as new_price, frmt_negotiate_final_price as final_price, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date from vw_request_details where action_status='closed' and country_name='" + req.query.country + "' AND SUPPL_NO = '" + req.query.supplier_number + "'";
		console.log("download_supplier_assoerment_pdf")
		// console.log(query)
		con.query(query, async function (err, result) {
			if (err) {
				res.contentType("application/pdf");
				res.send();
				return;
			} else {
				if (result.rowCount > 0) {
					var assortment_details = result.rows
					var supplier_name = result.rows[0].suppl_name
					var file_path = path.join(__dirname + '/pdf/supplier_assortments_' + supplier_number + '.pdf');
					var flag = 'pdf-download';
					await createSupplierAssortments(assortment_details, file_path, res, req.query.country, req.query.buyer_name, flag, supplier_name)
				} else {
					res.contentType("application/pdf");
					res.send();
					return;
				}
			}
		});
		} catch(e) {
			console.log(e);
			return res.status(200).json({ status: false, message: "Server Error" });
			// [Error: Uh oh!]
		}
	});

	app.post('/upload_buyer_input', async function (req, res) {
		var data = {};
		var buyer_inputs = req.body.buyer_inputs
		var len = buyer_inputs.length;
		var sucess_count = 0;
		var error_count = 0;
		var count = 0;
		try {
		async.waterfall([
			function (callback) {
				buyer_inputs.forEach(async function (value, key) {					
					var query = "select row_id, new_price from tbl_request_details where suppl_no='" + value.Supplier_Number + "' and art_no='" + value.Article_Number + "' and new_price='" + value.Requested_Price + "'";
					await con.query(query, async function (err, result) {
						console.log(err)
						console.log(result)
						if (err) {
							error_count++;
						}else if(result.rowCount == 0){
							error_count++;
						} else {
							console.log(result.rows);
							if (result.rows[0].new_price == value.Requested_Price) {
								console.log(value.Price_Effective_Date)
								var date = new Date(value.Price_Finalize_Date);
								var date1 = new Date(value.Price_Effective_Date);
								const newdate = date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
								const newdate1 = date1.getFullYear() + "-" + (date1.getMonth()+1) + "-" + date1.getDate();
								console.log(newdate);
								console.log(newdate1);

								var query2 = "call public.usp_update_requestdetails(record_id=>" + result.rows[0].row_id + ", in_new_price=>" + value.Requested_Price + ", in_negotiate_price=>" + value.Final_Price + ", in_finalize_date=>'" + newdate + "', in_effective_date=>'" + newdate1 + "', in_metro_comment =>'" + value.CAT_Manager_Comment + "', in_updated_by =>'" + req.body.email + "')";
								console.log(query2);
								con.query(query2, async function (err2, result2) {
									console.log(err2)
									console.log(result2)
									if (err2) {
										error_count++;
									} else {
										count++;
										sucess_count++;
										if(count == len){
											callback(null, sucess_count, error_count)
										}
									}								
								});
							}
						}
					});
				});		
			},
			function (sucess_count, error_count,callback) {
				// var query = "SELECT row_id , bdm_global_umbrella_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, frmt_current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name, price_increase_perc, vat_no, is_revoke, created_by, previous_request_days FROM public.func_buyer_details('" + req.body.country + "', '" + req.body.email + "', '' , '', '','','')";
				var query = "SELECT row_id, bdm_global_umbrella_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, current_price, frmt_current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name, price_increase_perc, vat_no, is_revoke, created_by, previous_request_days FROM public.func_buyer_details('" + req.body.country + "', '" + req.body.email + "') where new_price IS NOT NULL AND request_date IS NOT NULL ORDER BY action_status DESC, row_id DESC";
				con.query(query, function (err, result) {
					if (err) {
						res.json({ status: false });
						return;
					} else {
						data.buyerInputs = result.rows
						res.json({ status: true, data: data, sucess_count: sucess_count, error_count: error_count });
						return;
					}
				});
			}
		]);
		} catch(e) {
			console.log(e);
			return res.status(200).json({ status: false, message: "Server Error" });
			// [Error: Uh oh!]
		}
	});

	app.post('/bulk_closed_supplier_input', async function (req, res) {
		var data = {};
		var rosIds = req.body.rosIds
		var len = rosIds.length;
		var sucess_count = 0;
		var error_count = 0;
		var count = 0;
		try {
		async.waterfall([
			function (callback) {
				for (let i = 0; i < rosIds.length; i++) {
					var query = "call public.usp_update_requestdetails (record_id=>" + rosIds[i] + ", in_action_status => 'closed', in_updated_by =>'" + req.body.email + "')";
					con.query(query, async function (err, result) {
						if (err) {
							error_count++;
							count++;
							if(count == len){
								callback(null, sucess_count, error_count)
							}
						} else {
							count++;
							sucess_count++;
							if(count == len){
								callback(null, sucess_count, error_count)
							}
						}
					});
				}
			},
			function (sucess_count, error_count, callback) {
				// var query = "SELECT row_id, bdm_global_umbrella_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, frmt_current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name, price_increase_perc, vat_no, is_revoke, created_by, previous_request_days FROM public.func_buyer_details('" + req.body.country + "', '" + req.body.email + "') where new_price IS NOT NULL AND request_date IS NOT NULL ORDER BY action_status DESC, row_id DESC";
				// var query = "SELECT row_id , bdm_global_umbrella_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, frmt_current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name, price_increase_perc, vat_no, is_revoke, created_by, previous_request_days FROM public.func_buyer_details('" + req.body.country + "', '" + req.body.email + "', '' , '', '','','')";
				var query = "SELECT row_id, bdm_global_umbrella_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, current_price, frmt_current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name, price_increase_perc, vat_no, is_revoke, created_by, previous_request_days FROM public.func_buyer_details('" + req.body.country + "', '" + req.body.email + "') where new_price IS NOT NULL AND request_date IS NOT NULL ORDER BY action_status DESC, row_id DESC";

				con.query(query, function (err, result) {
					if (err) {
						res.json({ status: false });
						return;
					} else {
						data.buyerInputs = result.rows
						res.json({ status: true, data: data, sucess_count: sucess_count, error_count: error_count });
						return;
					}
				});
			}
		]);
		} catch(e) {
			console.log(e);
			return res.status(200).json({ status: false, message: "Server Error" });
			// [Error: Uh oh!]
		}
	});

	app.post('/update_supplier_input_by_buyer', async function (req, res) {		
		var data = {};
		var query = "call public.usp_update_requestdetails (record_id=>" + req.body.row_id + ", in_new_price=>" + req.body.new_price + ", in_reason=>'" + req.body.reason + "', in_effective_date=>'" + req.body.price_effective_date + "', in_updated_by=>'" + req.body.email + "')";
		// console.log(query)
		try {
		await con.query(query, function (err, result) {
			if (err) {
				console.log(err)
				res.json({ status: false, message: err });
				return;
			} else {
				var condition = '';
				var searchRequestedstartDate = '';
				var searchRequestedendDate = '';

				if (req.body.searchSupplierNumber != '' && req.body.searchSupplierNumber != undefined) {
					condition = condition + " AND suppl_no = '" + req.body.searchSupplierNumber + "'"
				}

				if (req.body.searchArticleNumber != '' && req.body.searchArticleNumber != undefined) {
					condition = condition + " AND art_no = '" + req.body.searchArticleNumber + "'"
				}

				if (req.body.searchRequestedDate != '' && req.body.searchRequestedDate != undefined) {
					var searchRequestedDate = req.body.searchRequestedDate.split(' ')
					searchRequestedstartDate = searchRequestedDate[0]
					searchRequestedendDate = searchRequestedDate[1]
					condition = condition + " AND request_date BETWEEN '" + searchRequestedDate[0] + "' and '" + searchRequestedDate[2] + "'"
				}

				if (req.body.searchStatus != '' && req.body.searchStatus != undefined ) {
					condition = condition + " AND action_status = '" + req.body.searchStatus + "'"
				}

				// var query = "SELECT row_id, bdm_global_umbrella_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, frmt_current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name, price_increase_perc, vat_no, is_revoke, created_by, previous_request_days FROM public.func_buyer_details('" + req.body.country + "', '" + req.body.email + "') where new_price IS NOT NULL AND request_date IS NOT NULL" + condition + " ORDER BY action_status DESC, row_id DESC";
				// var query = "SELECT row_id , bdm_global_umbrella_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, frmt_current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name, price_increase_perc, vat_no, is_revoke, created_by, previous_request_days FROM public.func_buyer_details('" + req.body.country + "', '" + req.body.email + "', '"+ req.body.searchSupplierNumber +"' , '" + searchRequestedstartDate + "', '" + searchRequestedendDate + "','" + req.body.searchStatus + "','" + req.body.searchCategory + "')";
				var query = "SELECT row_id, bdm_global_umbrella_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, current_price, frmt_current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name, price_increase_perc, vat_no, is_revoke, created_by, previous_request_days FROM public.func_buyer_details('" + req.body.country + "', '" + req.body.email + "') where new_price IS NOT NULL AND request_date IS NOT NULL"+ condition +" ORDER BY action_status DESC, row_id DESC";
				// console.log(query)
				con.query(query, function (err, result) {
					if (err) {
						console.log(err)
						res.json({ status: false , message: 'second'  });
						return;
					} else {
						data.supplierInputs = result.rows
						res.json({ status: true, data: data });
						return;
					}
				});
			}
		});
		} catch(e) {
			console.log(e);
			return res.status(200).json({ status: false, message: "Server Error" });
			// [Error: Uh oh!]
		}
	});

	app.post('/delete_supplier_input_behalf_of_supplier', async function (req, res) {

		var data = {};
		try {
		var query = "call public.usp_update_requestdetails (record_id=>" + req.body.id + ", in_is_deleted=> true, in_updated_by=>'" + req.body.email + "')";
		await con.query(query, function (err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else {
				var condition = '';
				var searchRequestedstartDate = '';
				var searchRequestedendDate = '';

				if (req.body.searchSupplierNumber != '') {
					condition = condition + " AND suppl_no = '" + req.body.searchSupplierNumber + "'"
				}

				if (req.body.searchArticleNumber != '' && req.body.searchArticleNumber != undefined) {
					condition = condition + " AND art_no = '" + req.body.searchArticleNumber + "'"
				}

				if (req.body.searchRequestedDate != '') {
					var searchRequestedDate = req.body.searchRequestedDate.split(' ')
					searchRequestedstartDate = searchRequestedDate[0]
					searchRequestedendDate = searchRequestedDate[1]
					condition = condition + " AND request_date BETWEEN '" + searchRequestedDate[0] + "' and '" + searchRequestedDate[2] + "'"
				}

				if (req.body.searchStatus != '') {
					condition = condition + " AND action_status = '" + req.body.searchStatus + "'"
				}

				// var query = "SELECT row_id, bdm_global_umbrella_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, frmt_current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name, price_increase_perc, vat_no, is_revoke, created_by, previous_request_days FROM public.func_buyer_details('" + req.body.country + "', '" + req.body.email + "') where new_price IS NOT NULL AND request_date IS NOT NULL" + condition + " ORDER BY action_status DESC, row_id DESC";
				// var query = "SELECT row_id , bdm_global_umbrella_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, frmt_current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name, price_increase_perc, vat_no, is_revoke, created_by, previous_request_days FROM public.func_buyer_details('" + req.body.country + "', '" + req.body.email + "', '"+ req.body.searchSupplierNumber +"' , '" + searchRequestedstartDate + "', '" + searchRequestedendDate + "','" + req.body.searchStatus + "','" + req.body.searchCategory + "')";
				var query = "SELECT row_id, bdm_global_umbrella_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, current_price, frmt_current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name, price_increase_perc, vat_no, is_revoke, created_by, previous_request_days FROM public.func_buyer_details('" + req.body.country + "', '" + req.body.email + "') where new_price IS NOT NULL AND request_date IS NOT NULL"+ condition+" ORDER BY action_status DESC, row_id DESC";
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
		} catch(e) {
			console.log(e);
			return res.status(200).json({ status: false, message: "Server Error" });
			// [Error: Uh oh!]
		}
	});

	app.get('/getSupplierListByBuyer', async function (req, res) {
		var data = {};
		var supplierIDOptions = [];
		// console.log(req.query);
		try {
		var query = "SELECT suppl_no, suppl_name, buyer_emailid, stratbuy_domain_id, stratbuyer_name FROM public.vw_suppl_with_buyer where country_name='" + req.query.country + "' AND buyer_emailid='" + req.query.email + "'";
		// var getUniqueSupplierIdQuery = "SELECT distinct suppl_no FROM public.vw_suppl_with_buyer where buyer_emailid = '" + req.query.email + "' AND country_name='" + req.query.country + "'";
		
		// console.log(query);

		await con.query(query, async function (err, result) {
			if (err) {
				console.log(err);
				res.json({ status: false });
				return;
			} else {
				result.rows.forEach(function (value, key) {
					option = { value: value.suppl_no, label: value.suppl_no +" - "+ value.suppl_name}
					supplierIDOptions.push(option);
				});
				data.supplierIDOptions = supplierIDOptions;
				res.json({ status: true, data: data });
				return;
			}
		});
		} catch(e) {
			console.log(e);
			return res.status(200).json({ status: false, message: "Server Error" });
			// [Error: Uh oh!]
		}
	});

	app.post('/add_supplier_input_by_buyer', function (req, res) {
		var data = {};
		try {
		sql = `CALL public."usp_addNewRequest"('` + req.body.article_number + `','` + req.body.supplier_number + `','` + req.body.country + `',` + req.body.new_price + `,'` + req.body.reason + `','` + req.body.price_effective_date + `','` + req.body.email + `','` + req.body.subsys_no + `','` + req.body.ean_no + `');`;	
		console.log(sql);
		con.query(sql, async function (err, result) {
			if (err) {
				res.json({ status: false });
				return;
			};
			//sendEmail(to, subject, html)
			// var query = "SELECT row_id, bdm_global_umbrella_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, frmt_current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name, price_increase_perc, vat_no, is_revoke, created_by, previous_request_days FROM public.func_buyer_details('" + req.body.country + "', '" + req.body.email + "') where new_price IS NOT NULL AND request_date IS NOT NULL ORDER BY action_status DESC, row_id DESC";
			// var query = "SELECT row_id , bdm_global_umbrella_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, frmt_current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name, price_increase_perc, vat_no, is_revoke, created_by, previous_request_days FROM public.func_buyer_details('" + req.body.country + "', '" + req.body.email + "', '' , '', '','','')";
			var query = "SELECT row_id, bdm_global_umbrella_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, current_price, frmt_current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name, price_increase_perc, vat_no, is_revoke, created_by, previous_request_days FROM public.func_buyer_details('" + req.body.country + "', '" + req.body.email + "') where new_price IS NOT NULL AND request_date IS NOT NULL ORDER BY action_status DESC, row_id DESC";
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
		} catch(e) {
			console.log(e);
			return res.status(200).json({ status: false, message: "Server Error" });
			// [Error: Uh oh!]
		}
	});

	app.post('/upload_supplier_input_by_buyer', async function (req, res) {
		var data = {};
		var supplier_inputs = req.body.supplier_inputs
		var len = supplier_inputs.length;
		var sucess_count = 0;
		var error_count = 0;
		var count = 0;
		try {
		// subsys_no
		async.waterfall([
			function (callback) {
				supplier_inputs.forEach(async function (value, key) {
					if (value.new_price && value.new_price != 'null' && value.new_price != undefined && value.new_price != null) {
						if (value.new_price > 0) {
							sql = `CALL public."usp_addNewRequest"('` + value.art_no + `','` + value.suppl_no + `','` + value.country_name + `',` + value.new_price + `,'` + value.price_change_reason + `','` + value.price_increase_effective_date + `','` + req.body.email + `','` + req.body.subsys_no + `','` + req.body.ean_no + `');`;
							await con.query(sql, function (err, result) {
								console.log(err);
								console.log(result);
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
				// var query = "SELECT row_id, bdm_global_umbrella_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, frmt_current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name, price_increase_perc, vat_no, is_revoke, created_by, previous_request_days FROM public.func_buyer_details('" + req.body.country + "', '" + req.body.email + "') where new_price IS NOT NULL AND request_date IS NOT NULL ORDER BY action_status DESC, row_id DESC";
				// var query = "SELECT row_id , bdm_global_umbrella_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, frmt_current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name, price_increase_perc, vat_no, is_revoke, created_by, previous_request_days FROM public.func_buyer_details('" + req.body.country + "', '" + req.body.email + "', '' , '', '','','')";
				var query = "SELECT row_id, bdm_global_umbrella_no, suppl_no, suppl_name, ean_no, art_no, art_name_tl, current_price, frmt_current_price, new_price, frmt_new_price, price_difference_perc, to_char(request_date, 'dd-mm-YYYY') as request_date, price_change_reason, action_status, frmt_negotiate_final_price, negotiate_final_price, to_char(price_increase_communicated_date, 'dd-mm-YYYY') as price_increase_communicated_date, to_char(price_increase_effective_date, 'dd-mm-YYYY') as price_increase_effective_date, stratbuyer_name, price_increase_perc, vat_no, is_revoke, created_by, previous_request_days FROM public.func_buyer_details('" + req.body.country + "', '" + req.body.email + "') where new_price IS NOT NULL AND request_date IS NOT NULL ORDER BY action_status DESC, row_id DESC";
				// console.log(query)
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
		} catch(e) {
			console.log(e);
			return res.status(200).json({ status: false, message: "Server Error" });
			// [Error: Uh oh!]
		}
	});

	app.get('/checkOpenArticles', async function (req, res) {
		var query = "SELECT suppl_no, suppl_name FROM public.tbl_request_details where suppl_no='" + req.query.supplier_number + "' AND art_no='" + req.query.article_number + "' AND action_status='open' AND is_deleted = 'false'";
		// console.log(query)
		try {
		await con.query(query, async function (err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else {
				if (result.rowCount > 0) {
					res.json({ status: true});
					return;
				}else{
					res.json({ status: false });
					return;
				}
			}
		});
		} catch(e) {
			console.log(e);
			return res.status(200).json({ status: false, message: "Server Error" });
			// [Error: Uh oh!]
		}
	});

	app.get('/getMintecData', async function (req, res) {
		try {
		//var query = "SELECT id, region, country_name, category, sub_category, dashboard_name, dashboard_url, created_by, is_deleted, created_on FROM public.vw_mintec_dashboard where country_name='" + req.query.country_name + "' AND category='" + req.query.stratbuyer_name + "'";
		var query = "SELECT id,  stratbuyer_category, mintec_sub_category, dashboard_name, dashboard_url, created_by, is_deleted, created_on FROM public.vw_mintec_dashboard WHERE stratbuyer_category='" + req.query.stratbuyer_name + "'";
		// console.log(query)
		await con.query(query, async function (err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else {
				// console.log(result.rows)
				if (result.rowCount > 0) {
					res.json({ status: true, data: result.rows});
					return;
				}else{
					res.json({ status: false,message: 'No data found' });
					return;
				}				
			}
		});
		} catch(e) {
			console.log(e);
			return res.status(200).json({ status: false, message: "Server Error" });
			// [Error: Uh oh!]
		}
	});		
}
