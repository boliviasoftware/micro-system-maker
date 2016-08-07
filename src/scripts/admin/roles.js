app.controller('adminRolesCtrl', ['$scope', '$uibModal', 'Restangular', function($scope, $uibModal, Restangular) {
	// console.log('roles');
	$scope.itemsByPage = 10;
	$scope.roles = [];

	function getData() {
		Restangular.all('data').getList({
			filter: {
				table: 'roles'
			}
		}).then(function(resp) {
			$scope.roles = resp.plain();
		});
	};

	function openModal(id) {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'partials/admin/roles-modal.htm',
			controller: 'adminRolesModalCtrl',
			size: 'lg',
			resolve: {
				params: function() {
					return {
						id: (id) ? id : false
					};
				}
			}
		});

		modalInstance.result.then(function() {
			getData();
		}, function() {
			$scope.formModel = {};
		});
	};
	$scope.addRecord = function() {
		openModal();
	};
	$scope.editRecord = function(id) {
		openModal(id);
	};
	$scope.deleteRecord = function(id) {
		if (confirm("Delete record?")) {
			Restangular.one('data', id).remove({
				table: 'roles'
			}).then(function(resp) {
				getData();
			});
		};
	};
	getData();
}]).controller('adminRolesModalCtrl', ['$scope', '$q', '$uibModalInstance', 'params', 'Restangular', 'commonFunctions', function($scope, $q, $uibModalInstance, params, Restangular, commonFunctions) {
	// manage users:
	$scope.manageUsers = function(rem) {
		function match(a, b) {
			return _.filter($scope.groups[a], function(v) {
				return _.includes($scope.groups[b], v.id);
			});
		};

		function delElem(a, b) {
			_.each($scope.groups[a], function(v, key, list) {
				$scope.groups[b] = _.without($scope.groups[b], _.find($scope.groups[b], {
					id: v
				}));
			});
		};
		if (!rem) {
			$scope.groups.assigned = _.union($scope.groups.assigned, match('unassigned', 'left'));
			delElem('left', 'unassigned');
			$scope.groups.left = [];
		} else {
			$scope.groups.unassigned = _.union($scope.groups.unassigned, match('assigned', 'right'));
			delElem('right', 'assigned');
			$scope.groups.right = [];
		};
	};

	function getUsers() {
		var deferred = $q.defer();
		Restangular.all('data').getList({
			filter: {
				table: 'users',
				fields: ['id', 'firstName', 'lastName']
			}
		}).then(function(resp) {
			deferred.resolve(resp.plain());
		});
		return deferred.promise;
	};

	if (params.id) {
		Restangular.one('data', params.id).get({
			filter: {
				table: 'roles'
			}
		}).then(function(resp) {
			resp.users = angular.fromJson(resp.users);
			$scope.formModel = resp;
			getUsers().then(function(users) {
				$scope.groups = {
					left: [],
					right: [],
					unassigned: _.filter(users, function(v) {
						return !_.includes(resp.users, v.id);
					}),
					assigned: _.filter(users, function(v) {
						return _.includes(resp.users, v.id);
					})
				};
			});
		});
	} else {
		var form = Restangular.all('data');
		$scope.formModel = {
			role: '',
			status: 1,
			users: [],
			qty: ''
		};
		getUsers().then(function(users) {
			$scope.groups = {
				left: [],
				right: [],
				unassigned: users,
				assigned: []
			};
		});
	};
	$scope.schema = [{
		property: 'role',
		type: 'text',
		attr: {
			required: true
		}
	}, {
		property: 'status',
		type: 'select',
		list: 'i.v as i.l for i in [{v:0,l:"Disabled"},{v:1,l:"Enabled"}]',
		attr: {
			required: true
		}
	}];
	$scope.options = commonFunctions.autoFieldsOpts();
	$scope.saveRole = function() {
		if (params.id) {
			$scope.formModel.qty = $scope.groups.assigned.length;
			$scope.formModel.users = angular.toJson(_.map($scope.groups.assigned, 'id'));
			$scope.formModel.put({
				table: 'roles'
			}).then(function() {
				$uibModalInstance.close();
			});
		} else {
			$scope.formModel.qty = $scope.groups.assigned.length;
			$scope.formModel.users = angular.toJson(_.map($scope.groups.assigned, 'id'));
			form.post($scope.formModel, {
				table: 'roles'
			}).then(function() {
				$uibModalInstance.close();
			});
		};
	};
	// modal close
	$scope.close = function() {
		$uibModalInstance.dismiss('cancel');
	};
}])
