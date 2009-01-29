/*
 * Thickbox 3.1 - One Box To Rule Them All.
 * By Cody Lindley (http://www.codylindley.com)
 * Copyright (c) 2007 cody lindley
 * Licensed under the MIT License: http://www.opensource.org/licenses/mit-license.php
*/
		  
var fotos_es_tb_pathToImage = "../wp-includes/js/thickbox/loadingAnimation.gif";
var fotos_es_tb_closeImage = "../wp-includes/js/thickbox/tb-close.png";

/*!!!!!!!!!!!!!!!!! edit below this line at your own risk !!!!!!!!!!!!!!!!!!!!!!!*/
    jQuery.noConflict(); 
//on page load call tb_init
jQuery(document).ready(function(){   
	fotos_es_tb_init('a.fotos-es-photo');//pass where to apply thickbox
	imgLoader = new Image();// preload image
	imgLoader.src = fotos_es_tb_pathToImage;
});

//add thickbox to href & area elements that have a class of .thickbox
function fotos_es_tb_init(domChunk){
	jQuery(domChunk).click(function(){
		var t = this.title || this.name || '';
		var l = this.target || '';
		var a = this.href || this.alt;
		var g = this.rel || false;
		fotos_es_tb_show(t+'||'+l,a,g);
		this.blur();
		return false;
	});
}

