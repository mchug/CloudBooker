/* global $ */
/* global localStorage */
/* global Plotly */
/* global pdfMake */

var booker = booker || {};
((booker) => {

	let debug = localStorage.getItem('developer') === 'true';

	let formatDate = (d) => d.replace(/(\d+-\d+-\d+)T(\d+:\d+:\d+)\.\d+Z/g, '$1 $2');

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

	//
	// Core AJAX function
	//

	let ajax = (path, jsonData, method, callback) => {

		if (debug) {
			console.log('postAjax(path, jsonData, method, callback): called');
			console.log('path: ', path);
			console.log('jsonData: ', jsonData);
			console.log('method: ', method);
			console.log('callback: ', callback);
		}

		$.ajax({
			type: method,
			url: path,
			data: JSON.stringify(jsonData),
			contentType: 'application/json',
			success: (data, textStatus, jqXHR) => {
				if (debug) {
					console.log('postAjax(path, jsonData, method, callback): success');
					console.log('path: ', path);
					console.log('jsonData: ', jsonData);
					console.log('callback: ', callback);
					console.log('data: ', data);
					console.log('textStatus: ', textStatus);
					console.log('jqXHR: ', jqXHR);
				}
				callback(data, textStatus, jqXHR);
			},
			error: (jqXHR, textStatus, errorThrown) => {
				if (debug) {
					console.log('postAjax(path, jsonData, method, callback): error');
					console.log('path: ', path);
					console.log('jsonData: ', jsonData);
					console.log('callback: ', callback);
					console.log('jqXHR: ', jqXHR);
					console.log('textStatus: ', textStatus);
					console.log('errorThrown: ', errorThrown);
				}
			}
		});
	};

	//
	// Button handlers
	//

	let login = () => {
		let login = $('#login').val();
		let password = $('#password').val();
		let reqJson = {
			'login': login,
			'password': password
		};

		if (debug) {
			console.log('login(): called');
			console.log('reqJson: ', reqJson);
		}

		ajax('/login', reqJson, 'POST', (data) => {
			if (data.error) {
				console.log(data.errorInfo);
				alert(data.errorInfo.errorMsgLocalized);
			}
			else {
				console.log('complete');
				window.location.replace('/account');
			}
		});
	};

	let register = () => {
		let fullName = $('#fullName').val();
		let login = $('#login').val();
		let password = $('#password').val();
		let passwordAgain = $('#password-again').val();
		let reqJson = {
			'login': login,
			'fullName': fullName,
			'password': password
		};

		if (password !== passwordAgain) {
			return alert('Паролі не співпадають!');
		}

		if (debug) {
			console.log('register(): called');
			console.log('reqJson: ', reqJson);
		}

		ajax('/register', reqJson, 'POST', (data) => {
			if (data.error) {
				console.log(data.errorInfo);
				alert(data.errorInfo.errorMsgLocalized);
			}
			else {
				console.log('complete');
				alert('Обов\'язково запишіть ці цифри: ' + data.result.secret.join(' ') + '\nЗа допомогою них вы зможете відновити свій пароль!');
				window.location.replace('/login');
			}
		});
	};

	let restore = () => {
		let login = $('#login').val();
		let secret = $('#secret').val().split(' ').map(i => Number(i));
		let password = $('#password').val();
		let passwordAgain = $('#password-again').val();
		let reqJson = {
			'login': login,
			'secret': secret,
			'password': password
		};

		if (password !== passwordAgain) {
			return alert('Паролі не співпадають!');
		}

		if (debug) {
			console.log('restorePassword(): called');
			console.log('reqJson: ', reqJson);
		}

		ajax('/api/restore', reqJson, 'POST', (data) => {
			if (data.error) {
				alert(data.error);
			}
			else {
				alert('Пароль відновлено! Ваш новий секрет: ' + data.secret.join(' '));
				window.location.replace('/login');
			}
		});
	};

	//
	// Settings
	//

	let saveSettings = () => {

		let reqJson = {
			userInfoFields: {
				'fullName': $('#fullName').val(),
				'currency': parseInt($('#currency').val()),
				'balance': parseInt($('#balance').val()),
				'itemsAccount': parseInt($('#itemsAccount').val()),
				'itemsHistory': parseInt($('#itemsHistory').val()),
				'colorMain': $('#colorMain').val(),
				'colorBorder': $('#colorBorder').val(),
				'colorText': $('#colorText').val(),
				'colorExtra': $('#colorExtra').val()
			}
		};

		if (debug) {
			console.log('register(): called');
			console.log('reqJson: ', reqJson);
		}

		if (reqJson.userInfoFields.currency == '643') {
			if (!confirm('Ви впевнені що вам потрібно працювати з валютою сеператюг!?')) {
				return;
			}
		}

		ajax('/userInfo', reqJson, 'POST', (data) => {
			if (data.error) {
				console.log(data.errorInfo);
				alert(data.errorInfo.errorMsgLocalized);
			}
			else {
				console.log('complete');
				window.location.reload();
			}
		});
	};

	let restoreColors = () => {
		$('#colorMain').val('#f79420');
		$('#colorBorder').val('#fa7921');
		$('#colorText').val('#404040');
		$('#colorExtra').val('#aaaaaa');
	};

	//
	// Transactions
	//

	let createTrasaction = () => {

		let reqJson = {
			newTransObj: {
				'amount': parseInt($('#transModal #amount').val()),
				'datetime': new Date($('#transModal #datetime').val()),
				'description': $('#transModal #description').val(),
				'currency': $('#transModal #currency').val(),
				'convert': parseFloat($('#transModal #convert').val())
			}
		};

		if (debug) {
			console.log('register(): called');
			console.log('reqJson: ', reqJson);
		}

		ajax('/transaction', reqJson, 'PUT', (data) => {
			if (data.error) {
				console.log(data.errorInfo);
				alert(data.errorInfo.errorMsgLocalized);
			}
			else {
				console.log('complete');
				window.location.reload();
			}
		});
	};

	let suggestConvert = () => {
		let userCurrency = $("#transModal #currency").attr('data-userCurrency');
		let selectedCurrency = $("#transModal #currency option:selected").val();

		if (userCurrency == selectedCurrency) {
			$("#transModal #convert").val(1);
		}
		else {
			let userConvert = $("#transModal #currency option[value='" + userCurrency + "']").attr('data-convert');
			let selectedConvert = $("#transModal #currency option:selected").attr('data-convert');
			$("#transModal #convert").val(selectedConvert / userConvert);
		}
	};

	//
	// History
	//

	let loadHistoryCheked = () => {
		let savedList = localStorage.getItem('checkedList');
		let checkedList = JSON.parse(savedList);
		if (checkedList != null && checkedList.length > 0) {
			for (let c of checkedList) {
				$('.trans-check[value=' + c + ']').prop('checked', true);
			}
			$('.history-selected').removeClass('none');
			$('#selected-count').text(checkedList.length);
		}
	};

	let updateHistoryCheked = () => {
		let checkedList = $('.trans-check:checked').toArray().map(i => +(i.value));
		let savedList = JSON.parse(localStorage.getItem('checkedList'));
		if (savedList != null) {
			checkedList = [...new Set(checkedList.concat(savedList))];
		}
		localStorage.setItem('checkedList', JSON.stringify(checkedList));
		if (checkedList.length > 0) {
			$('.history-selected').removeClass('none');
			$('#selected-count').text(checkedList.length);
		}
		else {
			$('.history-selected').addClass('none');
		}
	};

	let createReport = () => {

		let savedList = localStorage.getItem('checkedList');
		let checkedList = JSON.parse(savedList);
		if (checkedList == null || checkedList.length == 0) {
			return alert('Проведіть перевибори транзакцій');
		}

		let reqJson = {
			newReportObj: {
				'title': $('#reportModal #title').val(),
				'date': new Date(),
				'transactions': checkedList,
			}
		};

		if (debug) {
			console.log('register(): called');
			console.log('reqJson: ', reqJson);
		}

		ajax('/report', reqJson, 'PUT', (data) => {
			if (data.error) {
				console.log(data.errorInfo);
				alert(data.errorInfo.errorMsgLocalized);
			}
			else {
				localStorage.setItem('checkedList', null);
				console.log('complete');
				alert('Новий звіт створено!');
				window.location.reload();
			}
		});
	};

	let deleteTrasactions = () => {
		let savedList = localStorage.getItem('checkedList');
		let checkedList = JSON.parse(savedList);
		if (checkedList == null || checkedList.length == 0) {
			return alert('Проведіть перевибори транзакцій');
		}
		
		let deleteTransById = (id, callback) => ajax('/transaction/' + id, {}, 'DELETE', callback);
		
		let count = 0;
		
		let deleteTransByIdCallback = (data) => {
			if (data.error) {
				console.log(data.errorInfo);
				return alert(data.errorInfo.errorMsgLocalized);
			}
			else {
				count++;
				if (count < checkedList.length) {
					deleteTransById(checkedList[count], deleteTransByIdCallback);
				}
				else {
					localStorage.setItem('checkedList', null);
					console.log('complete');
					alert('Всі транзакції успішно видалено!');
					window.location.reload();
				}
			}
		};
		
		deleteTransById(checkedList[count], deleteTransByIdCallback);
	};

	//
	// Reports
	//

	let renderReport = (e) => {

		let targetReport = e.currentTarget;

		if ($(targetReport).hasClass('active')) {
			return;
		}

		$('.report.active').removeClass('active');
		$(targetReport).addClass('active');
		let rowTemplate = '<tr><td>{t.id}</td><td>{t.amount}</td><td>{t.currency}</td><td class="date-cell">{t.date}</td><td>{t.balance}</td><td>{t.descr}</td></tr>';
		let reportTemplate = $('#report-body-template').html();

		let owner = $(targetReport).attr('data-owner');
		let date = $(targetReport).attr('data-date');
		let title = $(targetReport).attr('data-title');
		let transIds = $(targetReport).attr('data-transactions').split(',');

		let transactions = [];
		let pdfReport = {
			title: title,
			owner: owner,
			date: formatDate(date),
			total: transIds.length,
			table: []
		};

		let generatePlot = () => {

			let plotDiv = $('#plotDiv')[0];
			let plotImg = $('#report-body img')[0];
			let data = {
				x: [...transactions.map(t => t.date)],
				y: [...transactions.map(t => parseInt(t.balance))],
				mode: 'lines+markers',
				line: {
					color: '#888',
					width: 2
				},
				marker: {
					color: '#222',
					size: 6
				}
			};
			Plotly.newPlot(plotDiv, [data], {
				margin: {
					t: 0,
					r: 0,
					b: 30,
					l: 30
				}
			}).then((gd) => {
				let plotWidth = $(plotDiv).width();
				let plotHeight = $(plotDiv).height();
				Plotly.toImage(gd, {
					format: 'jpeg',
					height: plotHeight,
					width: plotWidth
				}).then((url) => {
					plotImg.src = url;
					pdfReport.image = url;
					currentReport = pdfReport;
				});
			});
		};

		let generateReport = () => {

			let table = '<tbody>';

			let getConvert = (t) => {
				let bLiteral = t.balance.substr(t.balance.indexOf(' ') + 1);
				let bConvert = currencyList.filter(c => c.literal == bLiteral)[0].convert;
				let tConvert = currencyList.filter(c => c.code == t.currency)[0].convert;
				console.log(tConvert / bConvert);
				return tConvert / bConvert;
			};

			let getLiteral = (code) => currencyList.filter(c => c.code == code)[0].literal;

			let minT = transactions.map(t => {t.value = t.amount * getConvert(t);return t}).reduce((a, b) => a.value < b.value ? a : b);
			let maxT = transactions.map(t => {t.value = t.amount * getConvert(t);return t}).reduce((a, b) => a.value > b.value ? a : b);
			let lastLiteral = transactions[0].balance.substr(transactions[0].balance.indexOf(' ') + 1);
			let avgT = transactions.map(t => t.amount * getConvert(t)).reduce((a, b) => a + b) / transactions.length;

			let minSum = minT.amount + ' ' + getLiteral(minT.currency);
			let maxSum = maxT.amount + ' ' + getLiteral(maxT.currency);
			let avgSum = Math.round(avgT * 100) / 100 + ' ' + lastLiteral;
			let total = transactions.length;

			let lastT = transactions[0];
			let firstT = transactions[transactions.length - 1];
			let avgDate = new Date((new Date(lastT.date) - new Date(firstT.date)) / (transactions.length - 1));
			
			let avgSeconds = avgDate / 1000;
			let avgMinutes = avgSeconds / 60; 
			let avgHours = avgMinutes / 60;
			let avgDays = avgHours / 24;
			
			let lastDate = formatDate(lastT.date);
			let firstDate = formatDate(firstT.date);
			let avgPeriod = Math.round(avgSeconds * 100) / 100 + ' секунд';
			
			if (avgMinutes > 1) {
				avgPeriod = Math.round(avgMinutes * 100) / 100 + ' хвилин';
			}
			if (avgHours > 1) {
				avgPeriod = Math.round(avgHours * 100) / 100 + ' годин';
			}
			if (avgDays > 1) {
				avgPeriod = Math.round(avgDays * 100) / 100 + ' днів';
			}
			
			let result = Math.round(transactions.map(t => t.amount * getConvert(t)).reduce((a, b) => a + b) * 100) / 100 + ' ' + lastLiteral;


			for (var t of transactions) {

				table += rowTemplate.replace('{t.id}', t.id)
					.replace('{t.amount}', t.amount)
					.replace('{t.currency}', getLiteral(t.currency))
					.replace('{t.date}', formatDate(t.date))
					.replace('{t.balance}', t.balance)
					.replace('{t.descr}', t.description);
			}

			let reportHtml = reportTemplate.replace('{r.owner}', owner)
				.replace('{r.title}', title)
				.replace('{r.date}', formatDate(date))
				.replace('{r.maxSum}', maxSum)
				.replace('{r.minSum}', minSum)
				.replace('{r.avgSum}', avgSum)
				.replace('{r.total}', total)
				.replace('{r.lastDate}', lastDate)
				.replace('{r.firstDate}', firstDate)
				.replace('{r.avgPeriod}', avgPeriod)
				.replace('{r.result}', result)
				.replace('<tbody>', table);

			$('#report-body').html(reportHtml);
			
			pdfReport.maxSum = maxSum;
			pdfReport.minSum = minSum;
			pdfReport.avgSum = avgSum;
			pdfReport.total = total;
			pdfReport.lastDate = lastDate;
			pdfReport.firstDate = firstDate;
			pdfReport.avgPeriod = avgPeriod;
			pdfReport.result = result;

			generatePlot();
		};

		let generateEmptyReport = () => {
			$('#report-body').html('<img src="./images/dont-worry.gif" style="display: block; margin: 40% auto 0 auto"></img><h1 class="text-center">Хтось видалив усе необхідне...</h1>');
		};

		let getTransById = (id, callback) => ajax('/transaction/' + id, null, 'GET', callback);

		let count = 0;

		let getTransByIdCallback = (data) => {
			if (data.error) {
				console.log(data.errorInfo);
				return alert(data.errorInfo.errorMsgLocalized);
			}
			else {
				transactions.push(data.result);
				count++;
				if (count < transIds.length) {
					getTransById(transIds[count], getTransByIdCallback);
				}
				else {
					transactions = transactions.filter(t => t != null);
					transactions.sort((a, b) => b.id - a.id);
					if (transactions.length > 0) {
						generateReport();
					} else {
						generateEmptyReport();
					}
				}
			}
		};

		setTimeout(() => getTransById(transIds[count], getTransByIdCallback), 1000);

		$('#report-body').html('<img src="./images/loading.gif" style="display: block; margin: 50% auto 0 auto"></img><h1 class="text-center">Звіт завантажується...</h1>');

	};

	let toggleZoom = () => {
		$('#report-page').toggleClass('paper-zoom');
	};

	let printReport = () => {
		createReportPdf(currentReport);
	};

	let createReportPdf = (report) => {

		if (debug) {
			console.log('booker.createReportPdf(report): called');
			console.log('report: ', report);
		}

		report.table.unshift(['Номер', 'Сума', 'Валюта', 'Дата', 'Баланс', 'Опиc']);
		let docScheme = {
			info: {
				title: report.title,
				author: 'CloudBooker',
				subject: 'Звіт',
				keywords: 'cloud booker report звіт'
			},
			// pageSize: { 595.28, 841.89 }
			// pageMargins: [40, 30],
			content: [{
				text: report.title,
				style: 'header'
			}, {
				margin: [0, 10, 0, 10],
				style: ['sub-header'],
				columns: [{
					text: [{
						text: 'Назва компанії:\n',
						style: 'bold'
					}, report.owner]
				}, {
					text: [{
						text: 'Дата\n',
						style: 'bold'
					}, report.date]
				}]
			}, {
				width: 500,
				image: report.image,
			}, {
				margin: [0, 10, 0, 10],
				style: ['p'],
				columns: [{
					text: [{
							text: 'Усього транзакій: ',
							style: 'bold'
						},
						report.total, {
							text: '\nСередня сума: ',
							style: 'bold'
						},
						report.avgSum, {
							text: '\nНайбільша: ',
							style: 'bold'
						},
						report.maxSum, {
							text: '\nНайменша: ',
							style: 'bold'
						},
						report.minSum
					]
				}, {
					text: [{
							text: 'Дата першої: ',
							style: 'bold'
						},
						report.firstDate, {
							text: '\nДата останьої: ',
							style: 'bold'
						},
						report.lastDate, {
							text: '\nСередній період: ',
							style: 'bold'
						},
						report.avgPeriod, {
							text: '\nВплив на баланс: ',
							style: 'bold'
						},
						report.result
					]
				}]
			}, {
				table: {
					headerRows: 1,
					widths: ['auto', 'auto', 'auto', 110, 'auto', '*'],
					body: report.table
				},
				layout: 'lightHorizontalLines'
			}, ],
			styles: {
				'header': {
					fontSize: 18,
					alignment: 'center'
				},
				'sub-header': {
					fontSize: 14
				},
				'bold': {
					bold: true
				},
				'p': {
					fontSize: 12,
					lineHeight: 1.2
				}
			}
		};

		pdfMake.createPdf(docScheme).open();

		if (debug) console.log('booker.createReportPdf(report): complete');
	};
	
	let currentReport = null;

	//
	// Init
	//

	$(() => {

		if (debug) {
			console.log('Debug mode is ON');
			console.log(localStorage);
			console.log('Init stars!');
		}

		// Login

		$('#login-btn').on('click', login);

		// Register

		$('#register-btn').on('click', register);

		// Restore

		$('#restore-btn').on('click', restore);

		// Settings

		$('#save-settings-btn').on('click', saveSettings);

		$('#restore-colors-btn').on('click', restoreColors);

		// Account

		$('#create-transaction-btn').on('click', createTrasaction);

		$('#transModal #currency').on('change', suggestConvert);
		
		// History
		
		// Already init
		//$('#create-transaction-btn').on('click', createTrasaction);
		
		$('#delete-transaction-btn').on('click', deleteTrasactions);
		
		$('.trans-check').on('change', updateHistoryCheked);

		$('#history-table').ready(loadHistoryCheked);

		$('#create-report-btn').on('click', createReport);
		
		// Report
		
		$('.report').on('click', renderReport);
		
		$('#zoom-report-btn').on('click', toggleZoom);

		$('#print-report-btn').on('click', printReport);

		if (debug) console.log('Init complete!');
	});

})(booker);
