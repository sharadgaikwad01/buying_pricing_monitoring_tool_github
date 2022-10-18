var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
JiraApi = require('jira').JiraApi

//=========== Create server ===================
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	next();
});

//=========== Mysql connect ===================
var con = mysql.createConnection({
	host: "localhost",
	user: "root",
	password: "mynewpassword",
	port: 3306,
	database: "sor"
});

con.connect(function(err) {
	if (err) {
		return console.error('MySQL Datatabase Connection Errr: ' + err.message);
		process.exit();
	}
	console.log("MySQL server connected");
})

//=========== Filter data API  ===================
app.get('/get-filter', function(req, res) {
	var data = {};
	con.query(`
	SELECT DISTINCT market
	FROM datastream order by market`, function(err, result, fields) {
		if (err) {
			console.log(err.message);
			res.json({ status: false });
			return;
		};

		data['market'] = [];
		result.forEach( element => {
			data['market'].push(element.market);
		});

		con.query(`
		SELECT DISTINCT dsp
		FROM datastream order by dsp`, function(err, result, fields) {
			if (err) {
				console.log(err.message);
				res.json({ status: false });
				return;
			};

			data['dsp'] = [];
			result.forEach( element => {
				data['dsp'].push(element.dsp);
			});

			con.query(`
			SELECT DISTINCT brand.name
			FROM datastream, brand
			WHERE datastream.brand_id = brand.id order by brand.name`, function(err, result, fields) {
				if (err) {
					console.log(err.message);
					res.json({ status: false });
					return;
				};

				data['brand'] = [];
				result.forEach( element => {
					data['brand'].push(element.name);
				});

				con.query(`
				SELECT DISTINCT DATE(process_date) as process_date from daily_status  order by process_date desc limit 30`, function(err, result, fields) {
					if (err) {
						console.log(err.message);
						//res.json({ status: false });
						res.json({ status: false, data: data });
						return;
					};
					console.log(result);
					data['date'] = [];
					result.forEach( element => {
						var process_date = `${element.process_date}`.split('T');
						console.log(element.process_date);
						data['date'].push(element.process_date);
					});
	
					res.json({ status: true, data: data });
				});
			});
		});
	});
});

