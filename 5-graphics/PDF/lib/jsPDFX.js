"use strict";

// Make some internal functionality accessible.

function jsPDFX(orientation, unit, format, compressPdf) {
	var pdf = new jsPDF(orientation, unit, format, compressPdf);
	var pdfx = Object.create(pdf);
	
	pdfx.getWidth = function (s) {
		return pdfx.getStringUnitWidth(s) * pdfx.internal.getFontSize() / pdfx.internal.scaleFactor;
	};
	pdfx.getPageSize = function () {
		return pdfx.internal.pageSize;
	};
	return pdfx;
}
