//
// Booker Database module
//

//////////////////////////////////
// Booker data model
//
// User: 
// {
//   'login': string, 
//   'passHash': string,
//   'token': string,
//   'secret': array of numbers
// }
//
// UserInfo: 
// {
//   'owner': string, 
//   'fullName': string, 
//   'currency': number,
//   'balance': number,
//   'itemsAccount': number,
//   'itemsHistory': number,
//   'colorMain': string,
//   'colorBorder': string,
//   'colorText': string,
//   'colorExtra': string,
//   'lastTransId': number,
//   'lastReportId': number
// }
//
// Transaction: 
// {
//   'owner': string,
//   'id': number,
//   'amount': number,
//   'currency': number,
//   'date': date,
//   'balance': number,
//   'description': string
// }
//
// Report: 
// {
//   'owner': string, 
//   'id': number,
//   'title': string,
//   'date': date,
//   'transactions': array of number
// }
//
/////////////////////////////////

const bookerUtils = require('./booker-utils');
const MongoClient = require('mongodb').MongoClient;
const logger = bookerUtils.getLogger('db');


let state = {
    db: null,
};

let users = null;
let usersInfo = null;
let transactions = null;
let reports = null;

let api = {};

//
// User
// 
api.getUser = (queryWanted) => {

    logger.debug('getUser(): called');
    let startTime = new Date();

    return new Promise((resolve, reject) => {

        if (queryWanted == null) {
            logger.error('Invalid argument: queryWanted ', queryWanted);
            return reject();
        }

        let login = queryWanted.login || null;
        let token = queryWanted.token || null;

        let filter = {};

        if (login != null) {
            filter.login = login;
        }
        else if (token != null) {
            filter.token = token;
        }

        if (filter == {}) {
            logger.error('Invalid argument: queryWanted ', queryWanted);
            return reject();
        }

        users.findOne(filter).then((item) => {
            logger.debug('getUser(): finished in ' + ((new Date()) - startTime) + 'ms');
            resolve(item);
        }).catch((err) => {
            logger.error('getUser(): error ', err);
            reject(err);
        });
    });
};

api.insertUser = (newUser) => {

    logger.debug('insertUser(): called');
    let startTime = new Date();

    return new Promise((resolve, reject) => {

        if (newUser == null) {
            logger.error('Invalid argument: newUser ', newUser);
            return reject();
        }

        let requiredFields = [
            'login',
            'passHash',
            'token',
            'secret'
        ];

        let newMongoItem = {};

        for (var i of requiredFields) {
            if (!newUser[i]) {
                logger.error('Invalid argument: newUser ', newUser);
                return reject();
            }
            newMongoItem[i] = newUser[i];
        }

        users.insertOne(newMongoItem).then((result) => {
            logger.debug('insertUser(): finished in ' + ((new Date()) - startTime) + 'ms');
            resolve(result);
        }).catch((err) => {
            logger.error('insertUser(): error ', err);
            reject(err);
        });
    });
};

api.updateUser = (login, fieldsWanted) => {

    logger.info('updateUser(): called');
    let startTime = new Date();

    return new Promise((resolve, reject) => {

        if (login == null || typeof(login) !== 'string') {
            logger.error('Invalid argument: login ', login);
            return reject();
        }

        let validFields = [
            'passHash',
            'token',
            'secret'
        ];

        let updateFields = {};

        for (var i of validFields) {
            if (fieldsWanted[i]) {
                updateFields[i] = fieldsWanted[i];
            }
        }

        if (updateFields == {}) {
            logger.error('Invalid argument: fieldsWanted ', fieldsWanted);
            return reject();
        }

        let filter = {
            'login': login
        };

        let action = {
            $set: updateFields
        };

        users.findOneAndUpdate(filter, action).then((result) => {
            logger.debug('updateUser(): finished in ' + ((new Date()) - startTime) + 'ms');
            resolve(result);
        }).catch((err) => {
            logger.error('updateUser(): error ', err);
            reject(err);
        });
    });
};

