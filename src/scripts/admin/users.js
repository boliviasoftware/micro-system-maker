app.controller('adminUsersCtrl', ['$scope', '$uibModal', 'Restangular', function($scope, $uibModal, Restangular) {
	// console.log('users');
	$scope.itemsByPage = 10;
	$scope.users = [];

	function getData() {
		Restangular.all('data').getList({
			filter: {
				table: 'users'
			}
		}).then(function(resp) {
			// console.log(resp);
			$scope.users = resp;
			$scope.displayedUsers = [].concat($scope.users);
		});
	};

	function openModal(id) {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'partials/admin/users-manage.htm',
			controller: 'adminUsersModalCtrl',
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
				table: 'users'
			}).then(function(resp) {
				getData();
			});
		};
	};
	getData();
}]).controller('adminUsersModalCtrl', ['$scope', '$uibModalInstance', 'params', 'Restangular', function($scope, $uibModalInstance, params, Restangular) {

	Restangular.all('assets').getList({
		filter: {
			table: 'countries'
		}
	}).then(function(resp) {
		$scope.countries = resp.plain()[0];
	});

	if (params.id) {
		Restangular.one('data', params.id).get({
			filter: {
				table: 'users'
			}
		}).then(function(resp) {
			$scope.formModel = resp;
		});
	} else {
		var form = Restangular.all('data');
		$scope.formModel = {
			firstName: '',
			lastName: '',
			userName: '',
			password: '',
			email: '',
			phone: '',
			country: '',
			city: '',
			address: '',
		};
	};
	// TODO: Github issue https://github.com/JustMaier/angular-autoFields-bootstrap/issues/46
	/*$scope.schema = [];
	$scope.schema = [{
			type: 'multiple',
			fields: [{
				property: 'firstName',
				label: 'First Name',
				type: 'text',
				columns: 6
			}, {
				property: 'lastName',
				label: 'Last Name',
				type: 'text',
				columns: 6
			}]
		}, {
			type: 'multiple',
			fields: [{
				property: 'userName',
				label: 'User Name',
				type: 'text',
				columns: 6,
				attr: {
					autocomplete: 'nope'
				}
			}, {
				property: 'password',
				label: 'Password',
				type: 'password',
				columns: 6,
				attr: {
					autocomplete: 'nope'
				}
			}]
		}, {
			type: 'multiple',
			fields: [{
				property: 'email',
				label: 'Email',
				type: 'email',
				columns: 6
			}, {
				property: 'phone',
				label: 'Phone',
				type: 'text',
				columns: 6
			}]
		}, {
			type: 'multiple',
			fields: [{
				property: 'country',
				label: 'Country',
				type: 'select',
				list: 'key as value for (key,value) in countries',
				columns: 6
			}, {
				property: 'city',
				label: 'City',
				type: 'text',
				columns: 6
			}]
		}, {
			property: 'address',
			label: 'Address',
			type: 'textarea'
		}
	];
	$scope.options = {
		validation: {
			enabled: true,
			showMessages: false
		},
		layout: {
			type: 'basic',
			labelSize: 3,
			inputSize: 9
		}
	};*/
	$scope.saveUser = function() {
		if (params.id) {
			$scope.formModel.put({
				table: 'users'
			}).then(function(resp) {
				$uibModalInstance.close();
				alert('Updated');
			});
		} else {
			form.post($scope.formModel, {
				table: 'users'
			}).then(function(resp) {
				$uibModalInstance.close();
			});
		};
	};
	$scope.close = function() {
		$uibModalInstance.dismiss('cancel');
	};
}])
