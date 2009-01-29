var fotos_es = {
	api_url:'',
	navigate:function(config,key,offset,success) {
		var e = jQuery('#fotos-es-'+key);        
		e.css( {opacity: '0.5' } );
		e.block({
			message:'<div class="fotos-es-loading" />',
			css: {
				border:'none', 
				width:'32px;', 
				background:'transparent'
		 }}); 

		if ( !success )  {
			var success = function(response) {
		                var e = jQuery('#fotos-es-'+key);
	                        e.attr("innerHTML", response);
	                        e.unblock();
	                        e.css( {opacity: '1' } );
	                        fotos_es_tb_init('a.fotos-es-photo');
				if ( fotos_es.thickBoxCallback ) { 
					if ( jQuery("#TB_window").length != 0 ) {
						fotos_es.thickBoxCallback(); 
					}
				}
            		}	
		};

		jQuery.ajax({
			url:fotos_es_plugin_url,
			type:'GET',
			data:jQuery.param({type:'ajax',config:config,key:key,offset:offset}),
			dataType:'xhtml',
			success:success
		});        
		return false;
	},

	admin_options:function(user,id,title,count,url) {
		if ( id ) {
	        	jQuery('#photo-meta').html('<h3>&nbsp;Album '+title+' ('+count+' fotos) <a style="font-size:10px;" href="'+url+'" target="_blank">Ver album en Fotos.es &gt;</a></h3>') ;
		        jQuery('#photo-id').val(id);
	        	jQuery('#photo-title').val(title);
	                jQuery('.album input[name=album-insert-photos]').val(10);
		} else {
	        	jQuery('#photo-meta').html('<h3>&nbsp;Fotos de '+title+' <a style="font-size:10px;" href="http://'+url+'.fotos.es" target="_blank">Ver todas las fotos en Fotos.es &gt;</a></h3>');
		        jQuery('#photo-id').val();
	                jQuery('.album input[name=album-insert-photos]').val(10);
		}
	
	        jQuery('#photo-user').val(user);
	        
		jQuery('.photo-options').toggle();
		jQuery('#fotos-es-admin-albums').toggle();

	        jQuery('.photo .image-size .field *').hide();
	        jQuery('input[name=image-size][value=Square]:visible').attr('checked', 'checked');
	        jQuery('input[name=image-size][value=Medium]:visible').attr('checked', 'checked');
	        jQuery('input[name=image-size][value=Video Player]:visible').attr('checked', 'checked');

		jQuery('.album input.cancel').click(function() {
			jQuery('#fotos-es-admin-albums').show();
			jQuery('.photo-options').hide();
			return false;
		});

        	jQuery('.album input.send').click(function() {
	                var num = jQuery('.album input[name=album-insert-photos]').val();
        	        var size = jQuery('.album input[name=album-image-size]:checked').val();
			if ( jQuery('#photo-id').val() ) {
		                fotos_es.admin_create_tag('user='+jQuery('#photo-user').val()+' album='+jQuery('#photo-id').val()+' limit='+num+' size='+size);
			} else {
		                fotos_es.admin_create_tag('user='+jQuery('#photo-user').val()+' limit='+num+' size='+size);
			}
        	        return false;
	        });

	},

	admin_create_tag:function(attribs) {
		top.send_to_editor('[fotos.es'+(attribs ? (' '+attribs) : '')+']');
		if (typeof top.tb_remove == 'function') {
	        	if (jQuery('#image-close-check:checked').val())  {
        	                top.tb_remove();
	                } else {
	                        jQuery('input.cancel').click();
                	}
        	}
	},

	thickBoxCallback:function() {
		var TB_TempArray = jQuery("a[@rel="+fotos_es.TB_currentGroup+"]").get();
		if ( fotos_es.TB_currentDir === 1 ) {
			TB_NextCaption = TB_TempArray[0].title + '||' + TB_TempArray[0].target;
			TB_NextURL = TB_TempArray[0].href;
			TB_NextHTML = "<span class='fotos-es-tb-next' id='TB_next'>&nbsp;&nbsp;<a href='#'>Siguiente &gt;</a></span>";
			jQuery("#TB_window").remove();
			jQuery("body").append("<div id='TB_window'></div>");
			fotos_es_tb_show(TB_NextCaption, TB_NextURL, fotos_es.TB_currentGroup,1);
		} else if ( fotos_es.TB_currentDir === -1 ) {
			TB_PrevCaption = TB_TempArray[TB_TempArray.length-1].title + '||' + TB_TempArray[TB_TempArray.length-1].taget;
			TB_PrevURL = TB_TempArray[TB_TempArray.length-1].href;
			TB_PrevHTML = "<span class='fotos-es-tb-next' id='TB_next'>&nbsp;&nbsp;<a href='#'>Siguiente &gt;</a></span>";
			jQuery("#TB_window").remove();
			jQuery("body").append("<div id='TB_window'></div>");
			fotos_es_tb_show(TB_PrevCaption, TB_PrevURL, fotos_es.TB_currentGroup,-1);
			return false;
		}
		//jQuery("#TB_window").unblock();
	}
}
