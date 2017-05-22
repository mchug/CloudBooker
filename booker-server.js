//
// Booker files
//

const bookerConfig = require('./booker-config');
const bookerUtils = require('./booker-utils');
const bookerDb = require('./booker-db');
const bookerRest = require('./booker-rest');

//
// Dependencies
//

const path = require('path');
const log4js = require('log4js');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const compression = require('compression');
const helmet = require('helmet');

//
// Variables
//

const app = express();
const logger = bookerUtils.getLogger('server');
let server = null;

//
// Configuration
//

app.set('view engine', 'ejs');
app.set('port', bookerConfig.server.port);
app.set('host', bookerConfig.server.host);
app.use(bodyParser.json());
app.use(express.static(path.resolve(__dirname, 'frontend')));
app.use(compression());
app.use(session({
  secret: 'booker-aKjkprkrwf',
  resave: true,
  saveUninitialized: true,
  store: new MongoStore({ url: bookerConfig.dbConnectionUrl.sessionStorage })
}));
app.use(helmet());
app.use(log4js.connectLogger(bookerUtils.getLogger('server-express'), {
  level: log4js.levels.Warning
}));

//////////////////////////////////////////////
//           B O O K E R   S I T E          //
//////////////////////////////////////////////

//
// Not logined pages 
//

app.get('/api', (req, res) => {

  logger.info('/api: called');

  let renderPage = () => {
    res.render('pages/api', {
      head: {
        title: 'API'
      }
    });
  };

  return renderPage();

  // bookerUtils
  //   .httpGetJSON('http://resources.finance.ua/ua/public/currency-cash.json')
  //   .then((result) => res.send(result))
  //   .catch((err) => res.send(err));

});

app.get('/login', (req, res) => {

  logger.info('/login: called');

  let renderPage = () => {
    res.render('pages/login', {
      head: {
        title: 'Авторизація'
      }
    });
  };

  return renderPage();

});

app.get('/register', (req, res) => {

  logger.info('/register: called');

  let renderPage = () => {
    res.render('pages/register', {
      head: {
        title: 'Регістрація'
      }
    });
  };

  return renderPage();

});

app.get('/restore', (req, res) => {

  logger.info('/restore: called');

  let renderPage = () => {
    res.render('pages/restore', {
      head: {
        title: 'Відновлення паролю'
      }
    });
  };

  return renderPage();

});

app.get('/', (req, res) => {

  logger.info('/: called');

  let renderPage = () => {
    res.render('pages/index', {
      head: {
        title: 'CloudBooker',
        page: 'landing'
      }
    });
  };

  return renderPage();

});

app.get('/404', (req, res) => {

  logger.info('/404: called');

  let renderPage = () => {
    res.render('pages/error404', {
      head: {
        title: 'Не знайдено'
      }
    });
  };

  return renderPage();

});

//
// Logined pages
//

let redirectToLogin = (res) => res.redirect('/login');

app.get('/account', (req, res) => {

  logger.info('/account: called');

  let token = req.session.token || null;

  let renderPage = (u, t) => {
    res.render('pages/account', {
      head: {
        title: 'Персональний кабінет',
        logined: true,
        page: 'account'
      },
      currencyList: bookerUtils.currencyList,
      userInfo: u,
      transactions: t
    });
  };

  let filter = {
    'token': token
  };

  if (token === null) {
    return redirectToLogin(res);
  }

  bookerDb.api.getUser(filter)
    .then((user) => bookerUtils.checkUser(user)
      .then((user) => bookerDb.api.getUserInfo(user.login))
      .then((userInfo) => bookerDb.api.getTransactions(user.login, userInfo.itemsAccount)
        .then((transArray) => renderPage(userInfo, transArray))))
    .catch((err) => {
      logger.error('/account: ', err);
      redirectToLogin(res);
    });
});

