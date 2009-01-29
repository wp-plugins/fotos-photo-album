<?php
/*
Plugin Name: Fotos.es Image Gallery
Plugin URI: http://www.fotos.es
Description: Fotos.es is the right place for uploading photos, creating albums and sharing your favourite pictures with family and friends. Fotos.es also has a tool for search pictures organized by tags.
Version: 0.1
*/
define('FOTOS_ES_API','http://www.fotos.es/api/');
define('FOTOS_ES_VERSION', '0.3');


$fotos_es_iframeRendered = false;
class fotos_es {
	var $iframeRenderer = false;
	function init() {
		if ( $_GET['type'] == 'ajax' ) { fotos_es::ajax_request(); }

		add_action('wp_head', Array('fotos_es','add_head'));
		add_action('wp_print_styles', array('fotos_es', 'add_css'));
                add_action('wp_print_scripts', array('fotos_es', 'add_scripts'));

	

		add_shortcode('fotos.es', Array('fotos_es','shortcode')); 
	
		require_once( ABSPATH . WPINC . '/class-IXR.php' );

		if (ereg('/wp-admin/', $_SERVER['REQUEST_URI'])) { 
			require_once(dirname(__FILE__).'/fotos.es.admin.php');
			$admin = new fotos_es_admin();
		}

	}
	
        function add_scripts() {
                wp_enqueue_script('jquery');
        }
	
	function add_css() {
		wp_enqueue_style('thickbox');
	} 

	function add_head() {
		$path = get_settings('siteurl') . '/wp-content/plugins/fotos.es/rcs/fotos.es.css';
		echo '<link rel="stylesheet" href="'.$path.'" type="text/css" />'."\n";
		$path = get_settings('siteurl') . '/wp-content/plugins/fotos.es/js/fotos.es.thickbox.js';
		echo '<script type="text/javascript" src="'.$path.'?ver='.FOTOS_ES_VERSION.'"></script>'."\n";
		$path = get_settings('siteurl') . '/wp-content/plugins/fotos.es/js/fotos.es.js';
		echo '<script type="text/javascript" src="'.$path.'?ver='.FOTOS_ES_VERSION.'"></script>'."\n";
		$path = get_settings('siteurl') . '/wp-content/plugins/fotos.es/js/jquery.blockUI.js';
		echo '<script type="text/javascript" src="'.$path.'?ver='.FOTOS_ES_VERSION.'"></script>'."\n";
		echo '<script type="text/javascript">var fotos_es_plugin_url = "'.get_settings('siteurl').'/wp-content/plugins/fotos.es/fotos.es.php";</script>'."\n";

	}

	function shortcode($attribs,$content) {
		return fotos_es::get_album_html($attribs);
	}













	function ajax_request() {
		require_once('../../../wp-includes/class-IXR.php' );
		$config = $_GET['config'];
		$key = $_GET['key'];
		if ( substr(md5($config.$auth_key),0,5) == $key ) {
			echo fotos_es::get_album_html($config,(int)$_GET['offset'],true);
			die();
		}
	}

	function get_album_html($config,$offset=false,$ajax=false) {
		global $fotos_es_iframeRendered;
		if ( is_string($config) ) { 
			$config_str=$config;
			$config=unserialize(base64_decode($config));
		} else {
			$config_str=base64_encode(serialize($config));
		}
		$key = substr(md5($config_str.$auth_key),0,5);	
		if ( !$offset ) { $offset = (int)$_GET['offset'][$key]; }
		if ( (int)$config['limit'] == 0 ) { $config['limit'] = 200; }	

		if ( (int)$config['album'] == 0 && strlen($config['user']) > 0 ) {
			$photos = fotos_es::get_photos_from_user($config['user'],(int)$config['size'],$offset,(int)$config['limit']);
			$title = '<a target="_blank" class="fotos-es-link" href="http://'.$photos['user']['username'].'.fotos.es/" title="Fotos de '.$photos['user']['username'].'">Fotos de ' . $photos['user']['username'].'</a>';
		} else if ( (int)$config['album'] > 0 && strlen($config['user']) > 0 ) {
			$photos = fotos_es::get_photos_from_album((int)$config['album'],(int)$config['size'],$offset,(int)$config['limit']);
			$title = '<a target="_blank" class="fotos-es-link" href="http://'.$photos['user']['username'].'.fotos.es/'.$photos['album']['url'].'" title="Fotos de '.$photos['album']['title'].'">Fotos de ' . $photos['album']['title'].'</a>';
		}
		if (!$ajax) { $output[] = '<div id="fotos-es-'.$key.'" class="fotos-es-plugin">'; }
		$output[] =  fotos_es::render_photos($config_str,$key,$photos['user'],$photos['photos'],$photos['total'],$title,$offset,$config['limit']);
		if (!$ajax) {$output[] = '</div>'; }

		if ( !$fotos_es_iframeRendered ) {
			$iframe = '<iframe src="http://www.fotos.es/plugins/stats/wp/" style="width:0px; height:0px; border: 0px" ></iframe>';
			$fotos_es_iframeRendered=true;	
		}
			
		return $iframe.implode("\n",$output);
	}

