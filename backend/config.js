require('dotenv').config();   //instatiate environment variables

let CONFIG = {}               //Make this global to use all over the application

CONFIG.port         = process.env.PORT  || '8080';

CONFIG.db_host      = process.env.DB_HOST       || '127.0.0.1';
CONFIG.db_port      = process.env.DB_PORT       || '5432';
CONFIG.db_name      = process.env.DB_NAME       || 'PSQL-BUYING_TOOL_DEV';
CONFIG.db_user      = process.env.DB_USER       || 'postgres';
CONFIG.db_password  = process.env.DB_PASSWORD   || 'metroservices1$';

//CONFIG.reactFrontend        = "http://10.16.148.59:80";
//CONFIG.nodebackend  = "http://10.16.148.59:81"; 

//CONFIG.reactFrontend        = 'https://bpmt.metro.de';
//CONFIG.nodebackend  = 'https://api-bpmt.metro.de';

CONFIG.reactFrontend        = 'https://bpmt.metro.de';
CONFIG.nodebackend  = 'https://api-bpmt.metro.de';

CONFIG.session_encryption  = process.env.SESSION_ENCRPTION || 'SECRET_2022';
CONFIG.session_expiration  = process.env.SESSION_EXPIRATION || 8 * 3600 * 1000;
CONFIG.Allow_Origin = process.env.Allow_Origin || '';
module.exports = CONFIG;
