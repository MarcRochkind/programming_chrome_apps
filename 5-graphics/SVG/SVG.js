"use strict";

//begin onload
window.onload = function () {

var svg = document.querySelector('svg');
var text = document.createElementNS("http://www.w3.org/2000/svg", "text");
text.setAttribute('font-family', 'Times');
text.setAttribute('font-size', 50);
text.setAttribute('x', 30);
text.setAttribute('y', 80);
var textNode = document.createTextNode('This is some text');
text.appendChild(textNode);
svg.appendChild(text);

//insert };
//end

//begin addEventListener
text.addEventListener('click',
	function (e) {
		textNode.data = "You clicked me.";
	}
);
//end

};
