const express = require('express')
const router = express.Router()
const { generators } = require('openid-client');
const code_verifier = generators.codeVerifier();
const code_challenge = generators.codeChallenge(code_verifier);
const { Issuer } = require('openid-client');
const { Pool, Client } = require('pg');
const jwt_decode = require('jwt-decode');
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
console.log(clientDB);

Issuer.discover('https://idam-pp.metrosystems.net/') // => Promise
  .then((idam) => {
    console.log('Discovered issuer %s %O', idam.issuer, idam.metadata);
    client = new idam.Client({
        client_id: 'BUYING_PRICE_MONITORING_TOOL_S',
        client_secret: 'JALPBVzoVN',
        realm_id: 'SUPP_REALM',
        redirect_uris: [config.nodebackend + '/api/v1/callback'],
        response_types: ['code'],
    }); // => Client
}).catch( err => {
    console.warn(err);
});

router.use((req, res, next) => {
    console.log("LOG FROM MIDDLEWARE");
    if (req.query.code == undefined) {
        next()
        return
    }
    const params = client.callbackParams(req)
    client.callback(config.nodebackend+'/api/v1/callback', params, { code_verifier }) // => Promise
        .then(token => {
			let user_details = token.claims();
            console.log("======================= user details ====================== ");
            console.log(user_details);
            console.log(token);
            console.log(jwt_decode(token.access_token));
            console.log("======================= user details close ====================== ");
            sql = "SELECT * FROM public.tbl_buyer_details where buyer_emailid = '"+ user_details.email +"'";
            console.log(sql)
            clientDB.query(sql, function(err, result) {
                if (err) {
                    // res.redirect(303, config.reactFrontend + '/auth?error=User not Exist');
                    res.send('<script>window.location.href="'+config.reactFrontend + '/auth?error=User not Exist'+'";</script>');
                } else{
                    if(result.rowCount == 0){
                    	// res.redirect(303, config.reactFrontend + '/auth?error=User not Exist');
                        res.send('<script>window.location.href="'+config.reactFrontend + '/auth?error=User not Exist' + '";</script>');
                    }else{
                        console.log(user_details);
                        var frontend_redirect_url = config.reactFrontend + '/auth?token='+token.id_token+'&id='+user_details.metro_id+'&email='+user_details.email+'&type=BUYER&country='+ result.rows[0].country_name +'&name=' + result.rows[0].first_name + ' ' + result.rows[0].last_name;
                        res.send('<script>window.location.href="'+frontend_redirect_url+'";</script>');
                    }				
                }	
            });
        }).catch( err => {
            console.log(err);
        });
    next()
})

router.get('/api/v1/callback', (req, res, next) => {  
    // res.send("callback")  
})

router.get('/api/v1/login', (req, res, next) => {
    if (client == undefined) {
        res.send("Authorization provider is unavailable");
        next()
        return
    }
    authUrl = client.authorizationUrl({
        scope: `openid realm_id=${'SUPP_REALM'}`,
        code_challenge,
        realm_id: 'SUPP_REALM',
        code_challenge_method: 'S256',
    });
   
	// res.redirect(303, authUrl);
    res.send('<script>window.location.href="'+authUrl+'";</script>');
    next()
    
}) 

module.exports = router