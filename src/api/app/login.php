<?php 
use Underscore\Underscore as __;

class Login extends JWT
{
	protected $db;

	public function __construct() 
	{
		header('Content-Type: application/json; charset=UTF-8');
		$f3 = Base::instance();
		$this->db = new DB\Jig('db/', DB\Jig::FORMAT_JSON);
	}

	private function get_roles($id)
	{
		$roles=new DB\Jig\Mapper($this->db,'roles.json');
		$roles_list = $roles->find();
		$assigned_roles = array();
		foreach ($roles_list as $key => $v1) {
			if (count($v1['users'])) {
				$assigned_roles[] = $v1['_id'];
			}
		}
		return $assigned_roles;
	}

	public function login($f3, $args)
	{
		self::check_configuration();
		$params = json_decode($f3->get('BODY'));
		if ($params->username && $params->password) {
			$login=new DB\Jig\Mapper($this->db,'users.json');
			$temp = $login->find(array('(isset(@userName) && @userName == ?)',$params->username));
			if ($temp) {
				$first= __::first($temp);
				if (password_verify($params->password, $first['password'])) {
					$date = new DateTime();
					$date->add(new DateInterval('PT'.F3::get('custom.TTL').'H'));
					$out = array(
						'username'=>$first['userName'],
						'userid'=>$first['_id'],
						'ttl'=>$date->format('Y-m-d H:i:s'),
						'roles'=>self::get_roles($first['_id'])
						);
					$jwt = JWT::encode($out,F3::get('custom.SUPER-KEY'));
					echo json_encode(array('token'=>$jwt, 'data'=>array('firstName'=>$first['firstName'],'lastName'=>$first['lastName'],'userName'=>$first['userName'])));
				}else{
					self::wrong_login();
				}
			}else{
				self::wrong_login();
			}
		}else{
			self::wrong_login();
		}
	}

	public function wrong_login()
	{
		echo json_encode(array('message'=>'Wrong Username or Password'));
		F3::error(401);
	}

	public function check_configuration()
	{
		$config=new DB\Jig\Mapper($this->db,'sysconfig.json');
		if (!$config->load()) {
			echo json_encode(array('message'=>'No config file found'));
			F3::error(428);
			exit();
		}
	}
}