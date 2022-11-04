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
            // console.log('received and validated tokens %j', token);
            // console.log('validated ID Token claims %j', token.claims());
            console.log(user_details)

            // var frontend_redirect_url = config.reactFrontend + '/auth?token='+token.id_token+'&id='+user_details.metro_id+'&email='+user_details.email+'&type=BUYER&country=HUNGARY&vat=10886861-2-44&name='+user_details.name
            // res.send('<script>window.location.href="'+frontend_redirect_url+'";</script>');
			//res.redirect(303, config.reactFrontend + '/auth?token='+token.id_token+'&id='+user_details.metro_id+'&email='+user_details.email+'&type=BUYER&country=hungary&vat=10886861-2-44');

            sql = "SELECT * FROM public.tbl_buyer_details where buyer_emailid = '"+user_details.email +"'";
            clientDB.query(sql, function(err, result) {
                if (err) {
                    // res.redirect(303, config.reactFrontend + '/auth?error=User not Exist');
                    res.send('<script>window.location.href="'+config.reactFrontend + '/auth?error=User not Exist'+'";</script>');
                } else{
                    if(result.rowCount == 0){
                    	// res.redirect(303, config.reactFrontend + '/auth?error=User not Exist');
                        res.send('<script>window.location.href="'+config.reactFrontend + '/auth?error=User not Exist' + '";</script>');
                    }else{
                        console.log(result.rows)
                        console.log(result.rows[0].first_name)
                        console.log(result.rows[0].last_name)
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
        scope: `openid realm_id=${'BUY_PRI_M_T'}`,
        code_challenge,
        code_challenge_method: 'S256',
    });
   
	// res.redirect(303, authUrl);
    res.send('<script>window.location.href="'+authUrl+'";</script>');
    next()
    
}) 

module.exports = router