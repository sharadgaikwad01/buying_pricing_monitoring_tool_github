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
			var country;
            var salesLine;
            var supplierNumber;
            var vatNumber;
            var supplierName;
            var country_name;
            var user_details = jwt_decode(token.access_token);
            console.log(user_details);
            for (const [key, value] of Object.entries(user_details.authorization)) {
                for (const [key1, value1] of Object.entries(value)) {
                    if(key1 == 'BPMT_SUPPLIER')
                    {
                        for (const [key2, value2] of Object.entries(value1)) {
                            country = value2.country[0];
                            salesLine = value2.salesLine[0];
                            supplierNumber = value2.supplierNumber[0];
                        }
                    }
                }
            }
            supplierNumber = 21172;
            country = 'ES';
            sql = "select * from public.vw_suppl_info where suppl_no='"+supplierNumber+"' and country_code='"+country+"'";
            clientDB.query(sql, function(err, result) {                
                if (err) {
                    // res.redirect(303, config.reactFrontend + '/auth?error=User not Exist');
                    res.send('<script>window.location.href="'+config.reactFrontend + '/auth?error=User not Exist'+'";</script>');
                } else{
                    if(result.rowCount == 0){
                        // res.redirect(303, config.reactFrontend + '/auth?error=User not Exist');
                        res.send('<script>window.location.href="'+config.reactFrontend + '/auth?error=User not Exist' + '";</script>');
                    }else{
                        supplierName = result.rows[0].suppl_name;
                        vatNumber = result.rows[0].vat_no;
                        country_name = result.rows[0].country_name;
                        var frontend_redirect_url = config.reactFrontend + '/auth?token='+token.id_token+'&id='+user_details.metro_id+'&email='+user_details.email+'&type=SUPPLIER&country='+ country_name +'&vat='+vatNumber+'&name=' + supplierName ;
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

function getVATNumberBySupplierIDandCountry(country, supplier_id) {

}

module.exports = router