const http = require('http');
var nodemailer = require('nodemailer');
//=========== MonthEnd API Module ===================
module.exports = function(app, con) {
    app.get('/buyers', async function(req, res){
		var data = {};
        // var query = "SELECT * FROM public.tbl_users where action_status='Open'" + condition;
		var condition  = '';
        if (req.query.searchName != ''){
            condition = condition + " AND first_name LIKE '%" +req.query.searchName+"%'"
        }
		// if (req.query.searchName != ''){
        //     condition = condition + " AND last_name LIKE %'" +req.query.searchName+"'%"
        // }

        if (req.query.Status != ''){
            condition = condition +" AND active_status = '" +req.query.Status+"'"
        }
        var query = "SELECT * FROM public.tbl_buyer_details where buyer_emailid IS NOT NULL" + condition;
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

	app.post('/add_buyer_input', function(req, res){
		// var role = 'Admin';
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
		
		var query = "SELECT * FROM public.tbl_buyer_details";
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

	app.get('/edit_buyer_input', async function(req, res){
		var query = "SELECT * FROM public.tbl_buyer_details where id = '"+req.query.id +"'";
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

	app.get('/buyer_input', async function(req, res){
		var query = "SELECT * FROM public.tbl_buyer_details where buyer_emailid = '"+req.query.email +"'";
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

	app.post('/delete_buyer_input', async function(req, res){
		var query = "DELETE FROM public.tbl_buyer_details where id = '"+req.body.id +"'";
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
}