//=========== Dashboard data =====================
app.get('/dashboard-data', function(req, res) {
	var data = {};
	console.log("//=========== Dashboard data =====================");
	console.log(req.query.date);
	console.log(req.query);

	var date = new Date();
	console.log (date);
	if (req.query.date == ''){
		query_date_string = `AND daily_status.process_date = CURDATE()`;
	}
	else{
		var date_part = `${req.query.date}`.split('T')
		query_date_string = `AND daily_status.process_date = '`+ date_part[0] + `'`;
	}

	if (req.query.market == ''){
		query_market_string = '';
	}
	else{
		query_market_string = `AND ds.market = '`+ req.query.market + `'`;
	}

	if (req.query.provider == ''){
		query_provider_string = '';
	}
	else{
		query_provider_string = `AND ds.dsp = '` + req.query.provider + `'`;
	}

	if (req.query.brand == ''){
		query_brand_string = '';
	}
	else{
		query_brand_string = `AND brand.name  = '` + req.query.brand + `'`;
	}

	console.log(query_date_string);
	query= `SELECT COUNT(daily_status.id) AS late
	FROM daily_status, datastream AS ds, brand
	WHERE daily_status.ds_id = ds.ds_id
	AND ds.brand_id = brand.id
	` + query_market_string + `
	` + query_date_string + `
	` + query_provider_string + `
	` + query_brand_string + ``
	+ ` AND daily_status.status = 'LATE'`;
	console.log("++++++++LATE QUERY: "+query);

	con.query(query, function(err, result, fields) {
		if (err) {
			console.log(err.message);
			res.json({ status: false });
			return;
		};

		data.late_cnt = result[0].late;
	});

	query= `SELECT COUNT(daily_status.id) AS total
	FROM daily_status, datastream AS ds, brand
	WHERE daily_status.ds_id = ds.ds_id
	AND ds.brand_id = brand.id
	` + query_market_string + `
	` + query_date_string + `
	` + query_provider_string + `
	` + query_brand_string + ``;
	console.log(query);

	con.query(query, function(err, result, fields) {
		if (err) {
			console.log(err.message);
			res.json({ status: false });
			return;
		};

		data.total_cnt = result[0].total;
		query = `SELECT COUNT(daily_status.id) AS success
		FROM daily_status, datastream AS ds, brand
		WHERE daily_status.ds_id = ds.ds_id
		AND ds.brand_id = brand.id
		` + query_market_string + `
		` + query_date_string + `
		` + query_provider_string + `
		` + query_brand_string +
		` AND daily_status.status = 'SUCCESS'`;
		console.log("SUCCESS QUERY:" + query);
		con.query(query, function(err, result, fields) {
			if (err) {
				console.log(err.message);
				res.json({ status: false });
				return;
			};

			data.success_cnt = result[0].success;
			query = `SELECT COUNT(daily_status.id) AS failure
			FROM daily_status, datastream AS ds, brand
			WHERE daily_status.ds_id = ds.ds_id
			AND ds.brand_id = brand.id
			` + query_market_string + `
			` + query_date_string + `
			` + query_provider_string + `
			` + query_brand_string
			+ ` AND ( daily_status.status = 'FAILURE' or daily_status.status = 'SUCCESS-ERROR')`;
			console.log(query);
			con.query(query, function(err, result, fields) {
				if (err) {
					console.log(err.message);
					res.json({ status: false });
					return;
				};

				data.failure_cnt = result[0].failure;
				query = `SELECT COUNT(daily_status.id) AS inactivated
				FROM daily_status, datastream AS ds, brand
				WHERE daily_status.ds_id = ds.ds_id
				AND ds.brand_id = brand.id
				` + query_market_string + `
				` + query_date_string + `
				` + query_provider_string + `
				` + query_brand_string
				+ ` AND ds.is_active = 0`;
				console.log(query);
				con.query(query, function(err, result, fields) {
					if (err) {
						console.log(err.message);
						res.json({ status: false });
						return;
					};

					data.inactivated_cnt = result[0].inactivated;
					query = `SELECT COUNT(daily_status.id) AS wait
					FROM daily_status, datastream AS ds, brand
					WHERE daily_status.ds_id = ds.ds_id
					AND ds.brand_id = brand.id
					` + query_market_string + `
					` + query_date_string + `
					` + query_provider_string + `
					` + query_brand_string
					+ ` AND daily_status.status = 'WAIT'`;
					console.log(query);
					con.query(query, function(err, result, fields) {
						if (err) {
							console.log(err.message);
							res.json({ status: false });
							return;
						};

						data.wait_cnt = result[0].wait;
						query = `SELECT COUNT(daily_status.id) AS cnt, brand.name AS brand
						FROM daily_status, datastream AS ds, brand
						WHERE daily_status.ds_id = ds.ds_id
						AND ds.brand_id = brand.id
						` + query_market_string + `
						` + query_date_string + `
						` + query_provider_string + `
						` + query_brand_string
						+ ` GROUP BY brand.id`;
						console.log(query);
						con.query(query, function(err, result, fields) {
							if (err) {
								console.log(err.message);
								res.json({ status: false });
								return;
							};

							data.cnt_by_brand = result;
							console.log(result);
							query = `SELECT COUNT(daily_status.id) AS cnt, ds.market AS market
							FROM daily_status, datastream AS ds, brand
							WHERE daily_status.ds_id = ds.ds_id
							AND ds.brand_id = brand.id
							` + query_market_string + `
							` + query_date_string + `
							` + query_provider_string + `
							` + query_brand_string
							+ ` GROUP BY ds.market`;
							console.log(query);
							con.query(query, function(err, result, fields) {
								if (err) {
									console.log(err.message);
									res.json({ status: false });
									return;
								};
								console.log(result);

								data.cnt_by_market = result;
								console.log(data);
								res.json({ status: true, data: data });
								return;
							});
						});
					});
				});
			});
		});
	});
});