//
// UserInfo
//
api.getUserInfo = (owner) => {

    logger.info('getUserInfo(): called');
    let startTime = new Date();

    return new Promise((resolve, reject) => {

        if (owner == null || typeof(owner) !== 'string') {
            logger.error('Invalid argument: owner ', owner);
            return reject();
        }

        let filter = {
            'owner': owner
        };

        usersInfo.findOne(filter).then((item) => {
            logger.debug('getUserInfo(): finished in ' + ((new Date()) - startTime) + 'ms');
            resolve(item);
        }).catch((err) => {
            logger.error('getUserInfo(): error ', err);
            reject(err);
        });
    });
};

api.insertUserInfo = (newUserInfo) => {

    logger.info('insertUserInfo(): called');
    let startTime = new Date();

    return new Promise((resolve, reject) => {

        if (newUserInfo == null || newUserInfo == {}) {
            logger.error('Invalid argument: newUserInfo ', newUserInfo);
            return reject();
        }

        let requiredFields = [
            'owner',
            'fullName',
            'currency',
            'balance',
            'itemsAccount',
            'itemsHistory',
            'colorMain',
            'colorBorder',
            'colorText',
            'colorExtra',
            'lastTransId',
            'lastReportId'
        ];

        let newMongoItem = {};

        for (var i of requiredFields) {
            if (newUserInfo[i] === undefined) {
                logger.error('Invalid argument: newUserInfo ', newUserInfo);
                return reject();
            }
            newMongoItem[i] = newUserInfo[i];
        }

        usersInfo.insertOne(newMongoItem).then((result) => {
            logger.debug('insertUserInfo(): finished in ' + ((new Date()) - startTime) + 'ms');
            resolve(result);
        }).catch((err) => {
            logger.error('insertUserInfo(): error ', err);
            reject(err);
        });
    });
};

api.updateUserInfo = (owner, fieldsWanted) => {

    logger.info('updateUserInfo(): called');
    let startTime = new Date();

    return new Promise((resolve, reject) => {

        if (owner == null || typeof(owner) !== 'string') {
            logger.error('Invalid argument: owner ', owner);
            return reject();
        }

        let validFields = [
            'fullName',
            'currency',
            'balance',
            'itemsAccount',
            'itemsHistory',
            'colorMain',
            'colorBorder',
            'colorText',
            'colorExtra',
            'lastTransId',
            'lastReportId'
        ];

        let updateFields = {};

        for (var i of validFields) {
            if (fieldsWanted[i]) {
                updateFields[i] = fieldsWanted[i];
            }
        }

        if (updateFields == {}) {
            logger.error('Invalid argument: fieldsWanted ', fieldsWanted);
            return reject();
        }
        
        logger.debug('fieldsWanted: ', fieldsWanted);
        logger.debug('updateFields: ', updateFields);

        let filter = {
            'owner': owner
        };

        let action = {
            $set: updateFields
        };

        usersInfo.findOneAndUpdate(filter, action).then((result) => {
            logger.debug('updateUserInfo(): finished in ' + ((new Date()) - startTime) + 'ms');
            resolve(result);
        }).catch((err) => {
            logger.error('updateUserInfo(): error ', err);
            reject(err);
        });
    });
};

//
// Transaction
//

api.getTransactionsCount = (owner) => {

    logger.info('getTransactionsCount(): called');
    let startTime = new Date();

    return new Promise((resolve, reject) => {

        if (owner == null || typeof(owner) !== 'string') {
            logger.error('Invalid argument: owner ', owner);
            return reject();
        }

        let filter = {
            'owner': owner
        };

        transactions.find(filter).count().then((count) => {
            logger.debug('getTransactionsCount(): finished in ' + ((new Date()) - startTime) + 'ms');
            resolve(count);
        }).catch((err) => {
            logger.error('getTransactionsCount(): error ', err);
            reject(err);
        });
    });
};

