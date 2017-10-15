# CloudBooker
====================ЗАДАЧА=====================

Нужно было бахнуть что-то типа персонального кошелька для контроля личных расходов, генерения отчетов и т.п.

===================СТРУКТУРА===================

/data - файлы монги
/frontend - вся статика
/views - все шаблоны для EJS
/logs - логи тут
mongod - скрипт для запуска монги
mongod-win.bat - тоже самое на винде
sever-win.bat - запуск сервака на винде
package.json - зависимости
booker-*.js - модули сервера

====================СЕРВАК=====================

booker-config.js - глобальная конфигурация, адреса БД (для данных и сессий), порт и хост сервера, глобальные настройки логера.

booker-db.js - прямая работа с базой данных, по сути прокси/интерфейс для остального кода. (database-layer)

booker-rest.js - реализация всех нужных функций, юзается в REST API и AJAX сайта. (нужен потому что на сайте авторизация по сессии, а на ресте через токен, во избежания дублирования кода)

booker-utils.js - почти все ебанутые функции и константы тут, во избежания дублирования кода. (но не удалось кстати...)

booker-server.js - главный герой, тут вся логика, все роуты, весь пиздец. 

=====================ФРОНТ=====================

/frontend/css - стили
/frontend/css/booker.css - наши стили
/frontend/fonts - глифы
/frontend/images - пикчи
/frontend/js - скрипты
/frontend/js/booker-frontend.js - логика фронта

/views/pages/account.ejs - аккаунт пользователя
/views/pages/settings.ejs - настройки пользователя
/views/pages/history.ejs - история пользователя
/views/pages/reports.ejs - отчеты пользователя

/views/pages/login.ejs - авторизация
/views/pages/register.ejs - регистрация
/views/pages/restore.ejs - вocтановить пароль

/views/pages/index.ejs - лендинг
/views/pages/api.ejs - дока по апихе
/views/pages/error404.ejs - нот фауст

/views/partials/head.ejs - шапка
/views/partials/navbar.ejs - навбар
/views/partials/footer.ejs - носки

p.s. каждый файл отличается филигранной версткой aka VityaDikiyPisos1488
