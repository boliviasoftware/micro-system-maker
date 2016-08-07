app.controller('adminPermissionsCtrl', ['$scope', '$q', 'Restangular', function($scope, $q, Restangular) {
	function fromJson(string) {
		return angular.fromJson(string);
	}

	function getPermissions() {
		var deferred = $q.defer();
		Restangular.all('data').getList({
			filter: {
				table: 'permissions'
			}
		}).then(function(resp) {
			deferred.resolve(resp[0]);
		});
		return deferred.promise;
	};

	function getParams() {
		var deferred = $q.defer();
		Restangular.all('data').getList({
			filter: {
				table: 'forms',
				fields: ['id', 'name', 'status']
			}
		}).then(function(forms) {
			Restangular.all('data').getList({
				filter: {
					table: 'roles',
					fields: ['id', 'role', 'status', 'qty']
				}
			}).then(function(roles) {
				$scope.forms = forms.plain();
				$scope.roles = roles.plain();
				deferred.resolve(true);
			});
		});
		return deferred.promise;
	};

	function buildMatrix() {
		return _.map($scope.forms, function(v1) {
			return _.map($scope.roles, function(v2) {
				return _.map($scope.crud, function(v3) {
					return {
						f: v1.id,
						r: v2.id,
						o: v3[0],
						s: false
					}
				});
			});
		});
	};

	function delFromMatrix(arr, values, type) {
		var out = [];
		_.each(values, function(value) {
			var t = {};
			t[type] = value;
			_.each(arr, function(row) {
				var temp = [];
				_.each(row, function(v) {
					_.pullAllBy(v, _.filter(v, t));
					if (v.length) {
						temp.push(v);
					};
				});
				if (temp.length) {
					out.push(temp);
				};
			});
		});
		return out;
	};

	$scope.crud = ['Create', 'Read', 'Update', 'Delete'];

	var form = Restangular.all('data');
	getPermissions().then(function(resp) {
		getParams().then(function() {
			if (resp && resp.matrix) {
				$scope.response = true;
				resp.matrix = angular.fromJson(resp.matrix);
				// removed
				var noForms = _.difference(resp.initialForms, _.map($scope.forms, 'id'));
				if (noForms.length) {
					resp.matrix = delFromMatrix(resp.matrix, noForms, 'f');
				};
				var noRoles = _.difference(resp.initialRoles, _.map($scope.roles, 'id'));
				if (noRoles.length) {
					resp.matrix = delFromMatrix(resp.matrix, noRoles, 'r');
				};
				// added
				var addForms = _.difference(_.map($scope.forms, 'id'), resp.initialForms);
				if (addForms.length) {
					_.each(addForms, function(v) {
						var temp = _.map($scope.roles, function(v2) {
							return _.map($scope.crud, function(v3) {
								return {
									f: v,
									r: v2.id,
									o: v3[0],
									s: false
								}
							});
						});
						resp.matrix.push(temp);
					});
				};
				var addRoles = _.difference(_.map($scope.roles, 'id'), resp.initialRoles);
				if (addRoles.length) {
					_.each(addRoles, function(value) {
						_.each(resp.matrix, function(row) {
							row.push(_.map($scope.crud, function(v3) {
								return {
									f: _.first(_.map(row[0], 'f')),
									r: value,
									o: v3[0],
									s: false
								}
							}))
						});
					});
				};
				$scope.formModel = resp;
				$scope.formModel.initialForms = _.map($scope.forms, 'id');
				$scope.formModel.initialRoles = _.map($scope.roles, 'id');
				$scope.matrix = resp.matrix;
			} else {
				$scope.matrix = buildMatrix();
				$scope.formModel = {
					permission: '',
					status: 1,
					initialForms: _.map($scope.forms, 'id'),
					initialRoles: _.map($scope.roles, 'id')
				};
			};
		});
	});

	$scope.savePermission = function() {
		$scope.formModel.matrix = angular.toJson($scope.matrix);
		if ($scope.response) {
			$scope.formModel.put({
				table: 'permissions'
			}).then(function(resp) {
				alert('Updated');
				// console.log('updated', resp);
			});
		} else {
			form.post($scope.formModel, {
				table: 'permissions'
			}).then(function(resp) {
				alert('Created');
				// console.log(resp);
			});
		};
	};
}]);
