<?php

class fotos_es_admin extends fotos_es {
	function fotos_es_admin() {
		add_filter('media_buttons_context', array(&$this, 'media_buttons_context'));//create_function('$a', "return '%s';"));
		add_action('media_upload_fotos-es-albums', array(&$this, 'media_upload_content_albums'));
		add_action('media_upload_fotos-es-about', array(&$this, 'media_upload_content_about'));
		
	}

	function upload_tabs_scripts() {
                $path = get_settings('siteurl') . '/wp-content/plugins/fotos-photo-album/js/fotos.es.js';
                echo '<script type="text/javascript" src="'.$path.'?ver=2.10"></script>'."\n";
	

		echo '<link rel="stylesheet" href="'.get_settings('siteurl').'/wp-content/plugins/fotos-photo-album/rcs/fotos.es.admin.css?var=0.1" type="text/css" />';
	
	}

	function media_upload_tabs($tabs) {
		return array(
			'fotos-es-albums' => __('Albums', 'fotos-es'),
			'fotos-es-about' => __('Sobre Fotos.es', 'fotos-es'),
		);
	}
	
	function media_upload_content_albums() { return $this->media_upload_content('albums');}
	function media_upload_content_about() { return $this->media_upload_content('about');}
	
	function media_upload_content($mode='stream') {
		add_filter('media_upload_tabs', array(&$this, 'media_upload_tabs'));
	        add_action('admin_print_scripts', array(&$this, 'upload_tabs_scripts'));

		if (function_exists('media_admin_css')) add_action('admin_print_scripts', 'media_admin_css');
		else wp_enqueue_style( 'media' );
		
		add_action('fotos_es_media_upload_header', 'media_upload_header');
		if ($mode == 'albums') {
			wp_iframe(array(&$this, 'albumsTab'));
		} else {
			wp_iframe(array(&$this, 'aboutTab'));
		}
	} 

	function media_buttons_context($context) {
		global $post_ID, $temp_ID;
		$dir = dirname(__FILE__);

		$image_btn = get_option('siteurl').'/wp-content/plugins/fotos-photo-album/rcs/fotos_16x16.gif';
		$image_title = 'Fotos.es';
		
		$uploading_iframe_ID = (int) (0 == $post_ID ? $temp_ID : $post_ID);

		$media_upload_iframe_src = "media-upload.php?post_id=$uploading_iframe_ID";
		$out = ' <a href="'.$media_upload_iframe_src.'&tab=fotos-es-albums&TB_iframe=true&height=500&width=640" class="thickbox" title="'.$image_title.'"><img src="'.$image_btn.'" alt="'.$image_title.'" /></a>';
		return $context.$out;
	}

    	function albumsTab() {
		if ( strlen($_GET['username']) != 0 ) {
			$username = str_replace('.fotos.es','',$_GET['username']);
			$data = $this->get_albums_from_user($username);
			$albums = $data['albums'];
			$user = $data['user'];
		} 
		do_action('fotos_es_media_upload_header');
	        include(dirname(__FILE__).'/admin/admin-albums-tab.html');
	}    

	function aboutTab() {
		do_action('fotos_es_media_upload_header');
		include(dirname(__FILE__).'/admin/admin-about-tab.html');
	}   
}

?>
