"use strict";
var Photo = (function () {
	var api = {
//skipbegin
		// Assumes photos is an array of photo objects with at least width and height
		// properties for each photo.
		layout: function (photos, targetWidth, nominalHeight, gap) {
			targetWidth -= 2 * gap;
			var rows = [];
			var curRow = [];
			var rows = [ curRow ];

			// Split photos into rows
			var wRow = 0;
			photos.forEach(
				function (photo) {
					photo.xWidth = photo.width;
					photo.xHeight = photo.height;
					if (photo.height > nominalHeight) {
						photo.xWidth *= nominalHeight / photo.height;
						photo.xHeight = nominalHeight;
					}
					if (photo.xWidth > photo.width) {
						photo.xHeight *= photo.width / photo.xWidth;
						photo.xWidth = photo.width;
					}
					if (wRow === 0 || wRow + photo.xWidth <= targetWidth) {
						curRow.push(photo);
						wRow += photo.xWidth;
					}
					else {
						curRow = [ photo ];
						rows.push(curRow);
						wRow = 0;
					}
				}
			);

			// Try for at least two photos on last row
			var numRows = rows.length;
			if (numRows > 1 && rows[numRows - 1].length === 1 &&
			  rows[numRows - 2].length > 2) {
				var ph = rows[numRows - 2].pop();
				rows[numRows - 1].splice(0, 0, ph);
			}

			// Adjust row heights to justify widths and place photos
			var y = gap;
			rows.forEach(
				function (row) {
					var x = gap;
					var rowWidth = 0;
					row.forEach(
						function (photo) {
							rowWidth += photo.xWidth;
						}
					);
					var gapWidth = (row.length - 1) * gap;
					var adj = (targetWidth - gapWidth) / rowWidth;
					if (row == rows[rows.length - 1] && adj > 1.3)
						adj = 1; // don't allow short last row to get too high
					var h = nominalHeight * adj;
					row.forEach(
						function (photo) {
							photo.xWidth *= adj;
							photo.xHeight = h;

							// Center photo if too small for space
							if (photo.width < photo.xWidth)
								photo.xLeft = x + (photo.xWidth - photo.width) / 2;
							else
								photo.xLeft = x;
							var scaledHeight = Math.min(photo.height, photo.height * photo.xWidth / photo.width);
							if (photo.xHeight > scaledHeight)
								photo.xTop = y + (photo.xHeight - scaledHeight) / 2;
							else
								photo.xTop = y;

							x += photo.xWidth + gap;
						}
					);
					y += h + gap;
				}
			);
			return y;
		},

//skipend
		getBlobUri: function(url, callback) {
			Ajax.ajaxSend(url, "blob",
				function (status, response) {
					callback(URL.createObjectURL(response));
				}
			);
		}
	};
	return api;
})();
