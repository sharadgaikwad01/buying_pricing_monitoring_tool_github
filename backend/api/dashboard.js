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
	app.get('/dashboard', async function (req, res) {
        var data = {};
        var countryCode = [];
		var countryData = [];
        var supplierName = [];
		var supplierIDOptions = [];

		var condition = '';

		var getCountriesQuery = "SELECT bdm_global_umbrella_name, bg, cz, de, es, fr, hr, hu, it, kz, md, nl, pk, pl, pt, ro, rs, sk, tr, ua FROM public.vw_heatmap_dashboard_gu_tabular "+ condition;

		console.log(getCountriesQuery)

		await con.query(getCountriesQuery, function (err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else {
                result.rows.forEach(function (value, key) {
					var total = 0;
					var avg = 0;
					// countryCode.push(value.country_code);
					supplierName.push(value['bdm_global_umbrella_name']);
					countryCode.push(parseInt(value['bg']).toFixed(2));
					countryCode.push(parseInt(value['cz']).toFixed(2));
					countryCode.push(parseInt(value['de']).toFixed(2));
					countryCode.push(parseInt(value['es']).toFixed(2));
					countryCode.push(parseInt(value['fr']).toFixed(2));
					countryCode.push(parseInt(value['hr']).toFixed(2));
					countryCode.push(parseInt(value['hu']).toFixed(2));
					countryCode.push(parseInt(value['it']).toFixed(2));
					countryCode.push(parseInt(value['kz']).toFixed(2));
					countryCode.push(parseInt(value['md']).toFixed(2));
					countryCode.push(parseInt(value['nl']).toFixed(2));
					countryCode.push(parseInt(value['pk']).toFixed(2));
					countryCode.push(parseInt(value['pl']).toFixed(2));
					countryCode.push(parseInt(value['pt']).toFixed(2));
					countryCode.push(parseInt(value['ro']).toFixed(2));
					countryCode.push(parseInt(value['rs']).toFixed(2));
					countryCode.push(parseInt(value['sk']).toFixed(2));
					countryCode.push(parseInt(value['tr']).toFixed(2));
					countryCode.push(parseInt(value['ua']).toFixed(2));

					total = parseInt(value['bg']) + parseInt(value['cz']) + parseInt(value['de']) + parseInt(value['es']) + parseInt(value['fr']) + parseInt(value['hr']) + parseInt(value['hu']) + parseInt(value['it']) + parseInt(value['kz']) + parseInt(value['md']) + parseInt(value['nl']) + parseInt(value['pk']) + parseInt(value['pl']) + parseInt(value['pt']) + parseInt(value['ro']) + parseInt(value['rs']) + parseInt(value['sk']) + parseInt(value['tr']) + parseInt(value['ua']);
					avg = total / 19;
					countryCode.push(avg.toFixed(2));
					countryData.push(countryCode);
					countryCode = [];
				});
				console.log(countryData)
				data.supplierName = supplierName;
				data.countryData = countryData;
				data.countryCodeSeries = ['BG', 'CZ', 'DE', 'ES', 'FR', 'HR', 'HU', 'IT', 'KZ', 'MD', 'NL', 'PK', 'PL', 'PT', 'RO', 'RS', 'SK', 'TR', 'UA', 'AVG']

				supplierName.forEach(function (value, key) {
					option = { value: value, label: value }
					supplierIDOptions.push(option);
				});

				data.supplierIDOptions = supplierIDOptions;
				
				res.json({ status: true, data: data });
			}
		});
	});

	app.get('/category_dashboard', async function (req, res) {
        var data = {};
        var countryCode = [];
		var countryData = [];
        var categoryName = [];
		var categoryIDOptions = [];

		var condition = '';

		var getCountriesQuery = "SELECT stratbuyer_name, bg, cz, de, es, fr, hr, hu, it, kz, md, nl, pk, pl, pt, ro, rs, sk, tr, ua FROM public.vw_heatmap_dashboard_stratbuyer_tabular "+ condition;

		console.log(getCountriesQuery)

		await con.query(getCountriesQuery, function (err, result) {
			if (err) {
				res.json({ status: false });
				return;
			} else {
                result.rows.forEach(function (value, key) {
					// countryCode.push(value.country_code);
					categoryName.push(value['stratbuyer_name']);
					countryCode.push(parseInt(value['bg']).toFixed(2));
					countryCode.push(parseInt(value['cz']).toFixed(2));
					countryCode.push(parseInt(value['de']).toFixed(2));
					countryCode.push(parseInt(value['es']).toFixed(2));
					countryCode.push(parseInt(value['fr']).toFixed(2));
					countryCode.push(parseInt(value['hr']).toFixed(2));
					countryCode.push(parseInt(value['hu']).toFixed(2));
					countryCode.push(parseInt(value['it']).toFixed(2));
					countryCode.push(parseInt(value['kz']).toFixed(2));
					countryCode.push(parseInt(value['md']).toFixed(2));
					countryCode.push(parseInt(value['nl']).toFixed(2));
					countryCode.push(parseInt(value['pk']).toFixed(2));
					countryCode.push(parseInt(value['pl']).toFixed(2));
					countryCode.push(parseInt(value['pt']).toFixed(2));
					countryCode.push(parseInt(value['ro']).toFixed(2));
					countryCode.push(parseInt(value['rs']).toFixed(2));
					countryCode.push(parseInt(value['sk']).toFixed(2));
					countryCode.push(parseInt(value['tr']).toFixed(2));
					countryCode.push(parseInt(value['ua']).toFixed(2));
					total = parseInt(value['bg']) + parseInt(value['cz']) + parseInt(value['de']) + parseInt(value['es']) + parseInt(value['fr']) + parseInt(value['hr']) + parseInt(value['hu']) + parseInt(value['it']) + parseInt(value['kz']) + parseInt(value['md']) + parseInt(value['nl']) + parseInt(value['pk']) + parseInt(value['pl']) + parseInt(value['pt']) + parseInt(value['ro']) + parseInt(value['rs']) + parseInt(value['sk']) + parseInt(value['tr']) + parseInt(value['ua']);
					avg = total / 19;
					countryCode.push(avg.toFixed(2));
					countryData.push(countryCode);
					countryCode = [];
				});
				data.categoryName = categoryName;
				data.countryData = countryData;
				data.countryCodeSeries = ['BG', 'CZ', 'DE', 'ES', 'FR', 'HR', 'HU', 'IT', 'KZ', 'MD', 'NL', 'PK', 'PL', 'PT', 'RO', 'RS', 'SK', 'TR', 'UA', 'AVG']

				console.log(categoryName)

				categoryName.forEach(function (value, key) {
					option = { value: value, label: value }
					categoryIDOptions.push(option);
				});

				data.categoryIDOptions = categoryIDOptions;
				
				res.json({ status: true, data: data });
			}
		});
	});
}
