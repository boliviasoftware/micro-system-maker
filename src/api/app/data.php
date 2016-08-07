<?php
use Underscore\Underscore as __;
class Data extends Common
{
	protected $db;
	protected $token;

	public function __construct() 
	{
		header('Content-Type: application/json; charset=UTF-8');
		$this->db = new DB\Jig('db/', DB\Jig::FORMAT_JSON);
		
		// token retrieve
		$headers = getallheaders();
		Common::check_configuration();
		if ($headers['api-token']) {
			$this->token=Common::jwt_decode($headers['api-token']);
		}else{
			// si no tiene token poner user como guest y validarlo
		}
	}

	private function where_builder($fields) 
	{
		$out[0] = '';
		$temp = '';
		foreach ($fields as $field_key => $field) {
			if ($field_key == 'or') {
				foreach ($field as $k1 => $v1) {
					foreach ($v1 as $k2 => $v2) {
						$var = ($k2 == 'id')? '_id' : $k2;
						$temp .= " || (isset(@$var) && @$var = ? )";
						$out[] = $v2;
					}
				}
			}elseif (is_array($field)) {
				foreach ($field as $k1 => $v1) {
					$var = ($field_key == 'id')? '_id' : $field_key;
					$temp.= " && (isset(@$var) && preg_match(?,@$var) )";
					$out[] = "/$v1/";
				}
			}else{
				$var = ($field_key == 'id')? '_id' : $field_key;
				$temp.= " && (isset(@$field_key) && @$field_key = ? )";
				$out[] = $field;
			}
		}
		if (strlen($temp)) {
			$temp = ltrim($temp, ' && ');
			$temp = ltrim($temp, ' || ');			
		};
		$out[0] = $temp;
		return $out;
	}

	private function options_builder($options) 
	{
		function replace_order($value){
			return preg_replace(array(
				'/DESC/',
				'/ASC/'
				) , array(
				'SORT_DESC',
				'SORT_ASC'
				) , $value);
		}

		$out = array();
		if ($options->limit){
			$out['limit'] = $options->limit;
		}
		if ($options->offset) {
			$out['offset'] = $options->offset;
		}
		if ($options->order){
			if (is_array($options->order)){
				$order = array();
				foreach ($options->order as $key => $value){
					if (preg_match('/DESC|ASC/', $value)){
						$order[] = replace_order($value);
					}
				}
				$out['order'] = implode(', ', $order);
			}else{
				if (preg_match('/DESC|ASC/', $value)) 
				{
					$out['order'] = replace_order($options->order);
				}
			}
		}
		return $out;
	}

	public function query_builder($filter, $table) 
	{
		$temp = $table->load();
		$where = ($filter['where']) ? self::where_builder($filter['where']) : null;
		$options = ($filter['options']) ? self::options_builder($filter['options']) : null;
		if (!$table->load()) {
			exit();
		}

		$records = $table->load()->find($where, $options);

		if (is_array($filter['fields'])){
			if ($filter['fields']){
				$fields = __::intersection($filter['fields'], $table->fields());
			}
		} elseif ($filter['fields']){
			$filter['fields'] = array(
				$filter['fields']
				);
			$fields = __::intersection($filter['fields'], $table->fields());
		}else{
			$fields = $table->fields();
		}

		$out = array();

		foreach ($records as $key => $value) {
			$temp = array();
			$temp['id'] = $value['_id'];
			foreach ($fields as $field){
				if (isset($value[$field]) && $field <> 'password'){
					$temp[$field] = $value[$field];
				}
			}
			$out[] = $temp;
		}
		return $out;
	}

	public function get_list($f3, $args) 
	{
		$filter = json_decode(explode('=', $args[0]) [1], true);
		if ($filter['table']) 
		{
			$table = new \DB\Jig\Mapper($this->db, $filter['table'] . '.json');
			if ($filter['where']['uniqId']) {
				Common::check_permissions('R',$filter['where']['uniqId'],$this->token);
			}else{
				Common::check_permissions('R',$filter['table'],$this->token);
			};
			echo json_encode(self::query_builder($filter, $table));
		} 
		else
		{
			Common::show_error('Table name required', 500);
		}
	}

	public function get_one($f3, $args) 
	{
		$filter = json_decode(explode('=', $args[0]) [1], true); // json -> array
		if ($filter['table']) 
		{
			if ($filter['where']['uniqId']) {
				Common::check_permissions('R',$filter['where']['uniqId'],$this->token);
			}else{
				Common::check_permissions('R',$filter['table'],$this->token);
			};

			if (!$filter['where']) {
				$filter['where'] = array('_id' => $args['id']);
			} 
			else
			{
				$filter['where']['_id'] = $args['id'];
			}
			
			$table = new \DB\Jig\Mapper($this->db, $filter['table'] . '.json');
			echo json_encode(__::first(self::query_builder($filter, $table)));
		} 
		else
		{
			Common::show_error('Table name required', 500);
		}
	}