app.get('/dashboard-filecount-data', function(req, res) {
    var data = {};
	console.log("//=========== Dashboard filecount data =====================");
    console.log(req.query.date);
    console.log(req.query);

    var date = new Date();
    console.log (date);
    if (req.query.date == ''){
        chart_query_date_string = `AND daily_status.process_date <= CURDATE()`;
        query_ticket_date_string = ` DATE(ticket.dt_created) <= CURDATE()`;
    }
    else{
        date = new Date(req.query.date);
        var date_part = `${req.query.date}`.split('T')
        chart_query_date_string = `AND daily_status.process_date <= '`+ date_part[0] + `'`;
        query_ticket_date_string = ` DATE(ticket.dt_created) <= '`+ date_part[0] + `'`;
    }
    var dateTo = new Date(date);
    dateTo.setDate(dateTo.getDate() - 7);
    chart_query_date_string += ` AND daily_status.process_date >= '` + dateTo.toISOString().split('T')[0] + `'`;
    query_ticket_date_string += ` AND DATE(ticket.dt_created) >= '` + dateTo.toISOString().split('T')[0] + `'`;

    if (req.query.market == ''){
        query_market_string = '';
    }
    else{
        query_market_string = `AND ds.market = '`+ req.query.market + `'`;
    }

    if (req.query.provider == ''){
        query_provider_string = '';
    }
    else{
        query_provider_string = `AND ds.dsp = '` + req.query.provider + `'`;
    }

    if (req.query.brand == ''){
        query_brand_string = '';
    }
    else{
        query_brand_string = `AND brand.name  = '` + req.query.brand + `'`;
    }

    console.log(chart_query_date_string);

    con.query(`
    SELECT COUNT(daily_status.id) AS files, DATE(daily_status.process_date) as date
    FROM daily_status, datastream AS ds, brand
    WHERE daily_status.ds_id = ds.ds_id
    AND ds.brand_id = brand.id
    ` + query_market_string + `
    ` + chart_query_date_string + `
    ` + query_provider_string + `
    ` + query_brand_string +
    `GROUP BY daily_status.process_date`, function(err, result, fields) {
        if (err) {
            console.log(err.message);
            res.json({ status: false });
            return;
        };

        data.total = result;

        con.query(`
        SELECT COUNT(daily_status.id) AS success, DATE(daily_status.process_date) as date
        FROM daily_status, datastream AS ds, brand
        WHERE daily_status.ds_id = ds.ds_id
        AND ds.brand_id = brand.id
        ` + query_market_string + `
        ` + chart_query_date_string + `
        ` + query_provider_string + `
        ` + query_brand_string +
        `AND daily_status.status = 'SUCCESS'
        GROUP BY daily_status.process_date`, function(err, result, fields) {
            if (err) {
                console.log(err.message);
                res.json({ status: false });
                return;
            };

            data.success = result;

            con.query(`
            SELECT COUNT(daily_status.id) AS failure, DATE(daily_status.process_date) as date
            FROM daily_status, datastream AS ds, brand
            WHERE daily_status.ds_id = ds.ds_id
            AND ds.brand_id = brand.id
            ` + query_market_string + `
            ` + chart_query_date_string + `
            ` + query_provider_string + `
            ` + query_brand_string +
            `AND daily_status.status = 'FAILURE'
            GROUP BY daily_status.process_date`, function(err, result, fields) {
                if (err) {
                    console.log(err.message);
                    res.json({ status: false });
                    return;
                };

                data.failure = result;

                con.query(`
                SELECT COUNT(ticket.id) AS t_created, DATE(ticket.dt_created) AS date
                FROM ticket
                WHERE ` + query_ticket_date_string +
                ` GROUP BY DATE(ticket.dt_created)`, function(err, result, fields) {
                    if (err) {
                        console.log(err.message);
                        res.json({ status: false });
                        return;
                    };

                    data.ticket_created = result;

                    res.json({ status: true, data: data });
                });
            });
        });
    });
});
//=========== Brands Page API ===================
app.get('/brands', function(req, res) {

	query = "SELECT * FROM brand";
	console.log(query);
	con.query(query, function(err, result, fields) {
		if (err) {
			console.log("Get brands information error. Try again, please.");
			res.json({ status: false });
			return;
		};
		res.json({ status: true, data: result });
	});	
});

app.post('/brands', function(req, res) {

	var sql = "INSERT INTO brand SET ?";
	con.query(sql, [req.body], function (err, result) {
		if (err) {
			console.log("Save new brand data failure. Please try again.");
			res.json({ status: false });
			return;
		};
		console.log("New brand is inserted.");
		res.json({ status: true });
	});
})

