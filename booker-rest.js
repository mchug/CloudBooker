const bookerUtils = require('./booker-utils');
const bookerDb = require('./booker-db');
const passwordHash = require('password-hash');
const uuid = require('uuid');
const logger = bookerUtils.getLogger('rest');

// Login
exports.login = (login, password) => new Promise((resolve, reject) => {

  if (login === undefined || password === undefined) {
    return reject('invalid-argument');
  }

  let filter = {
    'login': login
  };

  let checkPassword = (user, password) => new Promise((resolve, reject) => {
    if (user == null) {
      return reject('user-not-found');
    }

    if (!passwordHash.verify(password, user.passHash)) {
      return reject('user-wrong-password');
    }

    resolve(user);
  });

  bookerDb.api
    .getUser(filter)
    .then((userFromDb) => checkPassword(userFromDb, password))
    .then((user) => resolve({
      'token': user.token
    }))
    .catch((err) => reject(err));
});

// Register new user
exports.register = (login, fullName, password) => new Promise((resolve, reject) => {

  if (fullName === undefined || password === undefined || login === undefined) {
    return reject('invalid-argument');
  }

  let constructUser = (userFromDb) => new Promise((resolve, reject) => {

    if (userFromDb != null) {
      return reject('user-exists');
    }

    let passHash = passwordHash.generate(password);
    let token = uuid();
    let secret = bookerUtils.generateSecret();

    let userObj = {
      'login': login,
      'passHash': passHash,
      'token': token,
      'secret': secret
    };

    resolve(userObj);
  });

  let constructUserInfo = () => new Promise((resolve, reject) => {

    let userInfoObj = {
      'owner': login,
      'fullName': fullName,
      'currency': 980,
      'balance': 0,
      'itemsAccount': 10,
      'itemsHistory': 10,
      'colorMain': '#f79420',
      'colorBorder': '#fa7921',
      'colorText': '#404040',
      'colorExtra': '#aaaaaa',
      'lastTransId': 1000,
      'lastReportId': 1000
    };

    resolve(userInfoObj);
  });

  let filter = {
    'login': login
  };

  bookerDb.api
    .getUser(filter)
    .then((userFromDb) => constructUser(userFromDb))
    .then((userObj) => bookerDb.api.insertUser(userObj)
      .then(() => logger.info('New user created: ', userObj))
      .then(() => constructUserInfo())
      .then((userInfoObj) => bookerDb.api.insertUserInfo(userInfoObj)
        .then(() => logger.info('New userInfo created: ', userInfoObj))
        .then(() => {
          resolve({
            'token': userObj.token,
            'secret': userObj.secret
          });
        })
      )
    )
    .catch((err) => reject(err));

});

// Restore password
exports.restore = (login, secret, newPass) => new Promise((resolve, reject) => {

  if (login === undefined || secret === undefined || newPass === undefined) {
    return reject('invalid-argument');
  }

  let newUserObj = {
    'passHash': passwordHash.generate(newPass),
    'token': uuid(),
    'secret': bookerUtils.generateSecret()
  };

  let checkSecret = (secret, user) => new Promise((resolve, reject) => {
    return secret == user.secret.join(' ') ? resolve(user) : reject('invalid-secret');
  });

  let filter = {
    'login': login
  };

  bookerDb.api
    .getUser(filter)
    .then((userFromDb) => checkSecret(secret, userFromDb))
    .then((user) => bookerDb.api.updateUser(user.login, newUserObj))
    .then((user) => resolve({
      'token': user.token,
      'secret': user.secret
    }))
    .catch((err) => reject(err));
});

// Renew Token
exports.renewToken = (token) => new Promise((resolve, reject) => {

  if (token === undefined) {
    return reject('invalid-argument');
  }

  let filter = {
    'token': token
  };

  let newToken = uuid();

  bookerDb.api
    .getUser(filter)
    .then((user) => bookerUtils.checkUser(user))
    .then((user) => bookerDb.api.updateUser(user.login, {
        'token': newToken
      })
      .then(() => resolve(newToken)))
    .catch((err) => reject(err));
});

