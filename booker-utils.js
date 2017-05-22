const bookerConfig = require('./booker-config');
const log4js = require('log4js');
const http = require('http');
const https = require('https');

let loggers = {};

// http://content.finance.ua/ru/xml/currency-cash
let currencyList = [{
  "code": "980",
  "literal": "UAH",
  "name": "Гривня",
  "convert": 1
}, {
  "code": "036",
  "literal": "AUD",
  "name": "Австралійський долар",
  "convert": 19.4
}, {
  "code": "764",
  "literal": "THB",
  "name": "Бат",
  "convert": 0.7350000000000001
}, {
  "code": "933",
  "literal": "BYN",
  "name": "Білоруський рубль",
  "convert": 13.8775
}, {
  "code": "975",
  "literal": "BGN",
  "name": "Болгарський лев",
  "convert": 12.25
}, {
  "code": "410",
  "literal": "KRW",
  "name": "Вона",
  "convert": 0.019
}, {
  "code": "344",
  "literal": "HKD",
  "name": "Гонконгівський долар",
  "convert": 3.075
}, {
  "code": "208",
  "literal": "DKK",
  "name": "Данська крона",
  "convert": 3.825
}, {
  "code": "840",
  "literal": "USD",
  "name": "Долар США",
  "convert": 26.25
}, {
  "code": "978",
  "literal": "EUR",
  "name": "Євро",
  "convert": 29.2
}, {
  "code": "818",
  "literal": "EGP",
  "name": "Єгипетський фунт",
  "convert": 1.355
}, {
  "code": "392",
  "literal": "JPY",
  "name": "Єна",
  "convert": 0.22749999999999998
}, {
  "code": "985",
  "literal": "PLN",
  "name": "Злотий",
  "convert": 6.825
}, {
  "code": "356",
  "literal": "INR",
  "name": "Індійська рупія",
  "convert": 0.355
}, {
  "code": "124",
  "literal": "CAD",
  "name": "Канадський долар",
  "convert": 19.35
}, {
  "code": "191",
  "literal": "HRK",
  "name": "Куна",
  "convert": 3.125
}, {
  "code": "484",
  "literal": "MXN",
  "name": "Мексиканське песо",
  "convert": 1.25
}, {
  "code": "498",
  "literal": "MDL",
  "name": "Молдовський лей",
  "convert": 1.2165
}, {
  "code": "376",
  "literal": "ILS",
  "name": "Новий ізраїльський шекель",
  "convert": 6.925
}, {
  "code": "554",
  "literal": "NZD",
  "name": "Новозеландський долар",
  "convert": 17.5775
}, {
  "code": "578",
  "literal": "NOK",
  "name": "Норвезька крона",
  "convert": 3.0025
}, {
  "code": "643",
  "literal": "RUB",
  "name": "Російський рубль",
  "convert": 0.4525
}, {
  "code": "946",
  "literal": "RON",
  "name": "Румунський лей",
  "convert": 6.199999999999999
}, {
  "code": "702",
  "literal": "SGD",
  "name": "Сінгапурський долар",
  "convert": 17.89
}, {
  "code": "398",
  "literal": "KZT",
  "name": "Теньге",
  "convert": 0.07250000000000001
}, {
  "code": "949",
  "literal": "TRY",
  "name": "Турецька ліра",
  "convert": 7.1
}, {
  "code": "348",
  "literal": "HUF",
  "name": "Форинт",
  "convert": 0.0945
}, {
  "code": "826",
  "literal": "GBP",
  "name": "Фунт стерлінгів",
  "convert": 33.8
}, {
  "code": "203",
  "literal": "CZK",
  "name": "Чеська крона",
  "convert": 1.0925
}, {
  "code": "752",
  "literal": "SEK",
  "name": "Шведська крона",
  "convert": 2.9
}, {
  "code": "756",
  "literal": "CHF",
  "name": "Швейцарський франк",
  "convert": 26.5
}, {
  "code": "156",
  "literal": "CNY",
  "name": "Юань Женьмiньбi",
  "convert": 3.7249999999999996
}];

let errorList = {
  'invalid-argument': {
    'errorCode': 100,
    'errorMsg': 'Invalid argument',
    'errorMsgLocalized': 'Недопустимий агрумент'
  },
  'invalid-token': {
    'errorCode': 101,
    'errorMsg': 'Invalid token',
    'errorMsgLocalized': 'Невірний ключ доступу'
  },
  'invalid-secret': {
    'errorCode': 102,
    'errorMsg': 'Invalid secret',
    'errorMsgLocalized': 'Невірний секрет'
  },
  'invalid-session': {
    'errorCode': 103,
    'errorMsg': 'Invalid session',
    'errorMsgLocalized': 'Пошкоджена сессія'
  },
  'internal-error': {
    'errorCode': 42,
    'errorMsg': 'Internal server error',
    'errorMsgLocalized': 'Помилка серверу'
  },
  'user-exists': {
    'errorCode': 200,
    'errorMsg': 'User with same login already exists',
    'errorMsgLocalized': 'Користувач з заданим логіном вже існує'
  },
  'user-not-found': {
    'errorCode': 201,
    'errorMsg': 'Can\'t find user with given login',
    'errorMsgLocalized': 'Такого користувача не існує'
  },
  'user-wrong-password': {
    'errorCode': 202,
    'errorMsg': 'Wrong password',
    'errorMsgLocalized': 'Неправильний пароль'
  }
};

exports.currencyList = currencyList;

exports.errorList = errorList;

exports.generateSecret = () => [0, 0, 0, 0].map(() => Math.floor(Math.random() * 100));

exports.getLogger = (name) => {

  if (loggers[name]) {
    return loggers[name];
  }

  log4js.addAppender(log4js.appenders.file(bookerConfig.logFolder + '/' + name + '.log'), name);

  loggers[name] = log4js.getLogger(name);

  return loggers[name];
};

exports.getError = (name) => {
  if (name === null || typeof(name) !== 'string' || errorList[name] === undefined) {
    return errorList['internal-error'];
  }
  return errorList[name];
};

exports.checkUser = (user) => new Promise((resolve, reject) => (user === null) ? reject('invalid-token') : resolve(user));

exports.httpGetJSON = (url) => new Promise((resolve, reject) => {

  let options = {
    host: url.substring(url.indexOf('://') + 3, url.indexOf('/', url.indexOf('://') + 3)),
    port: (url.indexOf('https://') != -1 ? 443 : 80),
    path: url.substr(url.indexOf('/', url.indexOf('://') + 3)),
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };

  let prot = options.port == 443 ? https : http;
  let req = prot.request(options, (res) => {
    let output = '';
    res.setEncoding('utf8');

    res.on('data', (chunk) => {
      output += chunk;
    });

    res.on('end', () => {
      resolve({
        statusCode: res.statusCode,
        data: JSON.parse(output)
      });
    });
  });

  req.on('error', (err) => reject(err));

  req.end();
});