app.post('/brand-delete', function(req, res) {

	var sql = "DELETE FROM brand WHERE id = ?";
	con.query(sql, req.body.id, function (err, result) {
		if (err) {
			console.log("Delete failure. Please try again.");
			res.json({ status: false });
			return;
		};
		console.log("Brand is deleted.");
		res.json({ status: true });
	});
})

//=========== Providers Page API ===================
app.get('/providers', function(req, res) {

	var sql = `
		SELECT
		  id,
		  dsp_code AS name,
		  type,
		  market,
		  contact_email AS contact,
		  CASE WHEN contact_email = "" THEN "ADD" ELSE "UPDATE" END AS action
		FROM
		  dsp_contact`;
	console.log(sql);
	con.query(sql, function(err, result, fields) {
		if (err) {
			console.log("Get providers information error. Try again, please.");
			res.json({ status: false });
			return;
		};
		res.json({ status: true, data: result });
	});	
});






app.post('/provider-contact-save', function(req, res) {
	console.log("req.body");
	console.log(req.body);
	var sql = 'UPDATE dsp_contact SET contact_email = ? WHERE dsp_code = ? and market = ? and type = ?';
	con.query(sql, [req.body.contact, req.body.name, req.body.market, req.body.type], function (err, result) {
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
		console.log("Provider Contact has been saved.");
		res.json({ status: true });
	});
})


//=========== DataStream Page API ===================
app.get('/datastream', function(req, res) {

	var sql = `
		SELECT DISTINCT
		  datastream.name AS name,
		  daily_status.process_date,
		  DATE_FORMAT(daily_status.dataStartDate, '%m-%d-%Y') AS dataStartDate,
		  DATE_FORMAT(daily_status.dataEndDate, '%m-%d-%Y') AS dataEndDate,
		  datastream.type AS type,
		  datastream.dsp AS provider,
		  datastream.market AS market,
		  brand.name AS brand,
		  daily_status.status AS status,
		  daily_status.endExecutionTime AS processedon,		  
		  daily_status.status AS status,
		  daily_status.ticket AS ticketnum,
		  daily_status.ticket AS ticket
		FROM
		  datastream,
		  daily_status,
		  brand
		WHERE datastream.ds_id = daily_status.ds_id
		  AND datastream.brand_id = brand.id
		order by daily_status.process_date desc `;
	console.log(sql);
	con.query(sql, function(err, result, fields) {
		if (err) {
			console.log("Get providers information error. Try again, please.");
			res.json({ status: false });
			return;
		};
		res.json({ status: true, data: result });
	});	
});


//=========== Tickets Page API ===================
app.get('/tickets', function(req, res) {

	console.log("//=========== Tickets data =====================");
	//console.log(req.query.date);
	console.log(req.query);

	//var date = new Date();
	//console.log (date);
	if (req.query.date == ''){
		query_date_string = ` WHERE DATE(t.dt_created) = CURDATE()`;
	}
	else{
		//var date_part = `${req.query.date}`.split('T')
		query_date_string = ` WHERE DATE(t.dt_created) = '`+ req.query.date + `'`;
	}

	if (req.query.market == ''){
		query_market_string = '';
	}
	else{
		query_market_string = ` AND ds.market = '`+ req.query.market + `'`;
	}

	if (req.query.provider == ''){
		query_provider_string = '';
	}
	else{
		query_provider_string = ` AND ds.dsp = '` + req.query.provider + `'`;
	}

	if (req.query.tType == ''){
		query_type_string = '';
	}
	else{
		query_type_string = ` AND ds.type = '` + req.query.tType + `'`;
	}

	var sql = `
			select
			 	@n := @n + 1 AS rowid, 
				t.ticket AS ticketid,
				t.status AS status,
				DATE_FORMAT(t.dt_created, '%m/%d/%Y %H:%i') AS createdon,
				ds.dsp AS provider,
				ds.market AS market,
				ds.type AS type,
				b.name AS brand
			from (SELECT @n := 0) m, ticket t 
			join daily_status dls on t.id = dls.ticket
			left join datastream ds on ds.ds_id = dls.ds_id
			left join brand b on b.id = ds.brand_id
	        ` + query_date_string + `
	        ` + query_market_string + `
	        ` + query_provider_string + `
	        ` + query_type_string

	con.query(sql, function(err, result, fields) {
		if (err) {
			console.log("Get providers information error. Try again, please.");
			res.json({ status: false });
			return;
		};
		res.json({ status: true, data: result });
	});
});

