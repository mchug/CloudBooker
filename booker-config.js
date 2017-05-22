const log4js = require('log4js');

log4js.loadAppender('file');
log4js.setGlobalLogLevel('debug');

exports.logFolder = 'logs';
exports.dbConnectionUrl = {
    mongodb: 'mongodb://localhost:27017/bookerdb',
    sessionStorage: 'mongodb://localhost:27017/bookersession'
};
exports.server = {
    port: process.env.PORT || 8080,
    host: process.env.IP || '0.0.0.0'
};