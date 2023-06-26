const express = require('express')
const router = express.Router()
const { generators } = require('openid-client');
const code_verifier = generators.codeVerifier();
const code_challenge = generators.codeChallenge(code_verifier);
const { Issuer } = require('openid-client');
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
            // console.log(token.access_token)
            let user_details = token.claims();
            sql = "SELECT * FROM public.tbl_buyer_details where buyer_emailid = '"+ user_details.email.toLowerCase() +"' and active_status='active'";
            clientDB.query(sql, function(err, result) {
               
                if (err) {
                    // res.redirect(303, config.reactFrontend + '/auth?error=User not Exist');
                    res.send('<script>window.location.href="'+config.reactFrontend + '/auth?error=User not Exist'+'";</script>');
                } else{
                    if(result.rowCount == 0){
                    	// res.redirect(303, config.reactFrontend + '/auth?error=User not Exist');
                        res.send('<script>window.location.href="'+config.reactFrontend + '/auth?error=User not Exist' + '";</script>');
                    }else{
                        var role = result.rows[0].role_name ? result.rows[0].role_name : 'BUYER';
                        var frontend_redirect_url = config.reactFrontend + '/auth?token='+token.id_token+'&id='+user_details.metro_id+'&email='+user_details.email+'&type='+ role +'&country='+ result.rows[0].country_name +'&name=' + result.rows[0].first_name + ' ' + result.rows[0].last_name;
                        res.send('<script>window.location.href="'+frontend_redirect_url+'";</script>');
                    }				
                }	
            });
            
        }).catch( err => {
            console.log(err);
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