//begin top_example
window.onload = function () {
	document.querySelector("#hello_phrase").innerHTML =
	  chrome.i18n.getMessage("hello");
	document.querySelector("#goodbye_phrase").innerHTML =
	  chrome.i18n.getMessage("goodbye");
}
//end

console.log('');
decimalNumbers();
console.log('');
currencyNumbers();
console.log('');
percentNumbers();
console.log('');

var lang = navigator.language;
console.log("User's language:", lang);

console.log("--- Numbers ---");

var num = new Number(1234.56);
console.log("Decimal format, user's language:", num.toLocaleString());
console.log("Decimal format, German:", num.toLocaleString("de"));

console.log("Currency format, pound sterling, user's language:",
  num.toLocaleString(lang, {style: "currency", currency: "GBP"}));
console.log("Currency format, pound sterling, German:",
  num.toLocaleString("de", {style: "currency", currency: "GBP"}));
console.log("Percent format, user's language:",
  num.toLocaleString(lang, {style: "percent"}));
console.log("Percent format, German:",
  num.toLocaleString("de", {style: "percent"}));

console.log("--- Dates ---");
var d = new Date("2014-06-12");
console.log("UTC time, YYYY-MM-DD:", d.toISOString());
d = new Date("2014-06-11T12:00:00-06:00");
console.log("UTC time, YYYY-MM-DD:", d.toISOString());
d = new Date(2014, 5, 12);
console.log("UTC time, YYYY-MM-DD:", d.toISOString());
console.log("local:", d.toLocaleString());
console.log("");
console.log("date1");
console.log("");
date1();
console.log("");
console.log("date2");
console.log("");
date2();
console.log("");
console.log("date3");
console.log("");
//begin getDateLocal_example
function getDateLocal(d) {
	return d.getFullYear() + "-" + (101 + d.getMonth()).toString().slice(-2) +
	  "-" + (100 + d.getDate()).toString().slice(-2);
}

var d = new Date("2014-06-12T12:00:00-00:00");
console.log("Local date, YYYY-MM-DD:", getDateLocal(d));
//end
console.log("");
console.log("date4");
console.log("");
//begin getDateLocalLongMonth_example
function getDateLocalLongMonth(d, lang) {
	if (!lang)
		lang = navigator.language;
	var month = d.toLocaleString(lang, {month: "long"});
	return d.getDate().toString() + "-" + month + "-" + d.getFullYear();
}

var d = new Date("2014-06-12T12:00:00-00:00");
console.log("Local date, DD-MMM-YYYY:", getDateLocalLongMonth(d));
console.log("Local date, German, DD-MMM-YYYY:", getDateLocalLongMonth(d, "de"));
//end
console.log("");
console.log("Local date, user's language:", d.toLocaleString(lang, {year: "numeric", day: "numeric", month: "numeric"}));
console.log("Local date, German:", d.toLocaleString("de", {year: "numeric", day: "numeric", month: "numeric"}));
console.log("");
console.log("Local date, user's language:", d.toLocaleString(lang, {weekday: "long", year: "numeric", month: "long", day: "numeric"}));
console.log("Local date, German:", d.toLocaleString("de", {weekday: "long", year: "numeric", month: "long", day: "numeric"}));
console.log("");

d = new Date("2014-06-12T23:59:59-05:00");
console.log("Local date, YYYY-MM-DD:", getDateLocal(d));
console.log("UTC time, YYYY-MM-DD:", d.toISOString());
console.log("UTC date, YYYY-MM-DD:", d.toISOString().slice(0, 10));

function date1() {
//begin date1_example
var d = new Date("2014-06-12");
console.log("Local time, user's language:", d.toLocaleString(lang));
console.log("Local time, German:", d.toLocaleString("de"));
//end
}

function date2() {
//begin date2_example
var d = new Date("2014-06-12T12:00:00-00:00");
var options1 = {
	year: "numeric",
	month: "long",
	day: "numeric"
};
console.log("Local date, user's language:", d.toLocaleString(lang, options1));
console.log("Local date, German:", d.toLocaleString("de", options1));
var options2 = {
	year: "numeric",
	month: "short",
	day: "numeric",
	hour: "2-digit",
	minute: "2-digit",
	second: "2-digit",
	timeZone: "America/Denver",
	timeZoneName: "short"
};
console.log("Local date, user's language:", d.toLocaleString(lang, options2));
console.log("Local date, German:", d.toLocaleString("de", options2));
//end
}

function percentNumbers() {
	var lang = navigator.language;
	var num = new Number(1234.56);
	console.log("Percent format, user's language:",
	  num.toLocaleString(lang, {style: "percent"}));
	console.log("Percent format, German:",
	  num.toLocaleString("de", {style: "percent"}));
}

function decimalNumbers() {
	var num = new Number(1234.56);
	console.log("Decimal format, user's language:", num.toLocaleString());
	console.log("Decimal format, German:", num.toLocaleString("de"));
}

function currencyNumbers() {
	var lang = navigator.language;
	var num = new Number(1234.56);
	console.log("Currency format, pound sterling, user's language:",
	  num.toLocaleString(lang, {style: "currency", currency: "GBP"}));
	console.log("Currency format, pound sterling, German:",
	  num.toLocaleString("de", {style: "currency", currency: "GBP"}));
}

function getAcceptLanguages_Example1() {
var rtn = chrome.i18n.getAcceptLanguages(function () {});
console.log(rtn);
// ... code that depends on languages
}

function getAcceptLanguages_Example2() {
chrome.i18n.getAcceptLanguages(
	function (languages) {
		console.log(languages);
	// ... code that depends on languages
	}
);
}

function getAcceptLanguages_Example3() {
	var languages = getAcceptLanguages_synchronous();
	console.log(languages);
}

function getAcceptLanguages_synchronous() { // won't work
	var languages;
	chrome.i18n.getAcceptLanguages(
		function (a) {
			languages = a;
		}
	);
	while (!languages)
		;
	return languages;
}

console.log("");
console.log("getAcceptLanguages_Example1");
console.log("");
getAcceptLanguages_Example1();
console.log("");
console.log("getAcceptLanguages_Example2");
console.log("");
getAcceptLanguages_Example2();
console.log("");
/* causes hang
console.log("getAcceptLanguages_Example3");
console.log("");
getAcceptLanguages_Example3();
console.log("");
*/