//=========== MonthEnd Page API ===================
app.get('/monthend', function(req, res) {
	var date = new Date();
	// Find first date of current month
	// Check if there are any entries for current month.
	// If not then insert rows from monthend meta table to monthend data table.
	// If yes then shows records 
	var date = new Date();
	console.log(date);
	var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
	month = date.getMonth() + 1;
	if (month < 10){ month = '0' + month;}
	firstDay = date.getFullYear()+'-'+month + '-01';
	console.log(firstDay);
	
	var sql = `select market, task_name, month_name, 
	plan_start, 
	plan_end, 
	actual_start, 
	actual_end, 
	status, 
	notes, 
	owned_by from monthend_data where month_name = '` + firstDay +`' 
	order by market, id`;
	console.log(sql);

	con.query(sql, function(err, result, fields) {
		if (err) {
			console.log("Get providers information error. Try again, please.");
			res.json({ status: false });
			return;
		};

		res.json({ status: true, data: result });
	});	
});

app.post('/monthend-save', function(req, res) {
	console.log("req.body");
	console.log(req.body);
	var sql = 'UPDATE dsp_contact SET contact_email = ? WHERE dsp_code = ? and market = ? and type = ?';
	con.query(sql, [req.body.contact, req.body.name, req.body.market, req.body.type], function (err, result) {
		if (err) {
			console.log("Delete failure. Please try again.");
			res.json({ status: false });
			return;
		};
		res.json({ status: true });
	});
})

//=========== JIRA API ===================

app.post('/create-ticket', function(req,res) {

    console.log("Request create jira ticket.");
    var sql = "SELECT param, value FROM settings";
    
    con.query(sql, function(err, result){
        if (err) {
            console.log("Error in Get JIRA Information.");
            res.json({ status: false });
            return;
        };

        var options = {
            config: {
                "host": "",
                "port": 443,
                "username": "",
                "password": "",
                "datatype": "json"              
            },
            data: {
                "fields": {
                    "project": {
                        "key": "TEST"
                    },
                    "summary": "This is sample issue.",
                    "description": "//var jira = new JiraApi(protocol='https', host=options.config.host, username=options.config.username, password= options.config.password, strictSSL= true, verbose= true);",
                    "issuetype": {
                        "name": "Incident"
                    }
                }
            }
        }
        result.forEach((item) => {
            switch(item.param) {
                case "host":
                    options.config.host = item.value; break;
                case "username":
                    options.config.username = item.value; break;
                case "password":
                    options.config.password = item.value; break;
                case "create_ticket":
                    options.config.create_ticket = item.value; break;
                default:
                    break;
            }
        });

        var jira = new JiraClient( {
            host: options.config.host,
            basic_auth: {
                username: options.config.username,
                password: options.config.password
            }
        });

        //console.log(jira1);
        console.log("Jira1 is connected");
        
        if ( jira ){
            console.log(options);           
            jira.issue.createIssue(options.data, function(error,response) {
                console.log("Response: %j" , response.key);
                var sql = "INSERT INTO ticket(ticket) VALUES (?)";
                con.query(sql, [response.key], function (err, result) {
                    if (err) {
                        console.log("Create New ticket failure. Please try again.");
                        res.json({ status: false });
                        return;
                    }

                    // update daily_status table
                    sql = "UPDATE daily_status SET ticket = ? WHERE id = ?"
                    //var ticket_id = result.insertId;
                    console.log(sql +"\n"+req.body.dsid);
                    con.query(sql, [response.key, req.body.dsid], function(err, result) {
                        if (err) {
                            console.log("Update ticket of daily_status table failure. Please try again.");
                            res.json({ status: false });
                            return;
                        }

                        res.json({
                            status: true,
                            ticket_id: response.key
                        })
                        return;

                    });
                });
            });
        }
        else{
            alert("Cannot connect to JIRA");
            return;
        }
    });
})


app.listen(3000, console.log.call(console, 'Server started.'));