app.get('/history', (req, res) => {

  logger.info('/history: called');

  let token = req.session.token || null;

  let parsePage = parseInt(req.query.page, 10);

  let cPage = parsePage > 0 ? parsePage : 1;

  let tPages = (t, i) => {
    if (t == 0) return 1;
    return (t % i === 0 ? t / i : Math.floor(t / i) + 1);
  };

  let renderPage = (u, t, tp) => {
    res.render('pages/history', {
      head: {
        title: 'Історія',
        logined: true,
        page: 'history'
      },
      currencyList: bookerUtils.currencyList,
      userInfo: u,
      transactions: t,
      //total: tt,
      pages: {
        total: tp,
        current: Math.min(cPage, tp)
      }
    });
  };

  let filter = {
    'token': token
  };

  if (token === null) {
    return redirectToLogin(res);
  }

  bookerDb.api.getUser(filter)
    .then((user) => bookerUtils.checkUser(user)
      .then((user) => bookerDb.api.getUserInfo(user.login))
      .then((u) => bookerDb.api.getTransactionsCount(user.login)
        .then((tt) => bookerDb.api.getTransactions(user.login, u.itemsHistory, u.itemsHistory * (Math.min(cPage, tPages(tt, u.itemsHistory)) - 1))
          .then((transArray) => renderPage(u, transArray, tPages(tt, u.itemsHistory))))))
    .catch((err) => {
      logger.error('/history: ', err);
      redirectToLogin(res);
    });
});

app.get('/reports', (req, res) => {

  logger.info('/reports: called');

  let token = req.session.token || null;

  let renderPage = (u, r) => {
    res.render('pages/reports', {
      head: {
        title: 'Звіти',
        logined: true,
        page: 'reports'
      },
      currencyList: bookerUtils.currencyList,
      userInfo: u,
      reports: r
    });
  };

  let filter = {
    'token': token
  };

  if (token === null) {
    return redirectToLogin(res);
  }

  bookerDb.api.getUser(filter)
    .then((user) => bookerUtils.checkUser(user)
      .then((user) => bookerDb.api.getUserInfo(user.login))
      .then((userInfo) => bookerDb.api.getReports(user.login)
        .then((reportArray) => renderPage(userInfo, reportArray))))
    .catch((err) => {
      logger.error('/reports: ', err);
      redirectToLogin(res);
    });
});

app.get('/settings', (req, res) => {

  logger.info('/settings: called');

  let token = req.session.token || null;

  let renderPage = (u) => {
    res.render('pages/settings', {
      head: {
        title: 'Налаштування',
        logined: true,
        page: 'settings'
      },
      currencyList: bookerUtils.currencyList,
      userInfo: u
    });
  };

  let filter = {
    'token': token
  };

  if (token === null) {
    return redirectToLogin(res);
  }

  bookerDb.api.getUser(filter)
    .then((user) => bookerUtils.checkUser(user)
      .then((user) => bookerDb.api.getUserInfo(user.login))
      .then((userInfo) => renderPage(userInfo)))
    .catch((err) => {
      logger.error('/settings: ', err);
      redirectToLogin(res);
    });

});

//////////////////////////////////////////////
//             R E S T   A P I              //
//////////////////////////////////////////////

//
// User functions
//
let sendError = (res, msg) => {
  return res.send({
    'error': true,
    'errorInfo': bookerUtils.getError(msg)
  });
};

let sendSuccess = (res, msg) => {
  return res.send({
    'success': true,
    'result': msg
  });
};

//
// Auth
//

// Create new user
app.post('/api/register', (req, res) => {

  logger.info('/api/register:POST: called');

  bookerRest.register(req.body.login, req.body.fullName, req.body.password)
    .then((result) => sendSuccess(res, result))
    .catch((err) => {
      logger.error('/api/register:POST: error ', err);
      sendError(res, err);
    });

});

// Login
app.post('/api/login', (req, res) => {

  logger.info('/api/login:POST: called');

  bookerRest.login(req.body.login, req.body.password)
    .then((result) => sendSuccess(res, result))
    .catch((err) => {
      logger.error('/api/login:POST: error ', err);
      sendError(res, err);
    });

});

// Restore password
app.post('/api/restore', (req, res) => {

  logger.info('/api/restore:POST: called');

  bookerRest.restore(req.body.login, req.body.secret, req.body.newPass)
    .then((result) => sendSuccess(res, result))
    .catch((err) => {
      logger.error('/api/login:POST: error ', err);
      sendError(res, err);
    });

});

//
// UserInfo
//

// Read user's info
app.get('/api/:token/userInfo', (req, res) => {

  logger.info('/api/:token/userInfo:GET: called');

  bookerRest.getUserInfo(req.params.token)
    .then((result) => sendSuccess(res, result))
    .catch((err) => {
      logger.error('/api/:token/userInfo:GET: error ', err);
      sendError(res, err);
    });

});

// Update user's info
app.post('/api/:token/userInfo', (req, res) => {

  logger.info('/api/:token/userInfo:POST: called');

  bookerRest.getUserInfo(req.params.token, req.body.userInfoFields)
    .then((result) => sendSuccess(res, result))
    .catch((err) => {
      logger.error('/api/:token/userInfo:POST: error ', err);
      sendError(res, err);
    });
});

