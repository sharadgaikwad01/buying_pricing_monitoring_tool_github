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
console.log(clientDB);

Issuer.discover('https://idam.metrosystems.net') // => Promise
  .then((idam) => {
    console.log('Discovered issuer %s %O', idam.issuer, idam.metadata);
    client = new idam.Client({
        client_id: 'BUYING_PRICING_MONITORING_TOOL',
        client_secret: 'wFq9MLAW4n',
        realm_id: 'BUY_PRI_M_T',
        redirect_uris: ['http://localhost:8080/api/v1/callback'],
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
    client.callback('http://localhost:8080/api/v1/callback', params, { code_verifier }) // => Promise
        .then(token => {
			let user_details = token.claims();
            console.log('received and validated tokens %j', token);
            console.log('validated ID Token claims %j', token.claims());
            var frontend_redirect_url = 'http://localhost:3000/auth?token='+token.id_token+'&id='+user_details.metro_id+'&email='+user_details.email+'&type=SUPPLIER&country=HUNGARY&vat=10886861-2-44'
            res.send('<script>window.location.href="'+frontend_redirect_url+'";</script>');
			//res.redirect(303, 'http://localhost:3000/auth?token='+token.id_token+'&id='+user_details.metro_id+'&email='+user_details.email+'&type=BUYER&country=hungary&vat=10886861-2-44');
            // sql = "SELECT * FROM public.tbl_users where email = '"+user_details.email +"'";
            // clientDB.query(sql, function(err, result) {
            //     if (err) {
            //         res.redirect(303, 'http://localhost:3000/auth?error=User not Exist')
            //     } else{
            //         if(result.rowCount == 0){
            //         	res.redirect(303, 'http://localhost:3000/auth?error=User not Exist');
            //         }else{
            //             res.redirect(303, //'http://localhost:3000/auth?token='+token.id_token+'&id='+user_details.metro_id+'&email='+user_details.email+'&type=SUPPLIER&country=HUNGERY&vat=10886861-2-44');
            //         }				
            //     }	
            // });
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
        scope: `openid realm_id=${'BUY_PRI_M_T'}`,
        code_challenge,
        code_challenge_method: 'S256',
    });
   
	// res.redirect(303, authUrl);
    res.send('<script>window.location.href="'+authUrl+'";</script>');
    next()
    
}) 

module.exports = router