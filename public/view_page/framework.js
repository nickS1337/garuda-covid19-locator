var 

	window_width = $(window).width(),

	window_height = $(window).height(),

	unique_name,

	parallax_list = []

	framework_developer = 0;

	

	console.debug("%cPlease contact http://steamcommunity.com/profiles/76561198135367911/ if you encounter any problems","font-weight: bold");	

		

var vtg = {

			

	pos: function(obj){

		var posType = "offset";

		determineObject(obj, posType, window_width, window_height);

	},

		

	coord: function(){

		detectObjectCoords();

	},

		

	parallax: function(name, speed, direction){

			

		window.addEventListener("scroll", function(){

			var

				offset = window.pageYOffset,

				content = document.getElementById(name);

				content.style.top = offset * .4 + "px";

		});



	},

		

	parallax_remove: function(){

		window.removeEventListener("scroll");

	},

	

	XMLHttpREQ: function(method, file_name){

		

		var xhrrequest = new XMLHttpRequest();

		xhrrequest.open("","");

		xhr.send();

		

	},

		

}

//======================================================================================//

function determineObject(obj, posType, window_width, window_height){

	

	if (($("#"+obj).length == 0)&&($("."+obj).length == 0)){

		throw new Error("VTG_SCRIPT_ERROR: Could not find element '"+obj+"'");

		return;

	} else if (($("#"+obj).length == 1)&&($("."+obj).length == 1)){

		throw new Error("VTG_SCRIPT_ERROR: Classnames and IDs cannot not have the same name.");

		return;

	} else {

			detectObjectType(obj, posType, window_width, window_height);

	}



}

function detectObjectType(obj, posType, window_width, window_height){



	var object_type;

	

	if ($("#"+obj).length == 1){

		var object_type = "id";

		positionObject(obj, object_type, posType, window_width, window_height);

	} else {

		var object_type = "classname";

		positionObject(obj, object_type, posType, window_width, window_height);

	}

}

function positionObject(obj, type, posType, window_width, window_height){

	

	var 

		draggable,

		pos = posType,

		idclass,

		type,

		dot = ".",

		name;

		

	if (type == "id"){

		draggable = $("#"+obj).draggable();

		idclass = "#";

		name = idclass + obj;

		unique_name = name;

	} else { 

		draggable = $("."+obj).draggable();

		idclass = ".";

		name = idclass + obj;

		unique_name = name;

	}

	var

		elem = $(name).position(),

		elem_top = elem.top/$(window).height() * 100,

		elem_left = elem.left/$(window).width() * 100;

		

			if ((isNaN(elem_top))&&(isNaN(elem_left))){

				console.log("%cCould not calculate the position of the requested object!","font-weight: bold; color: #CC181E;");

				return;

			} else {

				console.debug("$('"+name+"').css({ position: 'absolute', top: '"+elem_top+"%', left: '"+elem_left+"%'});");	

			}

}

function detectObjectCoords(){



	var 

		elm = $(unique_name).position(),

		coords_top = elm.top/$(window).height() * 100,

		coords_left = elm.left/$(window).width() * 100;



		console.clear();

		console.log("%cUpdating console","color: #34A953;");

		console.debug("$('"+unique_name+"').css({ position: 'absolute', top: '"+coords_top+"%', left: '"+coords_left+"%'});");

			

		return;



}



function error(msg){

	throw new Error ("VTG_SCRIPT_ERROR: " + msg);

}



//======================================================================================//

function checkType(name){

	

	var new_name;



	if ($("#" + name).length == 1){

		new_name = "#" + name;

		return new_name;

	} 

	else if ($("." + name).length == 1){

		new_name = "." + name;

		return new_name;

	} else {

		error("The element could not be found.");

		return false;

	}



}

function parallax_passed(type, speed, direction){

	

	var offset = window.pageYOffset;

	

}

function checkDirection(main){

	var word;

	

		if (empty(main)){

		}

	

}

function checkSpeed(speed){

	var speed;

	

		if (empty(speed)){

			speed = .4;

			return speed;

		} else { 

			return speed;

		}

}

function empty(word){

		if (word == ""){

			return true;

		} else {

			return false;

		}

}

function developer(msg){

	

		if (framework_developer == 1){

			console.log("[framework.js] " + msg);

		} else {

			return;

		}

		

}	