function fotos_es_tb_show(caption, url, imageGroup,dir) {//function called when the user clicks on a thickbox link
	try {
		if (typeof document.body.style.maxHeight === "undefined") {//if IE 6
			jQuery("body","html").css({height: "100%", width: "100%"});
			jQuery("html").css("overflow","hidden");
			if (document.getElementById("TB_HideSelect") === null) {//iframe to hide select elements in ie6
				jQuery("body").append("<iframe id='TB_HideSelect'></iframe><div id='TB_overlay'></div><div id='TB_window'></div>");
				jQuery("#TB_overlay").click(fotos_es_tb_remove);
			}
		}else{//all others
			if(document.getElementById("TB_overlay") === null){
				jQuery("body").append("<div id='TB_overlay'></div><div id='TB_window'></div>");
				jQuery("#TB_overlay").click(fotos_es_tb_remove);
			}
		}
		
		if(fotos_es_tb_detectMacXFF()){
			jQuery("#TB_overlay").addClass("TB_overlayMacFFBGHack");//use png overlay so hide flash
		}else{
			jQuery("#TB_overlay").addClass("TB_overlayBG");//use background and opacity
		}
		
		if(caption===null){caption="";}
		jQuery("body").append("<div id='TB_load'><img src='"+imgLoader.src+"' /></div>");//add loader to the page
		jQuery('#TB_load').show();//show loader
		
		var baseURL;
	   if(url.indexOf("?")!==-1){ //ff there is a query string involved
			baseURL = url.substr(0, url.indexOf("?"));
	   }else{ 
	   		baseURL = url;
	   }
	   
	   
	   var urlString = /\.jpg$|\.jpeg$|\.png$|\.gif$|\.bmp$/;
	   var urlType = baseURL.toLowerCase().match(urlString);

		if(urlType == '.jpg' || urlType == '.jpeg' || urlType == '.png' || urlType == '.gif' || urlType == '.bmp'){//code to show images
				
			TB_PrevCaption = "";
			TB_PrevURL = "";
			TB_PrevHTML = "";
			TB_NextCaption = "";
			TB_NextURL = "";
			TB_NextHTML = "";
			TB_imageCount = "";
			TB_FoundURL = false;
			if(imageGroup){
				TB_TempArray = jQuery("a[@rel="+imageGroup+"]").get();
				for (TB_Counter = 0; ((TB_Counter < TB_TempArray.length) && (TB_NextHTML === "")); TB_Counter++) {
					var urlTypeTemp = TB_TempArray[TB_Counter].href.toLowerCase().match(urlString);
						if (!(TB_TempArray[TB_Counter].href == url)) {						
							if (TB_FoundURL) {
								TB_NextCaption = TB_TempArray[TB_Counter].title + '||' + TB_TempArray[TB_Counter].target;
								TB_NextURL = TB_TempArray[TB_Counter].href;
								TB_NextHTML = "<span class='fotos-es-tb-next' id='TB_next'>&nbsp;&nbsp;<a href='#'>Siguiente &gt;</a></span>";
							} else {
								TB_PrevCaption = TB_TempArray[TB_Counter].title + '||' + TB_TempArray[TB_Counter].target;
								TB_PrevURL = TB_TempArray[TB_Counter].href;
								TB_PrevHTML = "<span class='fotos-es-tb-prev' id='TB_prev'>&nbsp;&nbsp;<a href='#'>&lt; Anterior</a></span>";
							}
						} else {
							TB_FoundURL = true;
							found_in = TB_Counter;
							//TB_imageCount = "Fotograf&iacute;a " + (TB_Counter + 1) +" de "+ (TB_TempArray.length);											
							TB_imageCount=''
						}
				}

			}

			if ( TB_TempArray.length <= (found_in+1) && jQuery('#'+imageGroup+' .fotos-es-next').length > 0 ) {
				TB_NextHTML = "<span class='fotos-es-tb-next' id='TB_next'>&nbsp;&nbsp;<a href='#'>Siguiente &gt;</a></span>";
			} 
			 if ( found_in == 0 && jQuery('#'+imageGroup+' .fotos-es-prev').length > 0 ) {
				TB_PrevHTML = "<span class='fotos-es-tb-prev' id='TB_prev'>&nbsp;&nbsp;<a href='#'>&lt; Anterior</a></span>";
			}


			imgPreloader = new Image();
			imgPreloader.onload = function(){		
			imgPreloader.onload = null;
				
			// Resizing large images - orginal by Christian Montoya edited by me.
			var pagesize = fotos_es_tb_getPageSize();
			var x = pagesize[0] - 150;
			var y = pagesize[1] - 180;
			var imageWidth = imgPreloader.width;
			var imageHeight = imgPreloader.height;
			if (imageWidth > x) {
				imageHeight = imageHeight * (x / imageWidth); 
				imageWidth = x; 
				if (imageHeight > y) { 
					imageWidth = imageWidth * (y / imageHeight); 
					imageHeight = y; 
				}
			} else if (imageHeight > y) { 
				imageWidth = imageWidth * (y / imageHeight); 
				imageHeight = y; 
				if (imageWidth > x) { 
					imageHeight = imageHeight * (x / imageWidth); 
					imageWidth = x;
				}
			}
			// End Resizing
			var tmp = caption.split('||');
			if ( tmp.length > 1) { var lcaption = '<a target="_blank" href="'+tmp[1]+'">'+tmp[0]+'</a>'; } else { var lcaption = tmp[0]; }


			var header = jQuery('#'+imageGroup+' .fotos-es-title span').html();
			TB_WIDTH = imageWidth + 30;
			TB_HEIGHT = imageHeight + 60;
			jQuery("#TB_window").append("<div class='fotos-es-thickbox-caption'>"+header+"</div><div id='TB_closeWindow'><a href='#' id='TB_closeWindowButton' title='Close'>Cerrar</a></div><div style='height:1px;overflow:hidden;clear:both';></div><img id='TB_Image' src='"+url+"' width='"+imageWidth+"' height='"+imageHeight+"' alt='"+caption+"'/></a>" + "<div class='fotos-es-tb-caption' id='TB_caption'>"+lcaption+"<div id='TB_secondLine'>" + TB_imageCount + TB_PrevHTML + TB_NextHTML + "</div></div>"); 		
			
			jQuery("#TB_closeWindowButton").click(fotos_es_tb_remove);
			
			if ( found_in == 0 && TB_FoundURL  ) {
				var  goPrev = function() {
					fotos_es.TB_currentGroup = imageGroup;
					fotos_es.TB_currentDir = -1;
					
					var next = jQuery('#'+imageGroup+' .fotos-es-prev');
					if ( next.length > 0 ) {
						next.click();
					}
				}
			} else {
				var  goPrev = function() {
					if(jQuery(document).unbind("click",goPrev)){jQuery(document).unbind("click",goPrev);}
					jQuery("#TB_window").remove();
					jQuery("body").append("<div id='TB_window'></div>");
					fotos_es_tb_show(TB_PrevCaption, TB_PrevURL, imageGroup,-1);
					return false;
				}
			}

			if ( TB_TempArray.length <= (found_in+1) && TB_FoundURL ) {
				var goNext = function() {
					fotos_es.TB_currentGroup = imageGroup;
					fotos_es.TB_currentDir = 1;
					var next = jQuery('#'+imageGroup+' .fotos-es-next');
					if ( next.length > 0 ) {
						next.click();
					}
				}
			} else {
				var goNext = function() {
					jQuery("#TB_window").remove();
					jQuery("body").append("<div id='TB_window'></div>");
					fotos_es_tb_show(TB_NextCaption, TB_NextURL, imageGroup,1);
					return false;
				}
			}

			jQuery("#TB_prev").click(goPrev);
			jQuery("#TB_next").click(goNext);             
			jQuery("#TB_Image").click(goNext);


			document.onkeydown = function(e){ 	
				if (e == null) { // ie
					keycode = event.keyCode;
				} else { // mozilla
					keycode = e.which;
				}
				if(keycode == 27){ // close
					fotos_es_tb_remove();
				} else if(keycode == 190){ // display previous image
					if(!(TB_NextHTML == "")){
						document.onkeydown = "";
						goNext();
					}
				} else if(keycode == 188){ // display next image
					if(!(TB_PrevHTML == "")){
						document.onkeydown = "";
						goPrev();
					}
				}	
			};
			
			fotos_es_tb_position();
			jQuery("#TB_load").remove();
			jQuery("#TB_ImageOff").click(fotos_es_tb_remove);
			jQuery("#TB_window").css({display:"block"}); //for safari using css instead of show
			};
			
			imgPreloader.src = url;
			
		}

		if(!params['modal']){
			document.onkeyup = function(e){ 	
				if (e == null) { // ie
					keycode = event.keyCode;
				} else { // mozilla
					keycode = e.which;
				}
				if(keycode == 27){ // close
					fotos_es_tb_remove();
				}	
			};
		}
		
	} catch(e) {
		//nothing here
	}
}

