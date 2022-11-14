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
        var query = "SELECT first_name, last_name, buyer_emailid, dept_name, country_name,string_agg(stratbuyer_name,', ') stratbuyer_name FROM public.tbl_buyer_details where buyer_emailid IS NOT NULL" + condition + " group by first_name, last_name, buyer_emailid, dept_name, country_name";
		// var query="Select distinct first_name, last_name, buyer_emailid, dept_name, country_name"
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