api.getTransactions = (owner, limit = 0, skip = 0) => {

    logger.info('getTransactions(): called');
    logger.debug('owner: ', owner, ' limit: ', limit, ' skip: ', skip);
    let startTime = new Date();

    return new Promise((resolve, reject) => {

        if (owner == null || typeof(owner) !== 'string') {
            logger.error('Invalid argument: owner ', owner);
            return reject();
        }

        let filter = {
            'owner': owner
        };

        transactions.find(filter).sort({'id': -1}).skip(skip).limit(limit).toArray((err, items) => {
            if (err) {
                logger.error('getTransactions(): error ', err);
                return reject(err);
            }
            logger.debug('getTransactions(): finished in ' + ((new Date()) - startTime) + 'ms');
            resolve(items);
        });
    });
};

api.getTransaction = (query) => {

    logger.info('getTransaction(): called');
    let startTime = new Date();

    return new Promise((resolve, reject) => {

        if (query == null) {
            logger.error('Invalid argument: query ', query);
            return reject();
        }

        let owner = query.owner || null;
        let id = query.id || null;

        if (owner == null || id == null) {
            logger.error('Invalid argument: query ', query);
            return reject;
        }
        
        let filter = {
            'owner': owner,
            'id': id
        };
        
        console.log(filter);

        transactions.findOne(filter).then((item) => {
            logger.debug('getTransaction(): finished in ' + ((new Date()) - startTime) + 'ms');
            resolve(item);
        }).catch((err) => {
            logger.error('getTransaction(): error ', err);
            reject(err);
        });
    });
};

api.insertTransaction = (newTransaction) => {

    logger.debug('insertTransaction(): called');
    let startTime = new Date();

    return new Promise((resolve, reject) => {

        if (newTransaction == null) {
            logger.error('Invalid argument: newTransaction ', newTransaction);
            return reject();
        }

        let requiredFields = [
            'owner',
            'id',
            'amount',
            'currency',
            'date',
            'balance',
            'description'
        ];

        let newMongoItem = {};

        for (var i of requiredFields) {
            if (newTransaction[i] === undefined) {
                logger.error('Invalid argument: newTransaction ', newTransaction);
                return reject();
            }
            newMongoItem[i] = newTransaction[i];
        }

        transactions.insertOne(newMongoItem).then((result) => {
            logger.debug('insertTransaction(): finished in ' + ((new Date()) - startTime) + 'ms');
            resolve(result);
        }).catch((err) => {
            logger.error('insertTransaction(): error ', err);
            reject(err);
        });
    });
};

api.removeTransaction = (query) => {

    logger.debug('removeTransaction(): called');
    let startTime = new Date();

    return new Promise((resolve, reject) => {

        if (query == null) {
            logger.error('Invalid argument: query ', query);
            return reject();
        }

        let owner = query.owner || null;
        let id = query.id || null;

        if (owner == null || id == null) {
            logger.error('Invalid argument: query ', query);
            return reject;
        }

        let filter = {
            'owner': owner,
            'id': id
        };

        transactions.findOneAndDelete(filter).then((result) => {
            logger.debug('removeTransaction(): finished in ' + ((new Date()) - startTime) + 'ms');
            resolve(result);
        }).catch((err) => {
            logger.error('removeTransaction(): error ', err);
            reject(err);
        });
    });
};

//
// Reports
//

api.getReportsCount = (owner) => {

    logger.info('getReportsCount(): called');
    let startTime = new Date();

    return new Promise((resolve, reject) => {

        if (owner == null || typeof(owner) !== 'string') {
            logger.error('Invalid argument: owner ', owner);
            return reject();
        }

        let filter = {
            'owner': owner
        };

        reports.find(filter).count().then((count) => {
            logger.debug('getReportsCount(): finished in ' + ((new Date()) - startTime) + 'ms');
            resolve(count);
        }).catch((err) => {
            logger.error('getReportsCount(): error ', err);
            reject(err);
        });
    });
};