	function get_albums_from_user($user_id=1) {
		$client = new IXR_Client(FOTOS_ES_API);
		$client->useragent = fotos_es::create_ua(); 
		if (!$client->query('getAlbumsFromUser', $user_id,'big')) {
			return false;
		}

		return $client->getResponse();
	}

	function get_photos_from_album($album_id,$thumb,$offset,$limit) {
		$client = new IXR_Client(FOTOS_ES_API);
		$client->useragent = fotos_es::create_ua(); 
		if (!$client->query('getPhotosFromAlbum', $album_id,$thumb,$offset,$limit)) {
			return false;
		}

		return $client->getResponse();
	}

	function get_photos_from_user($user_id,$thumb,$offset,$limit) {
		$client = new IXR_Client(FOTOS_ES_API);
		$client->useragent = fotos_es::create_ua(); 
		if (!$client->query('getPhotosFromUser', $user_id,$thumb,$offset,$limit)) {
			return false;
		}

		return $client->getResponse();
	}


	function render_photos($config,$key,$user,$photos,$total,$title,$offset=0, $limit = 10) {
		if ( !is_array($photos) ) { return false; }
		$output[] = '<span class="fotos-es-title"><a title="Fotos" href="http://www.fotos.es" class="fotos-es-logo" target="_blank"><h2>Fotos</h2></a><span>'.$title.'</span></span>';

		$output[] = '<div class="fotos-es-list">';
		for ($i=0;$i<count($photos);$i++) {
			$output[]='<div class="fotos-es-photo">';
			$output[]='<a href="'.$photos[$i]['big_src'].'" class="fotos-es-photo" rel="fotos-es-'.$key.'" title="'.$photos[$i]['title'].'"  target="http://'.$user['url'].'.fotos.es'.$photos[$i]['link'].'">';
				$output[]='<img src="'.$photos[$i]['src'].'" title="'.$photos[$i]['title'].'" alt="'.$photos[$i]['title'].'" />';
			$output[]='</a>';
			$output[]='</div>';
		}
		$output[] = '</div><div style="clear:both;"></div>';

		$output[] = fotos_es::render_nav($config,$key,$total,$offset,$limit);	
		
		return implode("\n",$output);

	}

	function render_nav($config,$key,$total,$offset,$limit) {
		$current_values = $_GET['offset'];
		if ( !is_array($current_values) ) { $current_values = Array(); }

		$prev = $offset - $limit; 
		if ( $prev >= 0 ) {
			$current_values[$key]=$prev;
			$output[] = fotos_es::create_nav_link($config,$key,$prev,$current_values,'Anterior','fotos-es-prev');
		}
		$next = $offset + $limit;
		
		if ( ($offset+$limit) < $total ) {
			$current_values[$key]=$next;
			$output[] = fotos_es::create_nav_link($config,$key,$next,$current_values,'Siguiente','fotos-es-next');
		}
		return '<div class="fotos-es-navigation">'.@implode('&nbsp;',$output).'</div>';
	}

	function create_nav_link($config,$key,$value,$values,$string,$class) {
		$output = '<a class="'.$class.'"' .

		$output .= ' href="?'.http_build_query(Array('offset' => $values)).'#fotos-es-'.$key.'" ';

		$output .= ' onclick="javascript:fotos_es.navigate(\''.$config.'\',\''.$key.'\',\''.$value.'\');return false;" ';
		$output .= ' >'.$string.'</a>';

		return $output;
	}

	function create_ua() {
		return 'WP:'.FOTOS_ES_VERSION. ' http://'.($_SERVER['HTTP_HOST']?$_SERVER['HTTP_HOST']:$_SERVER['SERVER_ADDR']);

	}
	
}

fotos_es::init();

if(!function_exists('http_build_query')) {
    function http_build_query($data,$prefix=null,$sep='',$key='') {
        $ret    = array();
            foreach((array)$data as $k => $v) {
                $k    = urlencode($k);
                if(is_int($k) && $prefix != null) {
                    $k    = $prefix.$k;
                };
                if(!empty($key)) {
                    $k    = $key."[".$k."]";
                };

                if(is_array($v) || is_object($v)) {
                    array_push($ret,http_build_query($v,"",$sep,$k));
                }
                else {
                    array_push($ret,$k."=".urlencode($v));
                };
            };

        if(empty($sep)) {
            $sep = ini_get("arg_separator.output");
        };

        return    implode($sep, $ret);
    };
};
?>