// Renew Secret
exports.renewSecret = (token) => new Promise((resolve, reject) => {

  if (token === undefined) {
    return reject('invalid-argument');
  }

  let filter = {
    'token': token
  };

  let newSecret = bookerUtils.generateSecret();

  bookerDb.api
    .getUser(filter)
    .then((user) => bookerUtils.checkUser(user))
    .then((user) => bookerDb.api.updateUser(user.login, {
        'secret': newSecret
      })
      .then(() => resolve(newSecret)))
    .catch((err) => reject(err));
});

//
// UserInfo
//

// Read user's info
exports.getUserInfo = (token) => new Promise((resolve, reject) => {

  if (token === undefined) {
    return reject('invalid-argument');
  }

  let filter = {
    'token': token
  };

  bookerDb.api
    .getUser(filter)
    .then((user) => bookerUtils.checkUser(user))
    .then((user) => bookerDb.api.getUserInfo(user.login)
      .then((userInfo) => resolve(userInfo)))
    .catch((err) => reject(err));
});

// Update user's info
exports.updateUserInfo = (token, userInfoFields) => new Promise((resolve, reject) => {

  if (token === undefined) {
    return reject('invalid-argument');
  }

  let filter = {
    'token': token
  };

  bookerDb.api
    .getUser(filter)
    .then((user) => bookerUtils.checkUser(user))
    .then((user) => bookerDb.api.updateUserInfo(user.login, userInfoFields)
      .then((userInfo) => resolve(userInfo)))
    .catch((err) => reject(err));
});

//
// Transaction
//

// Read user's transactions
exports.getTransactions = (token, limit, offset) => new Promise((resolve, reject) => {

  logger.info('/api/:token/transactions:GET: called');

  if (token === undefined) {
    return reject('invalid-argument');
  }

  let filter = {
    'token': token
  };

  bookerDb.api
    .getUser(filter)
    .then((user) => bookerUtils.checkUser(user))
    .then((user) => bookerDb.api.getTransactions(user.login, limit, offset)
      .then((transArray) => resolve(transArray)))
    .catch((err) => reject(err));

});

// Count user's transactions
exports.getTransactionsCount = (token) => new Promise((resolve, reject) => {

  if (token === undefined) {
    return reject('invalid-argument');
  }

  let filter = {
    'token': token
  };

  bookerDb.api
    .getUser(filter)
    .then((user) => bookerUtils.checkUser(user))
    .then((user) => bookerDb.api.getTransactionsCount(user.login)
      .then((transCount) => resolve(transCount)))
    .catch((err) => reject(err));

});

// Read user's transaction
exports.getTransaction = (token, transId) => new Promise((resolve, reject) => {

  if (token === undefined || transId === undefined) {
    return reject('invalid-argument');
  }

  let filter = {
    'token': token
  };

  let constructTransFilter = (user) => ({
    'owner': user.login,
    'id': parseInt(transId)
  });

  bookerDb.api
    .getUser(filter)
    .then((user) => bookerUtils.checkUser(user))
    .then((user) => constructTransFilter(user))
    .then((transFilter) => bookerDb.api.getTransaction(transFilter)
      .then((transObj) => resolve(transObj)))
    .catch((err) => reject(err));
});

// Insert new user's transaction
exports.insertTransaction = (token, newTransObj) => new Promise((resolve, reject) => {

  if (token === undefined || newTransObj === undefined) {
    return reject('invalid-argument');
  }

  let filter = {
    'token': token
  };

  let constructNewTransaction = (t, u) => {
    t.owner = u.owner;
    t.id = (u.lastTransId + 1);
    let newBalance = Math.round(u.balance + (t.amount * t.convert));
    t.balance = newBalance + ' ' + bookerUtils.currencyList.filter((i) => i.code == u.currency)[0].literal;
    t.newBalance = newBalance;
    return t;
  };

  bookerDb.api
    .getUser(filter)
    .then((user) => bookerUtils.checkUser(user))
    .then((user) => bookerDb.api.getUserInfo(user.login))
    .then((userInfo) => constructNewTransaction(newTransObj, userInfo))
    .then((transNew) => bookerDb.api.insertTransaction(transNew)
      .then(() => bookerDb.api.updateUserInfo(transNew.owner, {
        'lastTransId': transNew.id,
        'balance': transNew.newBalance
      }))
      .then(() => resolve(transNew)))
    .catch((err) => reject(err));
});