//
// Transaction
//

// Read user's transactions
app.get('/api/:token/transactions/all', (req, res) => {

  logger.info('/api/:token/transactions:GET: called');

  bookerRest.getTransactions(req.params.token, req.query.limit, req.query.offset)
    .then((transArray) => sendSuccess(res, transArray))
    .catch((err) => {
      logger.error('/api/:token/transactions:GET: ', err);
      sendError(res, err);
    });

});

// Count user's transactions
app.get('/api/:token/transactions/count', (req, res) => {

  logger.info('/api/:token/transactions/count:GET: called');

  bookerRest.getTransactionsCount(req.params.token)
    .then((transCount) => sendSuccess(res, transCount))
    .catch((err) => {
      logger.error('/api/:token/transactions/count:GET: ', err);
      sendError(res, err);
    });

});

// Read user's transaction
app.get('/api/:token/transaction/:id', (req, res) => {

  logger.info('/api/:token/transaction/:id:GET: called');

  bookerRest.getTransaction(req.params.token, req.params.id)
    .then((transObj) => sendSuccess(res, transObj))
    .catch((err) => {
      logger.error('/api/:token/transaction/:id:GET: ', err);
      sendError(res, err);
    });
});

// Insert new user's transaction
app.put('/api/:token/transaction', (req, res) => {

  logger.info('/api/:token/transaction:PUT: called');

  bookerRest.insertTransaction(req.params.token, req.body.newTransObj)
    .then((transNew) => sendSuccess(res, transNew))
    .catch((err) => {
      logger.error('/api/:token/transaction:PUT: ', err);
      sendError(res, err);
    });
});

// Delete user's transaction
app.delete('/api/:token/transaction/:id', (req, res) => {

  logger.info('/api/:token/transaction/:id:DELETE: called');

  bookerRest.getTransaction(req.params.token, req.params.id)
    .then((transOld) => sendSuccess(res, transOld))
    .catch((err) => {
      logger.error('/api/:token/transaction/:id:DELETE: ', err);
      sendError(res, err);
    });
});

//
// Reports
//

// Read user's reports
app.get('/api/:token/reports/all', (req, res) => {

  logger.info('/api/:token/reports:GET: called');

  bookerRest.getReports(req.params.token, req.query.limit, req.query.offset)
    .then((reportArray) => sendSuccess(res, reportArray))
    .catch((err) => {
      logger.error('/api/:token/reports:GET: ', err);
      sendError(res, err);
    });

});

// Count user's reports
app.get('/api/:token/reports/count', (req, res) => {

  logger.info('/api/:token/reports/count:GET: called');

  bookerRest.getReportsCount(req.params.token, req.query.limit, req.query.offset)
    .then((reportCount) => sendSuccess(res, reportCount))
    .catch((err) => {
      logger.error('/api/:token/reports/count:GET: ', err);
      sendError(res, err);
    });

});

// Read user's report
app.get('/api/:token/report/:id', (req, res) => {

  logger.info('/api/:token/report/:id:GET: called');

  bookerRest.getReport(req.params.token, req.params.id)
    .then((reportObj) => sendSuccess(res, reportObj))
    .catch((err) => {
      logger.error('/api/:token/report/:id:GET: ', err);
      sendError(res, err);
    });
});

// Insert new user's report
app.put('/api/:token/report', (req, res) => {

  logger.info('/api/:token/report:PUT: called');

  bookerRest.insertReport(req.params.token, req.body.newTransObj)
    .then((reportNew) => sendSuccess(res, reportNew))
    .catch((err) => {
      logger.error('/api/:token/report:PUT: ', err);
      sendError(res, err);
    });
});

// Delete user's report
app.delete('/api/:token/report/:id', (req, res) => {

  logger.info('/api/:token/report/:id:DELETE: called');

  bookerRest.deleteReport(req.params.token, req.params.id)
    .then((reportOld) => sendSuccess(res, reportOld))
    .catch((err) => {
      logger.error('/api/:token/report/:id:DELETE: ', err);
      sendError(res, err);
    });
});

//
// Utils
//

// Read currency list
app.get('/api/const/list/currency', (req, res) => {

  logger.info('/api/const/list/currency:GET: called');
  sendSuccess(res, bookerUtils.currencyList);

});

// Get error list
app.get('/api/const/list/errors', (req, res) => {

  logger.info('/api/const/list/errors:GET: called');
  sendSuccess(res, bookerUtils.errorList);

});

