var parts = 0;
$(document).ready(function() {
parts = $(".callout").length;	
$(".callout, .textbox").draggable();
$(".pic-div").dblclick( function( event) {
	event.stopPropagation();
	addCallout( $(this), event);
});
$(".pic-div").resizable();
$(".pic-div").draggable();
$(".pic-btn").click( function() {
	$(this).parent().remove();
});
$(".callout").click( function() {
	onCallout(this);
});
$(".textbox").click( function() {
	$(this).focus();
});

$.each( $(".callout"), function() {
	var id = $(this).html();
	var part = $("#part"+id).html();
	var start = part.indexOf(" ") + 1;
	var info = part.substring( start );
	$(this).attr("title", info);
});

$(document).keyup(function(e) {
	if (e.keyCode == 27) {
		$("#dialog").hide();
		$("#save").off();
	}
});

var dialog = $('<div class="dialog" id="dialog" contenteditable="false">'  + 
	'<div class="dialog-content" id="dialog-content">' + 
	'<div id="dialog-title"></div>' + 
	'<textarea rows="4"  id="input-text"  class="input-text"></textarea><br>' +
	'<div class="dialog-btn" id="save">GERAI</div><div id="close" class="dialog-btn">BAIGTI</div>' +
	'</div></div>');

$(document.body).append(dialog);

$("#dialog-content").draggable();
//$(".title-row").attr("contenteditable", false);

$("#title").click( function() {
	var title = $("#title").html();
	var setName = function() {	
		var value = $("#input-text").val();
		$("#title").html(value);
	}
	prompt("Pavadinimas", title, setName);
});

$(".cell").click( function() {
	var cell = $(this);
	var title = cell.find(".small").html();
	var value = cell.find("span").html();
	var setValue = function() {	
		var value = $("#input-text").val();
		 cell.find("span").html(value);		
	}
	prompt(title, value, setValue);
}); 

window.prompt = function(message, value, action) {
	$("#dialog-title").html(message);
	$("#input-text").val(value);
	$("#dialog").show();
	$("#save").one( "click", function() {
		$("#dialog").hide();
		$(action);
	});
	//$("#input-text").focus();
}
$("#close").click( function() {
	$("#dialog").hide();
	$("#save").off();
});

var toolbar = $('<div class="toolbar" contenteditable="false"></div>');
var setbtn = $('<img class="toolbar-icon" src="../images/ic_settings.png"/>');
var savebtn = $('<img class="toolbar-icon" src="../images/ic_save.png"/>');
var printbtn = $('<img class="toolbar-icon" src="../images/ic_print.png"/>');
var calcbtn = $('<img class="toolbar-icon" src="../images/ic_refresh.png"/>');
$(document.body).append(toolbar);
$(toolbar).append(savebtn);
$(toolbar).append(printbtn);
$(toolbar).append(calcbtn);
$(toolbar).append(setbtn); 
$(setbtn).click(function() {	
	var setPageSize = function() {
		var value = $("#input-text").val();
		var h = Number(value);
		if (h!="NaN") $("#page").css("height",h+"mm");
	}
	prompt("Lapo dydis", "420", setPageSize)
});

$(savebtn).click(function() {
	var html = "<div class='page' id='page'>"+$("#page").html()+"</div>";
	document.title = $("#title").html();
	var head = $(document.head).html();
	var output = "<!DOCTYPE html>\n<html>\n<head>"+head+"</head>\n<body class='app'>\n"+html+"</body></html>"
	var blob = new Blob( ["\ufeff", output ], { type: 'text/plain' } );
	var objectURL = URL.createObjectURL( blob );
	window.open( objectURL, '_blank' );
	window.focus(); 
});

$(printbtn).click(function() {
	print();
});

$(calcbtn).click(function() {
	var items = 0, materials = {};
	$(".materials").remove();
	$("#partslist .list-row").each( function() {
		var partDetails = $(this).text().replace("vnt.","vnt");
		var partInfo = partDetails.split("vnt");
		var part = partInfo[0].split(" ")
		var amount = parseFloat(part[ part.length - 1 ]) || 1;
		var material = partInfo[1];
		if ( material != undefined && material.length > 2) {
			console.log(partDetails)
			uuid = material.replace(/ /g,"-");
			var qty = 1, units = "vnt";
			var len = partDetails.split("L-")[1];
			if ( len != undefined ) {
				qty = parseFloat(len)/1000 * amount;
				units = "m";
				console.log("  ilgis: "+len);
			} else {
				var area = partDetails.split("x");
				if (area.length > 1) {
					var dimx = area[0].split(" "), x = dimx[ dimx.length-1 ];
					var dimy = area[1].split(" "), y = dimy[ 0 ];
					qty = x/1000*y/1000*amount;
					units = "m2";
					console.log("  plotas: "+x+" x "+y);
				}
			}
			if ( materials[uuid] == undefined ) {
				materials[uuid] = { name : material, qty : qty, units : units };
			} else {
				materials[uuid].qty += qty;
			}
		} else if( partDetails.indexOf("vnt") > 0 ) {

			var materialInfo = partInfo[0].substring( partInfo[0].indexOf(" ") )
				console.log(materialInfo)
			if ( materialInfo.length > 0 ) {
				var material =  materialInfo.split(amount)[0]
				uuid = material.replace(/ /g,"-");
				if ( materials[uuid] == undefined ) {
					materials[uuid] = { name : "pirkt. "+material, qty : amount, units : "vnt" };
				} else {
					materials[uuid].qty += amount;
				}
			}
		}
	});
	$("#partslist").append("<div class='materials list-row' id='materials'></div>");
	$("#materials").append("<span style='padding-left:20px'>MEDŽIAGOS</span>");
	var  sortedMaterials = [ ];
	for (m in materials) {
		var material = materials[m];
		sortedMaterials.push(material);
	}
	sortedMaterials.sort( function(a,b) {
		if(a.name < b.name) return -1;
		if(a.name > b.name) return 1;
		return 0;
	});
	for (m in sortedMaterials) {
		items += 1;
		var row = "<div class='materials list-row'>"+items+". "+ sortedMaterials[m].name+", "+ sortedMaterials[m].units+"  <div style='float:right;padding-right:10px'>"+ sortedMaterials[m].qty.toFixed(4)+"</div></div>";
		$("#partslist").append(row);
	}
});

$("#paste-box").bind("input", function() {
	$("#paste-box").hide();
	setTimeout( function() {
		var pic = $("#paste-box img").first();
		if ( pic.attr("src") != undefined ) {
			pic.detach();
			loadPicture(pic.attr("src"));
		}
	}, 200);
});

$(window).keypress(function(event) {
	if (event.keyCode == 27) {
		$("#paste-box").hide();
		$("#dialog").hide();
	}
});

$(window).bind("paste", function(event) {
	console.log("paste");
	var pastedImg;
	var clipboardData = event.clipboardData  ||  event.originalEvent.clipboardData;
	var items = clipboardData.items;
	if ( items != undefined) {
		var blob = items[0].getAsFile();
	  	if (blob !== null) {
			var reader = new FileReader();
			reader.onload = function(event) {
				loadPicture(event.target.result);
			};
			reader.readAsDataURL(blob);
  		}
	} else {
		$("#paste-box").html("");
		$("#paste-box").fadeIn();
		$("#paste-box").focus();
	}
});

function loadPicture(pastedImg) {
	var div = $('<div class="pic-div"><img src="'+pastedImg+'"/></div>');
	div.appendTo('#page');
	var offset = $("#page").offset();
	div.offset(offset);
	div.dblclick( function(event) {
		event.stopPropagation();
		addCallout( $(this), event);
	});
	var btn = $('<div class="pic-btn">X</div>');
	btn.click( function() {
		$(this).parent().remove();
	});
	btn.appendTo(div);	    
	div.draggable().resizable( { autoHide:true } );	
}

function addCallout(div, event) {
	var addPart = function () {
		var part = $("#input-text").val();
		parts = $(".callout").length;
		parts += 1;
		var callout = $('<div>'+parts+'</div>');
		callout.attr("class","callout");
		var tx = onGrid(event.clientX - div.offset().left - 9);
		var ty = onGrid(event.clientY - div.offset().top - 9);
		callout.appendTo( div ).css({position:'absolute',left:tx, top:ty});
		callout.draggable();
		var row = "<div class='list-row' id='part"+parts+"'>"+parts+". "+part+"</div>";
		$("#partslist").append(row);
		$(callout).click( function() {
			onCallout(this);
		});
	}
	prompt("Nauja detalė", "", addPart);
}

function onCallout(callout) {
	var id = $(callout).html();
	var html = $("#part"+id).html();
	var editPart = function() {
		var name = nr + ". "+$("#input-text").val();
		$("#part"+id).html(name);
	}
	var info = html.split(".");
	var nr = info[0];
	var part = info.slice(1).join().trim();
	prompt(nr + ". Detalės aprašymas", part, editPart);
}

$(".calloutttt").mouseover(function( callout ) {
	var id = $(callout).html();
	var part = $("#part"+id).html();
	alert( part);
});

$("#page").dblclick( function(event) {
	var txt = $('<div class="textbox" contenteditable="true"></div>');
	txt.appendTo('#page');
	$(".textbox").draggable();
	var x = onGrid(event.clientX - $("#page").offset().left-12);
	var y = onGrid(event.clientY - $("#page").offset().top-12);
	txt.css({ position:'absolute',left:x, top:y });
	txt.focus();
});

function onGrid(x) {
	var k = Math.round(x/25);
	x = 25*k;
	return x;
}
});