api.getReports = (owner, limit = 0, skip = 0) => {

    logger.debug('getReports(): called');
    let startTime = new Date();

    return new Promise((resolve, reject) => {

        if (owner == null || typeof(owner) !== 'string') {
            logger.error('Invalid argument: owner ', owner);
            return reject();
        }

        let filter = {
            'owner': owner
        };

        reports.find(filter).sort({'id': -1}).skip(skip).limit(limit).toArray((err, items) => {
            if (err) {
                logger.error('getReports(): error ', err);
                return reject(err);
            }
            logger.debug('getReports(): finished in ' + ((new Date()) - startTime) + 'ms');
            resolve(items);
        });
    });
};

api.getReport = (query) => {

    logger.info('getReport(): called');
    let startTime = new Date();

    return new Promise((resolve, reject) => {

        if (query == null) {
            logger.error('Invalid argument: query ', query);
            return reject();
        }

        let owner = query.owner || null;
        let id = query.id || null;

        if (owner == null || id == null) {
            logger.error('Invalid argument: query ', query);
            return reject;
        }
        
        let filter = {
            'owner': owner,
            'id': id
        };

        reports.findOne(filter).then((item) => {
            logger.debug('getReport(): finished in ' + ((new Date()) - startTime) + 'ms');
            resolve(item);
        }).catch((err) => {
            logger.error('getReport(): error ', err);
            reject(err);
        });
    });
};

api.insertReport = (newReport) => {

    logger.debug('insertReport(): called');
    let startTime = new Date();

    return new Promise((resolve, reject) => {

        if (newReport == null) {
            logger.error('Invalid argument: newReport ', newReport);
            return reject();
        }

        let requiredFields = [
            'owner',
            'id',
            'title',
            'date',
            'transactions'
        ];

        let newMongoItem = {};

        for (var i of requiredFields) {
            if (!newReport[i]) {
                logger.error('Invalid argument: newReport ', newReport);
                return reject();
            }

            newMongoItem[i] = newReport[i];
        }

        reports.insertOne(newMongoItem).then((result) => {
            logger.debug('insertReport(): finished in ' + ((new Date()) - startTime) + 'ms');
            resolve(result);
        }).catch((err) => {
            logger.error('insertReport(): error ', err);
            reject(err);
        });
    });
};

api.removeReport = (query) => {

    logger.debug('removeReport(): called');
    let startTime = new Date();

    return new Promise((resolve, reject) => {

        if (query == null || query == {}) {
            logger.error('Invalid argument: query ', query);
            return reject();
        }

        let owner = query.owner || null;
        let id = query.id || null;

        if (owner == null || id == null) {
            logger.error('Invalid argument: query ', query);
            return reject();
        }

        let filter = {
            'owner': owner,
            'id': id
        };

        reports.findOneAndDelete(filter).then((result) => {
            logger.debug('removeReport(): finished in ' + ((new Date()) - startTime) + 'ms');
            resolve(result);
        }).catch((err) => {
            logger.error('removeReport(): error ', err);
            reject(err);
        });
    });
};

//
// Exports
//
exports.connect = (url, done) => {
    if (state.db) return done();

    MongoClient.connect(url, (err, db) => {
        if (err) return done(err);
        state.db = db;

        users = db.collection('users');
        usersInfo = db.collection('usersInfo');
        transactions = db.collection('transactions');
        reports = db.collection('reports');


        logger.info('CloudBooker database connected');
        logger.debug('MongoDB: ', url);

        done();
    });
};

exports.close = (done) => {
    if (state.db) {
        state.db.close((err, result) => {
            state.db = null;
            state.mode = null;

            logger.info('CloudBooker database connection closed');

            if (err) {
                logger.error(err);
            }

            done();
        });
    }
};

exports.api = api;