// Renew user's token
app.get('/api/:token/renew/token', (req, res) => {
  
  logger.info('/api/:token/renew/token:GET: called');

  bookerRest.renewToken(req.params.token)
    .then((result) => sendSuccess(res, result))
    .catch((err) => {
      logger.error('/api/:token/renew/token:GET: error ', err);
      sendError(res, err);
    });
    
});

// Renew user's secret
app.get('/api/:token/renew/secret', (req, res) => {
  
  logger.info('/api/:token/renew/secret:GET: called');

  bookerRest.renewSecret(req.params.token)
    .then((result) => sendSuccess(res, result))
    .catch((err) => {
      logger.error('/api/:token/renew/secret:GET: error ', err);
      sendError(res, err);
    });
    
});

//////////////////////////////////////////////
//             S I T E   A J A X            //
//////////////////////////////////////////////

//
// Auth
//

// Create new user
app.post('/register', (req, res) => {

  logger.info('/register:POST: called');

  bookerRest.register(req.body.login, req.body.fullName, req.body.password)
    .then((result) => sendSuccess(res, result))
    .catch((err) => {
      logger.error('/register:POST: error ', err);
      sendError(res, err);
    });

});

// Login
app.post('/login', (req, res) => {

  logger.info('/login:POST: called');

  bookerRest.login(req.body.login, req.body.password)
    .then((result) => {
      req.session.token = result.token;
      sendSuccess(res, undefined);
    })
    .catch((err) => {
      logger.error('/login:POST: error ', err);
      sendError(res, err);
    });
});

// Restore password
app.post('/restore', (req, res) => {

  logger.info('/restore:POST: called');

  bookerRest.restore(req.body.login, req.body.secret, req.body.newPass)
    .then((result) => sendSuccess(res, result))
    .catch((err) => {
      logger.error('/login:POST: error ', err);
      sendError(res, err);
    });

});

// Clear user's session
app.get('/logout', (req, res) => {

  logger.info('/logout:GET: called');

  if (req.session.token !== undefined) {
    req.session.token = undefined;
  }
  
  res.redirect('/');
});

//
// Check session
//

app.all(['/userInfo', '/transaction*', '/report*', '/renew*'], (req, res, next) => {
  if (req.session.token === undefined) {
    return sendError(res, 'invalid-session');
  }
  next();
});

//
// Security 
//

// Renew user's token
app.get('/renew/token', (req, res) => {
  
  logger.info('/renew/token:GET: called');

  bookerRest.renewToken(req.session.token)
    .then((result) => {
      req.session.touch();
      req.session.token = result;
      return sendSuccess(res, result);
      })
    .catch((err) => {
      logger.error('/renew/token:GET: error ', err);
      sendError(res, err);
    });
    
});

// Renew user's secret
app.get('/renew/secret', (req, res) => {
  
  logger.info('/renew/secret:GET: called');

  bookerRest.renewSecret(req.session.token)
    .then((result) => sendSuccess(res, result))
    .catch((err) => {
      logger.error('/renew/secret:GET: error ', err);
      sendError(res, err);
    });
    
});


//
// UserInfo
//

// Read user's info
app.get('/userInfo', (req, res) => {

  logger.info('/userInfo:GET: called');

  bookerRest.getUserInfo(req.session.token)
    .then((result) => sendSuccess(res, result))
    .catch((err) => {
      logger.error('/userInfo:GET: error ', err);
      sendError(res, err);
    });

});

// Update user's info
app.post('/userInfo', (req, res) => {

  logger.info('/userInfo:POST: called');

  if (req.session.token === undefined) {
    return sendError(res, 'invalid-session');
  }

  logger.debug('req.body: ', req.body.userInfoFields);

  bookerRest.updateUserInfo(req.session.token, req.body.userInfoFields)
    .then((result) => sendSuccess(res, result))
    .catch((err) => {
      logger.error('/userInfo:POST: error ', err);
      sendError(res, err);
    });
});

//
// Transaction
//

// Read user's transactions
app.get('/transactions/all', (req, res) => {

  logger.info('/transactions:GET: called');

  bookerRest.getTransactions(req.session.token, req.query.limit, req.query.offset)
    .then((transArray) => sendSuccess(res, transArray))
    .catch((err) => {
      logger.error('/transactions:GET: ', err);
      sendError(res, err);
    });

});

