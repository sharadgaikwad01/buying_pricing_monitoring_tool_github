const express = require('express')
const router = express.Router()
const { generators } = require('openid-client');
const code_verifier = generators.codeVerifier();
const code_challenge = generators.codeChallenge(code_verifier);
const { Issuer } = require('openid-client');

let client = undefined;
var token = '';

Issuer.discover('https://idam.metrosystems.net') // => Promise
  .then((idam) => {
    console.log('Discovered issuer %s %O', idam.issuer, idam.metadata);
    client = new idam.Client({
        client_id: 'BUYING_PRICING_MONITORING_TOOL',
        client_secret: 'wFq9MLAW4n',
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
			res.redirect(303, 'http://localhost:3000/auth?token='+token.id_token+'&id='+user_details.metro_id+'&email='+user_details.email+'&type=SUPPLIER&country=HUNGERY&vat=123')
        }).catch( err => {
            console.log(err);
        });
    next()
})

router.get('/api/v1/callback', (req, res, next) => {    
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
    res.redirect(303, authUrl)
    next()
}) 

module.exports = router