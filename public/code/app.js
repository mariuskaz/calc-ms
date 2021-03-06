var parts = 0;
$(document).ready(function() {
parts = $(".callout").length;	
$(".callout, .textbox").draggable();
$(".pic-div").dblclick( function( event) {
	event.stopPropagation();
	addCallout( $(this), event);
});
$(".ui-resizable-handle").remove();
$(".pic-div").draggable().resizable( { autoHide:true } );

$(".pic-btn").click( function() {
	var callouts = $(this).parent().children(".callout");
	for ( var c = 0;c < callouts.length;c++) {
		var id = $(callouts[c]).html();
		$("#part"+id).remove();
	}
	$(this).parent().remove();
	recalc();
});
$(".callout").click( function() {
	onCallout(this);
});
$(".textbox").click( function() {
	//$(this).focus();
	onComment(this);
});
$.each( $(".callout"), function() {
	var id = $(this).html();
	var part = $("#part"+id).html();
	var start = part.indexOf(" ") + 1;
	var info = part.substring( start );
	$(this).attr("title", info);
});
var dialog = $('<div class="dialog" id="mainForm" contenteditable="false">'  + 
	'<div class="form-content" id="form-content">' +  
	'<div class="dialog-title"></div>' + 
	'<div class="right" style="width:200px"><select id="workCenters" width=150>'+
	'<optgroup label="Metalo operacijos">' +
	'<option value="M100">Metalo paruošimas</option>' +
	'<option value="M300">Metalo surinkimas</option>' +
	'<option value="M400">Metalo dažymas</option>' +
	'<option value="M500">Metalo pakavimas</option>' +
	'</optgroup>' +
	'<optgroup label="Medžio operacijos">' +
	'<option value="W100">Medžio paruošimas</option>' +
	'<option value="W300">Medžio surinkimas</option>' +
	'<option value="W400">Medžio dažymas</option>' +
	'<option value="W500">Medžio pakavimas</option>' +
	'</optgroup>' +
	'</select>' +
	'<br><br><img id="routings"  src="../icons/M100.png" onerror="this.src=\'../icons/blank.png\'"/></div>' +
	'<input class="long-text" id="partName" type="text"/><br>' +
	'<div  class="long-text left">' +
	'<div class="inline-block"><label for="partLength">Matmenys:</label><br><input class="short-text center" id="partLength" type="number"/> x <input class="short-text center" id="partWidth" type="number"/> mm</div>' +
	'<div class="inline-block right"><label for="partQty">Kiekis:&emsp;&emsp;</label><br><input class="short-text text-right" id="partQty" type="text"/></div>' +
	'<div class="inline-block"><label for="partMaterial">Medžiaga:</label><br><input class="long-text" id="partMaterial" type="text"/></div>' +
	'<div class="inline-block right"><label for="price">Kaina:</label><br><input class="short-text text-right" id="price" type="text"/></div>' +
	'<div class="inline-block"><label for="supplier">Tiekėjas:</label><br><input style="width:150px" id="supplier" type="text"/></div>' +
	'<br><br><div class="inline-block"><label for="partWorkTimes">Operacijos:</label><br><br>' +
	//'<select class="long-text" style="height:100px" id="partWorkTimes" size="5"></select></div>' +
	'<div class="long-text input" style="height:100px;overflow:auto;" id="partWorkTimes"></div></div>' +
	'</div>' +
	'<div class="footer">' +
	'<button class="dialog-btn" id="savePart">SAUGOTI</button><button class="dialog-btn red" id="delPart">NAIKINTI</button><button id="closeForm" class="dialog-btn right" onclick="$(\'#mainForm\').hide()">BAIGTI</button>' +
	'</div></div></div>');
$(document.body).append(dialog);

var getMaterials = function() {
	var usedMaterials = [];
	var callouts = $("#page").find(".callout");
	for ( var i = 0;i < callouts.length;i++) {
		var id = $(callouts[i]).html().trim();
		var html = $("#part"+id).html().replace("vnt.","vnt");
		var material = html.split("vnt")[1];
		if ( material == undefined || material.length == 0) {
			var info = html.substring(html.indexOf(". ")+2).trim();
			var lastSpace  = info.lastIndexOf(" ");
			var material = info.substring(0, lastSpace);
		}
		material = material.trim();
		if (material.length > 3) usedMaterials.push( material);
	}
	usedMaterials = usedMaterials.sort().filter( function(mat,id,arr) {
		var notUsed = true;
		if ( id> 0 && mat == arr[id-1]) notUsed = false;
		return notUsed;
	});
	$("#partMaterial").autocomplete({source: usedMaterials}).on('focus', function() { $(this).keydown(); });
	$("#partMaterial").autocomplete( "option", "appendTo", "#mainForm" );
}

dialog = $('<div class="dialog" id="dialog" contenteditable="false">'  + 
	'<div class="dialog-content" id="dialog-content">' + 
	'<div class="dialog-title"></div>' + 
	'<textarea rows="4"  id="input-text"  class="input-text"></textarea><br>' +
	'<div style="floatt:right"><div class="dialog-btn" id="save">GERAI</div><div id="close" class="dialog-btn">BAIGTI</div></div>' +
	'</div></div>');
$(document.body).append(dialog);

$(".form-content").draggable();
$(".title-row, .list-row:first").attr("contenteditable", false);

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

$("#workCenters").click( function() {
	$("#routings").attr("src","../icons/"+$("#workCenters").val()+".png");
});

$("#routings").click( function() {
	$("#partWorkTimes").append(new Option( $("#workCenters").val()+" "+$("#workCenters").find('option:selected').text()+" [1min.]", $("#workCenters").val() ));
});

window.prompt = function(message, value, action, extended ) {
	$(".dialog-title").html(message);
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
var btnSave = $('<img class="toolbar-icon" title="Saugoti" src="../icons/ic_save.png"/>');
var btnPrint = $('<img class="toolbar-icon" title="Spausdinti" src="../icons/ic_print.png"/>');
var btnPicture = $('<img class="toolbar-icon" title="Eskizas" src="../icons/ic_camera.png"/>');
var btnCalc = $('<img class="toolbar-icon" title="Perskaičiuoti" src="../icons/ic_update.png"/>');
var btnPage = $('<img class="toolbar-icon" title="Paversti lapą" src="../icons/ic_aspect_ratio.png"/>');
var btnSettings = $('<img class="toolbar-icon" title="Nustatymai" src="../icons/ic_settings.png"/>');
$(document.body).append(toolbar);
$(toolbar).append(btnPicture);
$(toolbar).append(btnSave);
$(toolbar).append(btnPrint);
$(toolbar).append(btnCalc);
$(toolbar).append(btnPage);
$(toolbar).append(btnSettings); 
$(btnSettings).click(function() {	
	var setPageSize = function() {
		var w,h,dim = $("#input-text").val().split("x");
		$("#page").css("width",dim[0].trim()+"mm");
		if (dim[1] != undefined) $("#page").css("height",dim[1].trim()+"mm");
		console.log("page size: "+dim[0]+"x"+dim[1]);
	}
	prompt("Lapo dydis:", "277x400", setPageSize)
});

$(btnSave).click(function() {
	var html = "<div class='page' id='page'>"+$("#page").html()+"</div>";
	document.title = $("#title").html();
	var head = $(document.head).html();
	var output = "<!DOCTYPE html>\n<html>\n<head>"+head+"</head>\n<body class='app'>\n"+html+"</body></html>"
	var blob = new Blob( ["\ufeff", output ], { type: 'text/plain' } );
	var filename = location.pathname.split("/")[2];
	console.log(filename)
	var formData = new FormData();
	formData.append("current", blob, filename);
	var req = new XMLHttpRequest();
	req.open("POST", location.origin);
	req.onload = function() {
		if (req.status == 200) {
		  console.log("file uploaded");
		} else {
		  console.log("Error " + req.status);
		}
	  };
	req.send(formData);
});

$(btnPrint).click(function() {
	print();
});

$(btnPicture).click(function() {
	var browse = $("<input type='file' accept='image/*' style='display:none'/>");
	$(document.body).append(browse);
	$(browse).change( function() {
		var file = $(browse)[0].files[0];
		if (file) {
		    var reader = new FileReader();
		    reader.readAsDataURL(file);
		    reader.onload = function(event) {
			loadPicture(event.target.result);
		    };
		}
		$(browse).remove();
	});
	$(browse).click();
});

$(btnPage).click(function() {
	var w = $("#page").css("width");
	var h = $("#page").css("height");
	$("#page").css("width",h);
	$("#page").css("height",w);
});

$(btnCalc).click(function() {
	recalc();
	$(".materials").hide().fadeIn("fast");
});

function recalc() {
	var items = 0, materials = {};
	$(".materials").remove();
	$("#partslist .list-row").each( function() {
		var partDetails = $(this).text().replace("vnt.","vnt");
		var partInfo = partDetails.split("vnt");
		var part = partInfo[0].split(" ")
		var amount = parseFloat(part[ part.length - 1 ]) || 1;
		var material = partInfo[1];
		if ( material != undefined && material.length > 2) {
			material = material.trim();
			console.log(partDetails)
			uuid = material.replace(/ /g,"-");
			var qty = 1, units = "vnt";
			var len = partDetails.split("L-")[1];
			if ( len != undefined ) {
				qty = parseFloat(len)/1000 * amount;
				units = "m";
				//console.log("  ilgis: "+len);
			} else {
				var area = partDetails.split("x");
				if (area.length > 1) {
					var dimx = area[0].split(" "), x = dimx[ dimx.length-1 ];
					var dimy = area[1].split(" "), y = dimy[ 0 ];
					qty = x/1000*y/1000*amount;
					units = "m2";
					//console.log("  plotas: "+x+" x "+y);
				}
			}
			if ( materials[uuid] == undefined ) {
				materials[uuid] = { name : material, qty : qty, units : units };
			} else {
				materials[uuid].qty += qty;
			}
		} else if ( partDetails.indexOf("vnt") > 0 ) {
			var material = partInfo[0].substring( partInfo[0].indexOf(". ")+2, partInfo[0].lastIndexOf(" ") );
			//console.log(material)
			uuid = material.replace(/ /g,"-");
			if ( materials[uuid] == undefined ) {
				materials[uuid] = { name : "pirkt."+material, qty : amount, units : "vnt" };
			} else {
				materials[uuid].qty += amount;
			}
		}
	});
	$("#partslist").append("<div class='materials list-row header'>MEDŽIAGOS</div>");
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
		material = sortedMaterials[m].name.replace("pirkt.","");
		var row = "<div class='materials list-row'>"+items+". "+ material +", "+ sortedMaterials[m].units +
		"<div style='float:right;padding-right:10px'>"+ sortedMaterials[m].qty.toFixed(4)+"&emsp;0.00"+"&emsp;0.00</div></div>";
		$("#partslist").append(row);
	}
	$("#partslist").append("<div class='materials list-row text-right'>SUMA UŽ MEDŽIAGAS: 0.00</div>");

	/* OPERACIJOS */
	$("#partslist").append("<div id='metal' class='materials block top half'></div>");
	$("#partslist").append("<div id='wood'  class='materials block top half'></div>");
	$("#metal").append("<div class='list-row header border-right'>METALO OPERACIJOS</div>");
	$("#metal").append("<div class='materials list-row border-right'>M100 Metalo paruošimas [1min]</div>");
	$("#metal").append("<div class='materials list-row border-right'>M300 Metalo surinkimas [1min]</div>");
	$("#metal").append("<div class='materials list-row border-right'>M400 Metalo dažymas [1min]</div>");
	$("#metal").append("<div class='materials list-row border-right'>M500 Metalo pakavimas [1min]</div>");
	$("#metal").append("<div class='materials list-row border-right text-right'>Laikas: 4:00 min</div>");
	$("#wood").append("<div  class='list-row header'>MEDŽIO OPERACIJOS</div>");
	$("#wood").append("<div class='materials list-row'>W100 Medžio paruošimas [1min]</div>");
	$("#wood").append("<div class='materials list-row'>W300 Medžio surinkimas [1min]</div>");
	$("#wood").append("<div class='materials list-row'>W400 Medžio dažymas [1min]</div>");
	$("#wood").append("<div class='materials list-row'>W500 Medžio pakavimas [1min]</div>");
	$("#wood").append("<div class='materials list-row text-right'>Laikas: 4:00 min</div>");
	$("#partslist").append("<div class='materials list-row ttext-right'>Brėžiniai: 0.00<div class='right text-right'>Spec.įranga: 0.00</div></div>");
	$("#partslist").append("<div class='materials list-row ttext-right'>CNC suvedimas: 0.00<div class='right text-right'>Derinimas: 0.00</div></div>");
	$("#partslist").append("<div class='materials list-row ttext-right'>Surinkimas: 0.00<div class='right text-right'>Pakavimas: 0.00</div></div>");
	$("#partslist").append("<div class='materials list-row text-right'>BENDRA SUMA: 0.00</div>");
	console.log("recalc: done")
}

$(window).keypress(function(event) {
	if (event.keyCode == 27) $(".dialog").hide();
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
	parts = 1; //parseInt($(".callout").last().text()) + 1 || 1;
	$(".callout").each(function() {
      		parts = Math.max(parts, $(this).text());
	});
	parts++;
	$("#mainForm .dialog-title").html(parts+". Nauja detalė");
	$("#savePart").off().click( function() {
		var part = $("#partName").val() + " " +$("#partQty").val() + " " + $("#partMaterial").val();
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
		recalc();
		$("#mainForm").hide();
	});
	getMaterials();
	$("#delPart").addClass("disabled").prop("disabled",true);
	$("#partName, #partMaterial").val("");
	$("#partQty").val("1vnt");
	$("#partLength, #partWidth").val("");
	$("#partWorkTimes option").remove();
	$("#mainForm").show();
	$("#partName").focus();

}

function onCallout(callout) {
	var id = $(callout).html();
	var html = $("#part"+id).html();
	$("#savePart").off().click( function() {
		$("#part"+id).fadeOut("fast");
		var partSize = $("#partWidth").val().length > 0 ? $("#partLength").val()+"x"+$("#partWidth").val() : "L-"+$("#partLength").val()
		var partInfo = id + ". "+$("#partName").val().trim() +" " + partSize + " " +$("#partQty").val()+ " "+$("#partMaterial").val().trim();
		$("#part"+id).html(partInfo);
		$("#mainForm").hide();
		$("#part"+id).fadeIn("fast");
		recalc();
	});
	$("#delPart").off().click( function() {
		$(callout).remove();
		$("#part"+id).remove();
		$("#mainForm").hide();
		recalc();
		console.log("part"+id+" removed.");
	});
	getMaterials();
	var details = html.substring( html.indexOf(". ")+2 ).replace("vnt.","vnt").split("vnt");
	if ( html.indexOf("vnt") > 0 ) details[0] += "vnt"
	var firstSpace = details[0].trim().indexOf(" ");
	var lastSpace = details[0].trim().lastIndexOf(" ");
	var part = details[0].substring(0, lastSpace).trim();
	var material = details[1] || ""; material = material.trim();
	var qty = details[0].substring(lastSpace, details[0].length + 1).trim();
	var length = 0, width = 0;
	$("#partLength").val("");
	$("#partWidth").val("");
	if ( material.length > 0) {
		if (part.indexOf("L-") > 0) {
			var arr = part.split("L-");
			part = arr[0].trim();
			length = arr[1];
			$("#partLength").val(length);
		} else if (part.indexOf("x") > 0) {
			var size = part.split("x");
			width = size[1];
			length = size[0].trim().substring( size[0].lastIndexOf(" ") );
			length = length.trim();
			$("#partLength").val(length);
			$("#partWidth").val(width);
			part = size[0].trim().substring( 0, size[0].lastIndexOf(" ") );
		}
	}
	$("#mainForm .dialog-title").html(id+". Detalės aprašymas");
	$("#partName").val(part);
	$("#partQty").val(qty);
	$("#partMaterial").val(material);
	$("#workCenters").val("M100"), $("#routings").attr("src","../icons/M100.png");
	$("#partWorkTimes option").remove();
	$("#delPart").removeClass("disabled").prop("disabled",false);
	$("#mainForm").show();
}

function onComment(comment) {
	var txt = $(comment).html();
	var editComment = function() {
		var text = $("#input-text").val();
		if (text.length > 0) $(comment).html( text );
			else $(comment).remove();
	}
	var delComment = function() {
		$(comment).remove();
	}
	var cc = { name : "NAIKINTI", action : delComment };
	prompt("Komentaras", txt, editComment, cc);
}

$("#page").dblclick( function(event) {
	var addComment = function() {
		var txt = $('<div class="textbox" contenteditable="true">'+$('#input-text').val()+'</div>');
		txt.appendTo('#page');
		$(".textbox").draggable();
		var x = onGrid(event.clientX - $("#page").offset().left-12);
		var y = onGrid(event.clientY - $("#page").offset().top-12);
		txt.css({ position:'absolute',left:x, top:y });
		txt.click( function() {
			onComment(txt);
		});
	}
	prompt("Komentaras","",addComment);
});

function onGrid(x) {
	var k = Math.round(x/25);
	x = 25*k;
	return x;
}
});