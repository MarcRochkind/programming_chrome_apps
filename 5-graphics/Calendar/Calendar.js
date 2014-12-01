"use strict";
/*
	Download jsPDF
	Implement saveAs (see saveAs.js)
*/

var example = 'example1x';

window.onload = function () {

//begin OutputText
var calDiv = document.querySelector("#calendar");

var OutputText = (function () {
	var prevRow = -1;
	var para;

	var api = {
		cellWidth: 0,
		cellHeight: 0,

		start: function () {
			calDiv.style['font-family'] = 'monospace';
		},

		text: function (row, col, type, s, xOffset, yOffset) {
			if (type === 'weekday')
				s = s.substr(0, 2);
			else if (type === 'date' && s.length === 1)
				s = '&nbsp;' + s;
			if (row !== prevRow || col === 0) {
				para = document.createElement('p');
				para.style['margin-left'] = '10px';
				for (var i = 0; i < col; i++)
					para.insertAdjacentHTML('beforeend', '&nbsp;&nbsp;&nbsp;');
				calDiv.appendChild(para);
			}
			para.insertAdjacentHTML('beforeend', s + ' ');
			prevRow = row;
		},
		
		addPage: function () {
			calDiv.insertAdjacentHTML('beforeend', '<hr>');
		},
		
		pageWidth: function () {
			return 150;
		},
		
		line: function (x1, y1, x2, y2) {
		},

		getTextWidth: function (s, fontSize) {
			return 0;
		},
		
		write: function () {
		}
	};
	return api;
})();
//end

//begin OutputTable
var OutputTable = (function () {
	var sizeBig = 20;
	var sizeSmall = 14;
	var marginHorz = 36;
	var marginVert = 36;
	var prevRow = -1;
	var table, tr;

	var api = {
		cellWidth: 100,
		cellHeight: 80,
		margins: {
			top: marginVert,
			bottom: marginVert,
			left: marginHorz,
			right: marginHorz
		},

		start: function () {
			table = document.createElement('table');
			table.border = 0;
			table.cellPadding = 0;
			table.style['border-collapse'] = 'collapse';
			table.style['margin-left'] = this.margins.left + 'px';
			table.style['margin-bottom'] = this.margins.bottom + 'px';
			calDiv.appendChild(table);
		},

		text: function (row, col, type, s, xOffset, yOffset) {
			var that = this;

			if (type === 'weekday') {
				xOffset = (this.cellWidth - this.getTextWidth(s, 'small')) / 2;
				yOffset = output.cellHeight * .8;
			}
			if (row !== prevRow || col === 0) {
				if (prevRow > 0)
					while (tr.childNodes.length < 7)
						appendTd(tr, null, true);
				tr = document.createElement('tr');
				table.appendChild(tr);
				prevRow = row;
			}
			while (tr.childNodes.length < col)
				appendTd(tr, null, true);
			if (type === 'month')
				appendTd(tr, s, false, 7);
			else
				appendTd(tr, s, row > 0);
			
			function appendTd(tr, s, border, colSpan) {
				var td = document.createElement('td');
				td.width = that.cellWidth + 'px';
				td.height = that.cellHeight + 'px';
				if (colSpan) {
					td.colSpan = 7;
					td.style['text-align'] = type === 'month' ? 'center' : 'left';
					td.style['vertical-align'] = 'bottom';
				}
				else
					td.style['vertical-align'] = 'top';
				if (border)
					td.style.border = '1px solid black';
				if (s) {
					var p = document.createElement('p');
					p.style.fontFamily = 'Times';
					var fSize = type === 'weekday' ? sizeSmall : sizeBig;
					p.style.fontSize = fSize + 'px';
					p.style['margin-top'] = ((yOffset || 0) -
					  fSize * .6) + 'px'; // Move up to position at baseline.
					p.style['margin-left'] = (xOffset || 0) + 'px';
					p.style['margin-bottom'] = 0;
					p.style['margin-right'] = 0;
					p.innerText = s;
					td.appendChild(p);
				}
				tr.appendChild(td);
			}
		},
		
		addPage: function () {
		},
		
		pageWidth: function () {
			return this.margins.left + 7 * this.cellWidth + this.margins.right;
		},
		
		line: function (x1, y1, x2, y2) {
			// table has the lines
		},

		getTextWidth: function (s, fontSize) {
			return measureText(s,
			  fontSize === 'small' ? sizeSmall : sizeBig);
		},
		
		write: function () {
			for (var c = tr.childNodes.length; c < 7; c++)
				api.text(prevRow, c, 'date');
		}
	};
	return api;
})();
//end

//begin OutputHTML
var OutputHTML = (function () {
	var sizeBig = 20;
	var sizeSmall = 14;
	var marginHorz = 36;
	var marginTop = 36;

	var api = {
		cellWidth: 100,
		cellHeight: 80,
		pageOffset: marginTop,
		margins: {
			top: marginTop,
			bottom: 0,
			left: marginHorz,
			right: marginHorz
		},

		start: function () {
		},

		text: function (row, col, type, s, xOffset, yOffset) {
			if (type === 'weekday') {
				xOffset = (this.cellWidth - this.getTextWidth(s, 'small')) / 2;
				yOffset = output.cellHeight * .8;
			}
			var p = document.createElement('p');
			p.innerText = s;
			p.style.margin = 0;
			p.style.padding = 0;
			p.style.fontFamily = 'Times';
			var fSize = type === 'weekday' ? sizeSmall : sizeBig;
			p.style.fontSize = fSize + 'px';
			p.style.position = 'absolute';
			p.style.top = (this.pageOffset + row * this.cellHeight + yOffset -
			  fSize * .6) + 'px'; // Move up to position at baseline.
			p.style.left = (this.margins.left + col * this.cellWidth +
			  xOffset) + 'px';
			if (type === 'month')
				p.style.width = 7 * (this.cellWidth) + 'px';
			else
				p.style.width = this.cellWidth + 'px';
			p.style['text-align'] = type === 'month' ? 'center' : 'left';
			calDiv.appendChild(p);
		},
		
		addPage: function () {
			this.pageOffset += 8 * this.cellHeight;
		},
		
		pageWidth: function () {
			return this.margins.left + 7 * this.cellWidth + this.margins.right;
		},
		
		line: function (x1, y1, x2, y2) {
			var hr = document.createElement('hr');
			hr.setAttribute('noshade', true);
			hr.style.position = 'absolute';
			hr.style.top = (this.pageOffset + Math.min(y1, y2)) + 'px';
			hr.style.left = (this.margins.left + Math.min(x1, x2)) + 'px';
			if (x1 === x2) {
				hr.style.width = '.1px';
				hr.style.height = (Math.abs(y2 - y1) - 1) + 'px';
			}
			else {
				hr.style.width = (Math.abs(x2 - x1) - 1) + 'px';
				hr.style.height = '.1px';
			}
			calDiv.appendChild(hr);
		},

		getTextWidth: function (s, fontSize) {
			return measureText(s,
			  fontSize === 'small' ? sizeSmall : sizeBig);
		},
		
		write: function () {
		}
	};
	return api;
})();
//end

//begin OutputCanvas
var OutputCanvas = (function () {
	var sizeBig = 20;
	var sizeSmall = 14;
	var marginHorz = 36;
	var marginTop = 36;
	var canvas;
	var ctx;

	var api = {
		cellWidth: 100,
		cellHeight: 80,
		pageOffset: marginTop,
		margins: {
			top: marginTop,
			bottom: 0,
			left: marginHorz,
			right: marginHorz
		},

		start: function () {
			canvas = document.createElement('canvas');
			canvas.width = this.pageWidth();
			canvas.height = 12 * 8 * this.cellHeight;
			calDiv.appendChild(canvas);
			ctx = canvas.getContext('2d');
		},

		text: function (row, col, type, s, xOffset, yOffset) {
			var x, y;
			var fontSize = type === 'weekday' ? sizeSmall : sizeBig;

			if (type === 'weekday') {
				xOffset = (this.cellWidth - this.getTextWidth(s, 'small')) / 2;
				yOffset = output.cellHeight * .8;
			}
			ctx.font = fontSize + "px serif";
			if (type === 'month') {
				var titleWidth = this.getTextWidth(s, fontSize);
				x = (this.pageWidth() - titleWidth) / 2;
				y = this.pageOffset + yOffset;
			}
			else {
				x = this.margins.left + col * this.cellWidth + xOffset;
				y = this.pageOffset + row * this.cellHeight + yOffset;
			}
			ctx.fillText(s, x, y);
		},
		
		addPage: function () {
			this.pageOffset += 8 * this.cellHeight;
		},
		
		pageWidth: function () {
			return this.margins.left + 7 * this.cellWidth + this.margins.right;
		},
		
		line: function (x1, y1, x2, y2) {
			ctx.lineWidth = .5;
			ctx.beginPath();
			ctx.moveTo(this.margins.left + x1, this.pageOffset + y1);
			ctx.lineTo(this.margins.left + x2, this.pageOffset + y2);
			ctx.stroke();
		},

		getTextWidth: function (s, fontSize) {
			ctx.font = (fontSize === 'small' ? sizeSmall : sizeBig) + "px serif";
			return ctx.measureText(s).width;
		},
		
		write: function () {
		}
	};
	return api;

})();
//end

//begin OutputSVG
var OutputSVG = (function () {
	var sizeBig = 20;
	var sizeSmall = 14;
	var marginHorz = 36;
	var marginTop = 36;
	var svg;

	var api = {
		cellWidth: 100,
		cellHeight: 80,
		pageOffset: marginTop,
		margins: {
			top: marginTop,
			bottom: 0,
			left: marginHorz,
			right: marginHorz
		},

		start: function () {
			svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
			svg.setAttribute('width', this.pageWidth());
			svg.setAttribute('height', 12 * 8 * this.cellHeight);
			calDiv.appendChild(svg);
		},

		text: function (row, col, type, s, xOffset, yOffset) {
			var x, y;
			var fontSize = type === 'weekday' ? sizeSmall : sizeBig;

			if (type === 'weekday') {
				xOffset = (this.cellWidth - this.getTextWidth(s, 'small')) / 2;
				yOffset = output.cellHeight * .8;
			}
			if (type === 'month') {
				var titleWidth = this.getTextWidth(s, fontSize);
				x = (this.pageWidth() - titleWidth) / 2;
				y = this.pageOffset + yOffset;
			}
			else {
				x = this.margins.left + col * this.cellWidth + xOffset;
				y = this.pageOffset + row * this.cellHeight + yOffset;
			}
			var text = createSVGText(s, fontSize);
			text.setAttribute('x', x);
			text.setAttribute('y', y);
			svg.appendChild(text);
		},
		
		addPage: function () {
			this.pageOffset += 8 * this.cellHeight;
		},
		
		pageWidth: function () {
			return this.margins.left + 7 * this.cellWidth + this.margins.right;
		},
		
		line: function (x1, y1, x2, y2) {
			var line = document.createElementNS("http://www.w3.org/2000/svg",
			  "line");
			line.setAttribute('x1', this.margins.left + x1);
			line.setAttribute('y1', this.pageOffset + y1);
			line.setAttribute('x2', this.margins.left + x2);
			line.setAttribute('y2', this.pageOffset + y2);
			line.setAttribute('stroke', 'black');
			line.setAttribute('stroke-width', .5);
			svg.appendChild(line);
		},

		getTextWidth: function (s, fontSize) {
			var text = createSVGText(s, fontSize);
			svg.appendChild(text);
			var w = text.getComputedTextLength();
			svg.removeChild(text);
			return w;
		},
		
		write: function () {
		}
	};
	return api;

	function createSVGText(s, fontSize) {
		var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
		text.setAttribute('font-family', 'Times');
		text.setAttribute('font-size', fontSize);
		var textNode = document.createTextNode(s);
		text.appendChild(textNode);
		return text;
	}

})();
//end

//begin OutputPDF
var OutputPDF = (function () {
	var sizeBig = 20;
	var sizeSmall = 14;
	var pdf;

	var api = {
		cellWidth: 100,
		cellHeight: 80,
		margins: {
			top: 36,
			bottom: 0,
			left: 0,
			right: 0
		},

		start: function () {
			pdf = new jsPDFX('l', 'pt', 'letter');
			this.margins.left = this.margins.right =
			  (pdf.getPageSize().width - 7 * this.cellWidth) / 2;
			pdf.setFont('Times', 'Roman');
		},
	
		text: function (row, col, type, s, xOffset, yOffset) {
			var x, y;

			if (type === 'weekday') {
				xOffset = (this.cellWidth - this.getTextWidth(s, 'small')) / 2;
				yOffset = output.cellHeight * .8;
			}
			pdf.setFontSize(type === 'weekday' ? sizeSmall : sizeBig);
			if (type === 'month') {
				var titleWidth = pdf.getWidth(s);
				var pageSize = pdf.getPageSize();
				x = (pageSize.width - titleWidth) / 2;
				y = this.margins.top + yOffset;
			}
			else {
				x = this.margins.left + col * this.cellWidth + xOffset;
				y = this.margins.top + row * this.cellHeight + yOffset;
			}
			pdf.text(s, x, y);
		},
		
		addPage: function () {
			pdf.addPage();
		},
		
		pageWidth: function () {
			return pdf.getPageSize().width;
		},
		
		line: function (x1, y1, x2, y2) {
			pdf.setLineWidth(1);
			pdf.lines([[x2 - x1, y2 - y1]], x1 + this.margins.left,
			  y1 + this.margins.top);
		},

		getTextWidth: function (s, fontSize) {
			pdf.setFontSize(fontSize === 'small' ? sizeSmall : sizeBig);
			return pdf.getWidth(s);
		},
		
		write: function () {
			pdf.output('save',
				{
					callback: function (blob, entry) {
						chrome.fileSystem.getDisplayPath(entry,
							function callback(displayPath) {
								document.querySelector("#calendar").
								  insertAdjacentHTML('beforeend',
								  '<p>Wrote PDF to ' + displayPath);
								showPDF(blob);
							}
						);
					}
				}
			);
		}
	};
	return api;
	
	function showPDF(blob) {
		var reader = new FileReader();
		reader.onload = function(event) {
			document.querySelector("#calendar").
			  insertAdjacentHTML('beforeend',
			  'Click <a target="_blank" href="' + event.target.result +
			    '">here</a> to see it in a browser.');
			document.querySelector("#calendar").
			  insertAdjacentHTML('beforeend',
			  '<p><webview src="' + event.target.result +
			    '" style="width:100%; height:680px;"></webview>');
		};
		reader.onerror = function(e) {
			console.log(e);
		};
		reader.readAsDataURL(blob);
	}
})();
//end

if (example === 'example1') {

var output = OutputText;

}
else {

//begin type_switch
if (!window.outputType)
	window.outputType = 'Text';

var output;

switch (window.outputType) {
case 'Text':
	output = OutputText;
	break;
case 'Table':
	output = OutputTable;
	break;
case 'HTML':
	output = OutputHTML;
	break;
case 'Canvas':
	output = OutputCanvas;
	break;
case 'SVG':
	output = OutputSVG;
	break;
case 'PDF':
	output = OutputPDF;
}
document.title = 'Calendar - ' + window.outputType;
//end

}

//begin buildCalendar_code
//insert var output = OutputText;

buildCalendar((new Date()).getFullYear());

function buildCalendar(year) {
	output.start();
	window.resizeTo(output.pageWidth(), 800);

	for (var month = 0; month < 12; month++) {
		if (month > 0)
			output.addPage();
		changeMonth(month);
		var row = 1;
		for (var day = 1; day <= 31; day++) {
			var date = new Date(year, month, day);
			if (date.getFullYear() != year || date.getMonth() != month)
				break; // day does not exist in this month
			var dayOfWeek = date.getDay();
			if (dayOfWeek === 0 && day > 1)
				row++;
			output.text(row, dayOfWeek, 'date', day.toString(), 5, 20);
		}
		drawGrid(row);
	}
	output.write();
	
	function changeMonth(monthToShow, wantLines) {
		var m = ['January', 'February', 'March', 'April', 'May',
		  'June', 'July', 'August', 'September', 'October',
		  'November', 'December'][monthToShow];
		output.text(0, 0, 'month', m + '  ' + year, 0, 24);
		['Sunday', 'Monday', 'Tuesday', 'Wednesday',
		  'Thursday', 'Friday', 'Saturday'].forEach(
			function (weekday, index) {
				output.text(0, index, 'weekday', weekday, 0, 0);
			}
		);
	}

//insert }
//end

//begin drawGrid_code
function drawGrid(numRows) {
	for (var r = 0; r < numRows + 1; r++) {
		var yLine = (r + 1) * output.cellHeight;
		output.line(0, yLine, 7 * output.cellWidth, yLine);
	}
	for (var c = 0; c < 8; c++) {
		var xLine = c * output.cellWidth;
		output.line(xLine, output.cellHeight, xLine,
		  (numRows + 1) * output.cellHeight);
	}
}
}
//end

// http://stackoverflow.com/questions/118241/calculate-text-width-with-javascript
function measureText(text, fontSize) {
    var div = document.createElement('div');
    document.body.appendChild(div);
	div.style.fontFamily = 'Times';
    div.style.fontSize = fontSize + 'px';
    div.style.position = 'absolute';
    div.style.left = -1000;
    div.style.top = -1000;
    div.innerHTML = text;
	var width = div.clientWidth;
    document.body.removeChild(div);
    return width;
}

// Interesting, but not used
// function getPixelsPerPoint()
// {
//     var div = document.createElement('div');
//     div.style.width = "1000pt";
//     document.body.appendChild(div);
//     var pixels = div.offsetWidth / 1000;
//     document.body.removeChild(div);
//     return pixels;
// }

};