// Delete user's transaction
exports.deleteTransaction = (token, transId) => new Promise((resolve, reject) => {

  if (token === undefined || transId === undefined) {
    return reject('invalid-argument');
  }

  let filter = {
    'token': token
  };

  let constructTransFilter = (user) => ({
    'owner': user.login,
    'id': parseInt(transId)
  });

  bookerDb.api
    .getUser(filter)
    .then((user) => bookerUtils.checkUser(user))
    .then((user) => constructTransFilter(user))
    .then((transFilter) => bookerDb.api.getTransaction(transFilter)
      .then((transOld) => bookerDb.api.removeTransaction(transFilter)
        .then(() => resolve(transOld))))
    .catch((err) => reject(err));
});

//
// Reports
//

// Read user's reports
exports.getReports = (token, limit, offset) => new Promise((resolve, reject) => {

  if (token === undefined) {
    return reject('invalid-argument');
  }

  let filter = {
    'token': token
  };

  bookerDb.api
    .getUser(filter)
    .then((user) => bookerUtils.checkUser(user))
    .then((user) => bookerDb.api.getReports(user.login, limit, offset)
      .then((reportArray) => resolve(reportArray)))
    .catch((err) => reject(err));

});

// Count user's reports
exports.getReportsCount = (token) => new Promise((resolve, reject) => {

  if (token === undefined) {
    return reject('invalid-argument');
  }

  let filter = {
    'token': token
  };

  bookerDb.api
    .getUser(filter)
    .then((user) => bookerUtils.checkUser(user))
    .then((user) => bookerDb.api.getReportsCount(user.login)
      .then((reportCount) => resolve(reportCount)))
    .catch((err) => reject(err));

});

// Read user's report
exports.getReport = (token, reportId) => new Promise((resolve, reject) => {

  if (token === undefined || reportId === undefined) {
    return reject('invalid-argument');
  }

  let filter = {
    'token': token
  };

  let constructReportFilter = (user) => ({
    'owner': user.login,
    'id': reportId
  });

  bookerDb.api
    .getUser(filter)
    .then((user) => bookerUtils.checkUser(user))
    .then((user) => constructReportFilter(user))
    .then((reportFilter) => bookerDb.api.getReport(reportFilter)
      .then((reportObj) => resolve(reportObj)))
    .catch((err) => reject(err));
});

// Insert new user's report
exports.insertReport = (token, newReportObj) => new Promise((resolve, reject) => {

  if (token === undefined || newReportObj === undefined) {
    return reject('invalid-argument');
  }

  let filter = {
    'token': token
  };

  let constructNewReport = (r, u) => {
    r.owner = u.owner;
    r.id = (u.lastReportId + 1);
    return r;
  };

  bookerDb.api
    .getUser(filter)
    .then((user) => bookerUtils.checkUser(user))
    .then((user) => bookerDb.api.getUserInfo(user.login))
    .then((userInfo) => constructNewReport(newReportObj, userInfo))
    .then((reportNew) => bookerDb.api.insertReport(reportNew)
      .then(() => bookerDb.api.updateUserInfo(reportNew.owner, {
        'lastTransId': reportNew.id
      }))
      .then(() => resolve(reportNew)))
    .catch((err) => reject(err));
});

// Delete user's report
exports.deleteReport = (token, reportId) => new Promise((resolve, reject) => {

  if (token === undefined || reportId === undefined) {
    return reject('invalid-argument');
  }

  let filter = {
    'token': token
  };

  let constructReportFilter = (user) => ({
    'owner': user.login,
    'id': reportId
  });

  bookerDb.api
    .getUser(filter)
    .then((user) => bookerUtils.checkUser(user))
    .then((user) => constructReportFilter(user))
    .then((reportFilter) => bookerDb.api.getReport(reportFilter)
      .then((reportOld) => bookerDb.api.removeReport(reportFilter)
        .then(() => resolve(reportOld))))
    .catch((err) => reject(err));
});
