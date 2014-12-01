"use strict";

window.onload = function () {

ex3();

function ex1() {
//begin ex-1
var pdf = new jsPDF('l', 'pt', 'letter');
pdf.setFont('Times', 'Roman');
pdf.setFontSize(50);
pdf.text('Page One', 50, 200);
pdf.setLineWidth(3);
pdf.lines([[400, 400]], 20, 20);
pdf.addPage();
pdf.text('Page Two', 50, 200);
pdf.setLineWidth(3);
pdf.lines([[-390, 500]], 400, 20);
pdf.output('save');
//end
}

function ex2() {
var pdf = new jsPDF('l', 'pt', 'letter');
pdf.setFont('Times', 'Roman');
pdf.setFontSize(50);
pdf.text('Page One', 50, 200);
pdf.setLineWidth(3);
pdf.lines([[400, 400]], 20, 20);
pdf.addPage();
pdf.text('Page Two', 50, 200);
pdf.setLineWidth(3);
pdf.lines([[-390, 500]], 400, 20);
//begin ex-2
pdf.output('save',
	{
		callback: function (blob, entry) {
			chrome.fileSystem.getDisplayPath(entry,
				function callback(displayPath) {
					document.querySelector("body").
					  insertAdjacentHTML('beforeend',
					  '<p>Wrote PDF to ' + displayPath);
				}
			);
		}
	}
);
//end
}

function ex3() {
var pdf = new jsPDF('l', 'pt', 'letter');
pdf.setFont('Times', 'Roman');
pdf.setFontSize(50);
pdf.text('Page One', 50, 200);
pdf.setLineWidth(3);
pdf.lines([[400, 400]], 20, 20);
pdf.addPage();
pdf.text('Page Two', 50, 200);
pdf.setLineWidth(3);
pdf.lines([[-390, 500]], 400, 20);
//begin ex-3
pdf.output('save',
	{
		callback: function (blob, entry) {
			chrome.fileSystem.getDisplayPath(entry,
				function callback(displayPath) {
					document.querySelector("body").
					  insertAdjacentHTML('beforeend',
					  '<p>Wrote PDF to ' + displayPath);
					showPDF(blob);
				}
			);
		}
	}
);
	
function showPDF(blob) {
	var reader = new FileReader();
	reader.onload = function(event) {
		document.querySelector("body").
		  insertAdjacentHTML('beforeend',
		  'Click <a target="_blank" href="' + event.target.result +
		    '">here</a> to see it in a browser.');
		document.querySelector("body").
		  insertAdjacentHTML('beforeend',
		  '<p><webview src="' + event.target.result +
		    '" style="width:100%; height:700px;"></webview>');
	};
	reader.onerror = function(e) {
		console.log(e);
	};
	reader.readAsDataURL(blob);
}
//end
}


};