// Count user's transactions
app.get('/transactions/count', (req, res) => {

  logger.info('/transactions/count:GET: called');

  bookerRest.getTransactionsCount(req.session.token)
    .then((transCount) => sendSuccess(res, transCount))
    .catch((err) => {
      logger.error('/transactions/count:GET: ', err);
      sendError(res, err);
    });

});

// Read user's transaction
app.get('/transaction/:id', (req, res) => {

  logger.info('/transaction/:id:GET: called');

  bookerRest.getTransaction(req.session.token, req.params.id)
    .then((transObj) => sendSuccess(res, transObj))
    .catch((err) => {
      logger.error('/transaction/:id:GET: ', err);
      sendError(res, err);
    });
});

// Insert new user's transaction
app.put('/transaction', (req, res) => {

  logger.info('/transaction:PUT: called');
  
  let newTransObj = req.body.newTransObj;
  
  let constructNewTrans = (t) => {
    return {
        'amount': t.amount,
        'date': t.datetime,
        'description': t.description,
        'currency': t.currency,
        'convert': t.convert
    };
  };

  bookerRest.insertTransaction(req.session.token, constructNewTrans(newTransObj))
    .then((transNew) => sendSuccess(res, transNew))
    .catch((err) => {
      logger.error('/transaction:PUT: ', err);
      sendError(res, err);
    });
});

// Delete user's transaction
app.delete('/transaction/:id', (req, res) => {

  logger.info('/transaction/:id:DELETE: called');

  bookerRest.deleteTransaction(req.session.token, req.params.id)
    .then((transOld) => sendSuccess(res, transOld))
    .catch((err) => {
      logger.error('/transaction/:id:DELETE: ', err);
      sendError(res, err);
    });
});

//
// Reports
//

// Read user's reports
app.get('/reports/all', (req, res) => {

  logger.info('/reports:GET: called');

  bookerRest.getReports(req.session.token, req.query.limit, req.query.offset)
    .then((reportArray) => sendSuccess(res, reportArray))
    .catch((err) => {
      logger.error('/reports:GET: ', err);
      sendError(res, err);
    });

});

// Count user's reports
app.get('/reports/count', (req, res) => {

  logger.info('/reports/count:GET: called');

  bookerRest.getReportsCount(req.session.token, req.query.limit, req.query.offset)
    .then((reportCount) => sendSuccess(res, reportCount))
    .catch((err) => {
      logger.error('/reports/count:GET: ', err);
      sendError(res, err);
    });

});

// Read user's report
app.get('/report/:id', (req, res) => {

  logger.info('/report/:id:GET: called');

  bookerRest.getReport(req.session.token, req.params.id)
    .then((reportObj) => sendSuccess(res, reportObj))
    .catch((err) => {
      logger.error('/report/:id:GET: ', err);
      sendError(res, err);
    });
});

// Insert new user's report
app.put('/report', (req, res) => {

  logger.info('/report:PUT: called');

  logger.debug(req.body);

  bookerRest.insertReport(req.session.token, req.body.newReportObj)
    .then((reportNew) => sendSuccess(res, reportNew))
    .catch((err) => {
      logger.error('/report:PUT: ', err);
      sendError(res, err);
    });
});

// Delete user's report
app.delete('/report/:id', (req, res) => {

  logger.info('/report/:id:DELETE: called');

  bookerRest.deleteReport(req.session.token, req.params.id)
    .then((reportOld) => sendSuccess(res, reportOld))
    .catch((err) => {
      logger.error('/report/:id:DELETE: ', err);
      sendError(res, err);
    });
});

/////////////////////////////
// 404 
/////////////////////////////

app.use(function(req, res, next) {
  res.status(404);

  // respond with html page
  if (req.accepts('html')) {
    return res.redirect('/404');
  }

  res.send({
    error: 'Not found'
  });
});



//
// Exit Handler
//

let closeServer = () => {
  server.close(() => {
    logger.info('Closed out remaining connections');
    bookerDb.close(() => {
      process.exit();
    });
  });

  setTimeout(() => {
    logger.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 30 * 1000);
};

process.on('SIGINT', closeServer);
process.on('SIGTERM', closeServer);

bookerDb.connect(bookerConfig.dbConnectionUrl.mongodb, (err) => {

  if (err) {
    logger.fatal('Fatal error at start: ', err);
    process.exit(1);
  }

  server = app.listen(app.get('port'), app.get('host'), () => {
    logger.info('CloudBooker server listening at', app.get('host'), ':', app.get('port'));
    logger.info('Press Ctrl + C to shutdown');
  });

});
