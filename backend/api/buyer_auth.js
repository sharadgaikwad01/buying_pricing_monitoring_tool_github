const express = require('express')
const router = express.Router()
const { generators } = require('openid-client');
const code_verifier = generators.codeVerifier();
const code_challenge = generators.codeChallenge(code_verifier);
const { Issuer } = require('openid-client');
const jwt_decode = require('jwt-decode');
const { Pool, Client } = require('pg');
var config = require('./../config');


let client = undefined;
var token = '';

const clientDB = new Client({
	user: config.db_user,
	host: config.db_host,
	database: config.db_name,
	password: config.db_password,
	port: config.db_port,
})
clientDB.connect();

Issuer.discover('https://idam.metrosystems.net/') // => Promise
  .then((idam) => {
    client = new idam.Client({
        client_id: 'BUYING_PRICING_MONITORING_TOOL',
        client_secret: 'GIQpfmJ6XY',
        realm_id: 'EMP_REALM',
        country_code: 'IN',
        locale_id: 'en-IN',
        redirect_uris: [config.nodebackend + '/buyer/api/v2/callback'],
        response_types: ['code'],
    }); // => Client
}).catch( err => {
    console.warn(err);
});

router.use((req, res, next) => {
    if (req.query.code == undefined) {
        next()
        return
    }
    const params = client.callbackParams(req)
    client.callback(config.nodebackend+'/buyer/api/v2/callback', params, { code_verifier }) // => Promise
        .then(token => {
            var country_code = '';
            var userGroup = '';
            var COMSCategory='';
            var user_details = jwt_decode(token.access_token);
           // console.log(token.access_token);
            // let user_details = token.claims();
			//console.log(user_details);
			// console.log(user_details1);

            for (const [key, value] of Object.entries(user_details.authorization)) {
                for (const [key1, value1] of Object.entries(value)) {
                    if(key1 == 'BPA_CAT_MANAGER' || key1 == 'BPA_ADMIN' || key1 == 'BPA_SUPERADMIN')
                    {   
                        // console.log(Object.entries(value1));                     
                        for (const [key2, value2] of Object.entries(value1)) {
                            // console.log(value2);
                            if(key2 == 0){
                                if(value2.country != '' && value2.country != 'undefined'){
                                    country_code = value2.country ? value2.country[0] : '';
                                }
                                if(value2.userGroup != '' && value2.userGroup != 'undefined'){
                                    userGroup = value2.userGroup ? value2.userGroup[0] : '';
                                }
                                // if(value2.COMSCategory){
                                //     COMSCategory = value2.COMSCategory ? value2.COMSCategory.toString() : '';
                                // }
                                // if(value2.category){
                                //     COMSCategory = value2.category ? value2.category.toString() : '';
                                // }
                            }else{
                                if(value2.country != '' && value2.country != 'undefined'){
                                    country_code = value2.country ? value2.country[0] : '';
                                }
                                if(value2.userGroup != '' && value2.userGroup != 'undefined'){
                                    userGroup = value2.userGroup ? value2.userGroup[0] : '';
                                }
                                // if(value2.COMSCategory){
                                //     COMSCategory = COMSCategory + `,'${value2.COMSCategory.toString()}'`;
                                // }
                                // if(value2.category){
                                //     COMSCategory = COMSCategory + `,'${value2.category.toString()}'`;
                                // }
                            }
                        }
                    }
                    
                }
            }
            // console.log(country_code);
            // console.log(userGroup);
            // console.log(COMSCategory);
            
            if(userGroup == 'CAT_MAN'){
                userGroup = 'BUYER';
            }

            var sql2 = "INSERT INTO tbl_users_log (country_name,email,comments) VALUES ('"+country_code+"','"+ user_details.email+"','"+ COMSCategory +"')";
            //console.log(sql2);
            clientDB.query(sql2, function (err, result) {
               // console.log(err)
                if (err) {
                    console.log("Create log failure. Please try again.");
                    res.json({ status: false });
                    return;
                }
            });

            var sql3 = "SELECT * FROM public.tbl_country_details where country_code = '"+ country_code +"' AND live_status='active'";
            clientDB.query(sql3, function(err3, result3) {
                // console.log(result3.rows)
                if (err3) {
                    console.log("Create log failure. Please try again.");
                    res.json({ status: false });
                    return;
                }else{
                    if(result3.rows){
                        country_code = result3.rows[0] ? result3.rows[0].country_name : '';
                    }
                }
            });

            // console.log(country_code);
            // console.log(userGroup);
            // console.log(COMSCategory);

            var sql = "SELECT * FROM public.tbl_buyer_details where buyer_emailid = '"+ user_details.email.toLowerCase() +"' and active_status='active'";
            clientDB.query(sql, function(err, result) {
                if (err) {
                    // res.redirect(303, config.reactFrontend + '/auth?error=User not Exist');
                    res.send('<script>window.location.href="'+config.reactFrontend + '/auth?error=User not Exist'+'";</script>');
                } else{
                    if(result.rowCount == 0){
                    	// res.redirect(303, config.reactFrontend + '/auth?error=User not Exist');
                        res.send('<script>window.location.href="'+config.reactFrontend + '/auth?error=User not Exist' + '";</script>');
                    }else{
                        var role = userGroup ? userGroup : 'BUYER';
                        country_code = country_code ? country_code : result.rows[0].country_name;
                        // console.log(country_code);
                        // var role = result.rows[0].role_name ? result.rows[0].role_name : 'BUYER';
                        var frontend_redirect_url = config.reactFrontend + '/auth?token='+token.id_token+'&id='+user_details.metro_id+'&email='+user_details.email+'&type='+ role +'&country='+ country_code +'&name=' + result.rows[0].first_name + ' ' + result.rows[0].last_name;
                        res.send('<script>window.location.href="'+frontend_redirect_url+'";</script>');
                    }				
                }	
            });
            
        }).catch( err => {
            console.log(err);
            res.send('<script>window.location.href="'+config.reactFrontend + '/auth?error=Server Error' + '";</script>');
        });
    next()
})

router.get('/api/v2/callback', (req, res, next) => {  
    //res.send("callback")  
})

router.get('/api/v2/login', (req, res, next) => {
    if (client == undefined) {
        res.send("Authorization provider is unavailable");
        next()
        return
    }
    authUrl = client.authorizationUrl({
        scope: `openid realm_id=${'EMP_REALM'}`,
        // scope: `openid clnt=${'BUYING_PRICING_MONITORING_TOOL'}`,
        code_challenge,
        realm_id: 'EMP_REALM',
        country_code: 'IN',
        locale_id: 'en-IN',
        code_challenge_method: 'S256',
    });
    res.send('<script>window.location.href="'+authUrl+'";</script>');
    next()    
})

module.exports = router