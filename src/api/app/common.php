<?php 
use Underscore\Underscore as __;

class Common extends JWT
{
	protected $db;

	public function __construct()
	{
		header('Content-Type: application/json; charset=UTF-8');
		$this->db = new DB\Jig('db/', DB\Jig::FORMAT_JSON);
	}

	public function check_configuration()
	{
		$config=new DB\Jig\Mapper($this->db,'sysconfig.json');
		if (!$config->load()) {
			self::show_error('No config file found',428);
			exit();
		}
	}

	public function head_request()
	{
		echo "Server is online - " . date("Y/m/d h:i:sa");
	}

	public function error_page()
	{
		return null;
	}

	public function show_error($message,$type)
	{
		echo json_encode($message);
		F3::error($type,$message);
	}

	public function jwt_decode($token)
	{
		try {
			return JWT::decode($token,F3::get('custom.SUPER-KEY'));
		} catch (Exception $e) {
			return false;
		}
	}

	// TODO: permisos de ver el area de admin o no segun usuario
	public function check_permissions($operation,$table,$token){
		$basic_tables = array('forms','dictionaries','users','roles','permissions'); //TODO: tablas basicas -> roles, users, etc   --- forms siempre lo puede leer
		$error_message = 'Operation not permited by permissions';
		if (in_array($table, array('forms','permissions','dictionaries')) && $operation == 'R') {
			// anyone can read the 'forms','permissions','dictionaries'
			return true;
		}else if(in_array($table, $basic_tables)){
			// echo "uname ".$token->username;
			if ($token->username == 'admin') {
				// only the admin can do any operation on the admin tables, TODO: other admin users
				return true;
			}else{
				self::show_error($error_message,403);
			}
		}else{
			$forms=new DB\Jig\Mapper($this->db,'forms.json');
			$forms_list = $forms->find(array('(isset(@uniqId) && @uniqId == ?)',$table));
			$form_id = $forms_list[0]['_id'];

			if ($form_id) {
				$permissions_table=new DB\Jig\Mapper($this->db,'permissions.json');
				$permissions = $permissions_table->find();
				$first_row = __::first($permissions);
				$matrix = json_decode($first_row['matrix']);
				if (count($matrix)) {
					foreach ($matrix as $v1) {
						foreach ($v1 as $v2) {
							foreach ($v2 as $v3) {
								if ($v3->s && $v3->o == $operation && (in_array($v3->r, $token->roles)) && $v3->f == $form_id) {
									$valid = true;
								}
							}
						}
					}
				}else{
					self::show_error($error_message,403);
				}
				if (!$valid) {
					self::show_error($error_message,403);
				}
			}else{
				// TODO: Table not found
				// self::show_error('Table not found',404);
			}
		}
	}

	public function check_uniq_value($value,$table,$field_name)
	{
		$table=new DB\Jig\Mapper($this->db,"$table.json");
		$match = $table->find(array("(isset(@$field_name) && @$field_name == ?)",$value));
		if ($match) {
			self::show_error("$field_name must be unique", 409);
		}
	}

	public function data_exceptions($table,$operation,$fields)
	{
		// 1 operador
		// 2 tabla
		// 3 campo con valor
		$exception = array(
			array('table'=>'roles', 'fields'=>array('role'=>'Guest'), 'operations'=>array('U','D'))
			);
	}

}