//helper functions below
function fotos_es_tb_showIframe(){
	jQuery("#TB_load").remove();
	jQuery("#TB_window").css({display:"block"});
}

function fotos_es_tb_remove() {
 	jQuery("#TB_imageOff").unbind("click");
	jQuery("#TB_closeWindowButton").unbind("click");
	jQuery("#TB_window").fadeOut("fast",function(){jQuery('#TB_window,#TB_overlay,#TB_HideSelect').trigger("unload").unbind().remove();});
	jQuery("#TB_load").remove();
	if (typeof document.body.style.maxHeight == "undefined") {//if IE 6
		jQuery("body","html").css({height: "auto", width: "auto"});
		jQuery("html").css("overflow","");
	}
	document.onkeydown = "";
	document.onkeyup = "";
	return false;
}

function fotos_es_tb_position() {
jQuery("#TB_window").css({marginLeft: '-' + parseInt((TB_WIDTH / 2),10) + 'px', width: TB_WIDTH + 'px'});
	if ( !(jQuery.browser.msie && jQuery.browser.version < 7)) { // take away IE6
		jQuery("#TB_window").css({marginTop: '-' + parseInt((TB_HEIGHT / 2),10) + 'px'});
	}
}

function fotos_es_tb_parseQuery ( query ) {
   var Params = {};
   if ( ! query ) {return Params;}// return empty object
   var Pairs = query.split(/[;&]/);
   for ( var i = 0; i < Pairs.length; i++ ) {
      var KeyVal = Pairs[i].split('=');
      if ( ! KeyVal || KeyVal.length != 2 ) {continue;}
      var key = unescape( KeyVal[0] );
      var val = unescape( KeyVal[1] );
      val = val.replace(/\+/g, ' ');
      Params[key] = val;
   }
   return Params;
}

function fotos_es_tb_getPageSize(){
	var de = document.documentElement;
	var w = window.innerWidth || self.innerWidth || (de&&de.clientWidth) || document.body.clientWidth;
	var h = window.innerHeight || self.innerHeight || (de&&de.clientHeight) || document.body.clientHeight;
	arrayPageSize = [w,h];
	return arrayPageSize;
}

function fotos_es_tb_detectMacXFF() {
  var userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.indexOf('mac') != -1 && userAgent.indexOf('firefox')!=-1) {
    return true;
  }
}


