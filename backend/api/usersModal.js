const http = require('http');
var nodemailer = require('nodemailer');
//=========== MonthEnd API Module ===================
module.exports = function(app, con) {
    app.get('/users', async function(req, res){
		var data = {};
        // var query = "SELECT * FROM public.tbl_users where action_status='Open'" + condition;

		var condition  = '';

        if (req.query.searchName != ''){
            condition = condition + " AND name LIKE '%" +req.query.searchName+"%'"
        }

        if (req.query.UserType != ''){
            condition = condition +" AND user_type = '" +req.query.UserType+"'"
        }

        if (req.query.searchRole != ''){
            condition = condition + " AND user_role = '" +req.query.searchRole+"'"
        }
        var query = "SELECT * FROM public.tbl_users where email IS NOT NULL" + condition;
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

	app.post('/add_user_input', function(req, res){
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
		
		var query = "SELECT * FROM public.tbl_users";
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

	app.get('/edit_user_input', async function(req, res){
		var query = "SELECT * FROM public.tbl_users where id = '"+req.query.id +"'";
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

	app.get('/user_input', async function(req, res){
		var query = "SELECT * FROM public.tbl_users where email = '"+req.query.email +"'";
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

	app.post('/delete_user_input', async function(req, res){
		var query = "DELETE FROM public.tbl_users where id = '"+req.body.id +"'";
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
