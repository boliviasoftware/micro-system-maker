<?php 
use Underscore\Underscore as __;
class Setup extends Common
{
	protected $configuration;
	protected $db;

	public function __construct() 
	{
		$this->db = new DB\Jig('db/', DB\Jig::FORMAT_JSON);		
		$this->configuration = new \DB\Jig\Mapper($this->db, 'sysconfig.json');
	}

	public function show($f3)
	{
		if (!$this->configuration->load()) {
			$values = $f3->get('SESSION.form_values');
			if ($values) {
				$f3->set('values',$values);
				$f3->clear('SESSION.form_values');
				$f3->set('messages', $f3->get('SESSION.form_messages'));
				$f3->clear('SESSION.form_messages');
			};
			$f3->set('initial_address',((isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] == "on") ? "https" : "http") . "://" . $_SERVER['HTTP_HOST'] . str_replace(basename($_SERVER['SCRIPT_NAME']) , "", $_SERVER['SCRIPT_NAME']));
			echo Template::instance()->render('templates/setup.html');
		}else{
			echo Template::instance()->render('templates/setup-created.html');
		}
	}

	public function save($f3)
	{
		if (!$this->configuration->load()) {
			$audit = \Audit::instance();
			$values =$f3->get('POST');
			if (!strlen($values['site-name'])||!(strlen($values['password']))|| !(strlen($values['repeat-password']))|| ($values['password'] <> $values['repeat-password'])|| !$audit->email($values['admin-email'])   ) {
				$f3->set('SESSION.form_values',$values);
				$messages = array();
				if (!$audit->email($values['admin-email'])) {
					$messages[]='The email must be a valid email';
				}
				if (!strlen($values['password'])) {
					$messages[]='The password field are required';
				}
				if ($values['password'] <> $values['repeat-password']) {
					$messages[]='The password must be equal';
				}
				if (!strlen($values['site-name'])) {
					$messages[]='The site name are required';
				}
				$f3->set('SESSION.form_messages',$messages);
				$f3->reroute('/setup');
			}else{
				$configuration = $this->configuration;
				$user = array(
					"firstName"=> "Administrator",
					"lastName"=> "",
					"userName"=> "admin",
					"password"=> password_hash($values['password'],PASSWORD_DEFAULT),
					"email"=> $values['admin-email'],
					"phone"=> "",
					"country"=> "",
					"city"=> "",
					"address"=> ""
					);
				$f3->set('users', new \DB\Jig\Mapper($this->db, 'users.json'));
				$f3->get('users')->copyFrom((array)$user);
				$users =$f3->get('users')->save();

				$users = $this->db->read('users.json');
				reset($users);
				$user_id = key($users);

				$configuration = array(
					'system_name' => $values['site-name'],
					'theme'=>'basic',
					'date_format' => 'YYYY'
					);
				$f3->set('sysconfig', new \DB\Jig\Mapper($this->db, 'sysconfig.json'));
				$f3->get('sysconfig')->copyFrom((array)$configuration);
				$f3->get('sysconfig')->save();

				$f3->set('roles', new \DB\Jig\Mapper($this->db, 'roles.json'));
				$role = array(
					'role'=>'Administrator',
					'status' =>1,
					'users' => array($user_id),
					'qty' => 0
					);
				$f3->get('roles')->copyFrom((array)$role);
				$f3->get('roles')->save();

				$f3->set('roles', new \DB\Jig\Mapper($this->db, 'roles.json'));
				$role = array(
					'role'=>'Guest',
					'status' =>1 ,
					'users' => array(),
					'qty' => 0
					);
				$f3->get('roles')->copyFrom((array)$role);
				$f3->get('roles')->save();

				echo Template::instance()->render('templates/setup-created.html');
			}
		}else{
			echo Template::instance()->render('templates/setup-created.html');
		}
	}
}
