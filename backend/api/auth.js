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

Issuer.discover('https://idam.metrosystems.net/') // => Promise
  .then((idam) => {
    client = new idam.Client({
        client_id: 'BUYING_PRICING_MONITORING_TOOL_SUPPLIER',
        client_secret: 'YM2ArHMahE',
        realm_id: 'SUPP_REALM',
        country_code: 'IN',
        locale_id: 'en-IN',
        redirect_uris: [config.nodebackend + '/api/v1/callback'],
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
    client.callback(config.nodebackend+'/api/v1/callback', params, { code_verifier }) // => Promise
        .then(token => {
			var country;
            var salesLine;
            var supplierNumber = '';
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
                            console.log(value2);
                            if(key2 == 0){
                                country = value2.country[0];
                                salesLine = value2.salesLine[0];
                                supplierNumber = `'${value2.supplierNumber[0]}'`;
                            }else{
                                country = value2.country[0];
                                salesLine = value2.salesLine[0];
                                supplierNumber = supplierNumber + `,'${value2.supplierNumber[0]}'`;
                            }
                           
                        }
                    }
                }
            }

            sql = "select * from public.vw_suppl_info where suppl_no in ("+supplierNumber+") and country_code='"+country+"'";
            console.log("supplier login details")
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
        country_code: 'IN',
        locale_id: 'en-IN',
        code_challenge_method: 'S256',
    });
	// res.redirect(303, authUrl);
    res.send('<script>window.location.href="'+authUrl+'";</script>');
    next()
    
}) 
module.exports = router