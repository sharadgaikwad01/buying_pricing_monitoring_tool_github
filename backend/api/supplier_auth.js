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

Issuer.discover('https://idam-pp.metrosystems.net/') // => Promise
  .then((idam) => {
    console.log('Discovered issuer %s %O', idam.issuer, idam.metadata);
    client = new idam.Client({
        client_id: 'BUYING_PRICE_MONITORING_TOOL_S',
        client_secret: 'n3ln4fPSo6',
        realm_id: 'BUYING_PS',
        redirect_uris: [config.nodebackend + '/supplier/api/v2/callback'],
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
    client.callback(config.nodebackend+'/supplier/api/v2/callback', params, { code_verifier }) // => Promise
        .then(token => {
            console.log("token=====")
            console.log(token)

            console.log("token=====")
            console.log(token.claims())
            
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
        scope: `openid realm_id=${'BUYING_PS'}`,
        code_challenge,
        code_challenge_method: 'S256',
    });
    res.send('<script>window.location.href="'+authUrl+'";</script>');
    next()    
})

module.exports = router