	public function get_page($f3,$args)
	{
		$filter = json_decode(explode('=', $args[0]) [1], true); // json -> array
		if ($filter['table']) 
		{
			if ($filter['where']['uniqId']) {
				Common::check_permissions('R',$filter['where']['uniqId'],$this->token);
			}else{
				Common::check_permissions('R',$filter['table'],$this->token);
			};

			if (!$filter['where']) {
				$filter['where'] = array('_id' => $args['id']);
			} 
			else
			{
				$filter['where']['_id'] = $args['id'];
			}
			
			$table = new \DB\Jig\Mapper($this->db, $filter['table'] . '.json');
			echo json_encode(__::first(self::query_builder($filter, $table)));
		} 
		else
		{
			Common::show_error('Table name required', 500);
		}
	}
	
	public function post_data($f3, $args) 
	{
		$table = explode('=', $args[0]) [1];
		if ($table) {
			Common::check_permissions('C',$table,$this->token);
			$params = json_decode($f3->get('BODY'));
			$f3->set('data', new \DB\Jig\Mapper($this->db, $table . '.json'));
			$f3->get('data')->copyFrom((array)$params);

			if ($table == 'users') {
				Common::check_uniq_value($f3->get('data')->userName,'users','userName');
				if ($f3->get('data')->password) {
					$f3->get('data')->password = password_hash($f3->get('data')->password, PASSWORD_DEFAULT);
				}
			}

			$result = $f3->get('data')->save();

			if ($table == 'users') {
				unset($result['password']);
			}
			echo json_encode($result);
		}else{
			Common::show_error('Table name required', 500);
		}
	}
	
	public function put_data($f3, $args) 
	{
		$table = explode('=', $args[0]) [1];
		if ($table){
			Common::check_permissions('U',$table,$this->token);
			$params = json_decode($f3->get('BODY'));
			$records = new \DB\Jig\Mapper($this->db, $table . '.json');
			$record = $records->load(['@_id == ?', $args['id']]);
			foreach ($params as $key => $value){
				if (!preg_match('/id/', $key)) {
					if ($table == 'users') {
						// users table "special"						
						if ($key == 'userName' && $value && $value <> $record[$key]) {
							Common::check_uniq_value($value,'users','userName');
							$record[$key] = $value;
						}

						if ($key == 'password' && $value) {
							$record[$key] = password_hash($value, PASSWORD_DEFAULT);
						}

					}else{
						$record[$key] = $value;
					}
				}
			}
			$result = $record->update();
			if ($table == 'users') {
				unset($result['password']);
			}
			echo json_encode($result);
		} else{
			Common::show_error('Table name required', 500);
		};
	}
	
	public function delete_data($f3, $args) 
	{
		$table = explode('=', $args[0]) [1];
		if ($table){
			Common::check_permissions('D',$table, $this->token);
			// $records = new \DB\Jig\Mapper($this->db, $table . '.json');
			// $record = $records->load(['@_id == ?', $args['id']]);
			// $result = $record->erase();
			// echo json_encode($result);
		}else{
			Common::show_error('Table name required', 500);
		}
	}
	
	public function get_last($f3, $args) 
	{
		$filter = json_decode(explode('=', $args[0]) [1], true); // json -> array
		if ($filter['table']) 	{
			$table = new \DB\Jig\Mapper($this->db, $filter['table'] . '.json');
			echo json_encode(array(__::last(self::query_builder($filter, $table))));
		} else{
			Common::show_error('Table name required', 500);
		};
	}

	public function get_fields($table) 
	{
		// TODO: obtener campos desde el ultimo, el del medio y el final haciendo un promedio de campos
	}
}

/*
private function where_builder($fields) 
	{
		$out[0] = '';
		$temp = array();

		function build($value)
		{
			if (isset($value->like)) 
			{
				$temp[] = "(isset(@$key) && preg_match(?,@$key) )";
				$out[] = "/$value->like/";
			} 
			else
			{
				$temp[] = "(isset(@$key) && @$key = ? )";
				$out[] = $value;
			}
		}
		foreach ($fields as $key => $value) 
		{
			if (is_array($value)) {
				var_dump($value);
			}else{
				build($value);
			};
		};
		$out[0] = implode(' && ', $temp);
		return $out;
	}
	expired: 

	eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwidXNlcmlkIjoiNTZhZTllODkzYTlhMjIuNDcwNTAxOTAiLCJ0dGwiOiIifQ.Tiku-12oMxqzhUoTf4RRgtWMb16FR4GU3cJ1paJwpl0
 */