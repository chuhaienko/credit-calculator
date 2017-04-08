'use strict';

const moment = require('moment');


let options = {
	startDate : moment(),
	amount    : 1000000,
	rate      : 10,
	months    : 60,
	monthPay  : 0
};
console.dir(getPayments(options), {depth: null});

function getPayments (options) {
	const amount       = options.amount;
	const startDate    = moment(options.startDate);
	const rate         = options.rate;
	const months       = options.months;
	const monthPay     = options.monthPay;
	const bodyPerMonth = round(amount / months);

	let bodyRest    = amount;
	let fromDate    = moment(startDate);
	let paymentDate = moment(startDate).add(1, 'month');

	let r = {
		payments: [],
		total: {
			body  : 0,
			credit: 0
		}
	};

	for (let i = 0; i < months && bodyRest > 0; i += 1) {
		let newBodyRest = bodyRest;

		let daysInYear   = 365 + (fromDate.isLeapYear() ? 1 : 0);
		let daysInPeriod = fromDate.daysInMonth();

		let creditPay   = round((newBodyRest * rate / 100) / daysInYear * daysInPeriod);
		let bodyPay     = Math.min(bodyPerMonth, newBodyRest);
		let requiredPay = creditPay + bodyPay;

		newBodyRest -= bodyPay;

		let additionalPay = 0;
		if (monthPay && monthPay > requiredPay) {
			additionalPay = monthPay - requiredPay;

			additionalPay = Math.min(additionalPay, newBodyRest);
		}

		bodyPay += additionalPay;
		newBodyRest -= additionalPay;

		r.payments.push({
			i: i + 1,
			from: fromDate.format('YYYY-MM-DD'),
			till: paymentDate.format('YYYY-MM-DD'),
			amount: bodyRest,
			pays: {
				body  : round(bodyPay),
				credit: round(creditPay),
				total : round(creditPay + bodyPay)
			}
		});
		r.total.body   += bodyPay;
		r.total.credit += creditPay;

		bodyRest    = round(newBodyRest);
		fromDate    = moment(paymentDate);
		paymentDate = moment(fromDate).add(1, 'month');
	}

	return r;
}

function round (n) {
	return Math.round(n * 100) / 100;
}
