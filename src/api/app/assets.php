<?php
use Underscore\Underscore as __;
class Assets extends Common
{
	public function __construct() 
	{
		header('Content-Type: application/json; charset=UTF-8');
		$f3 = Base::instance();
	}
	
	public function get_list($f3, $args) 
	{
		$filter = json_decode(explode('=', $args[0]) [1], true);
		if ($filter['table']){
			ob_start('ob_gzhandler');
			$temp =file_get_contents("assets-files/".$filter['table'].".json");
			echo $temp;
		}else{
			Common::show_error('Table name required', 500);
		}
	}
}
