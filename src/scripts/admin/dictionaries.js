app.controller('adminDictionariesCtrl', ['$scope', '$uibModal', 'Restangular', function($scope, $uibModal, Restangular) {
	$scope.itemsByPage = 10;
	$scope.dictionaries = [];

	function getData() {
		Restangular.all('data').getList({
			filter: {
				table: 'dictionaries'
			}
		}).then(function(resp) {
			// console.log(resp);
			$scope.dictionaries = resp;
			$scope.displayedDictionaries = [].concat($scope.dictionaries);
		});
	};

	function openModal(id) {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'partials/admin/dictionaries-modal.htm',
			controller: 'adminDictionariesModalCtrl',
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
				table: 'dictionaries'
			}).then(function(resp) {
				getData();
			});
		};
	};
	getData();
}]).controller('adminDictionariesModalCtrl', ['$scope', '$uibModalInstance', 'params', 'commonFunctions', 'Restangular', function($scope, $uibModalInstance, params, commonFunctions, Restangular) {
	if (params.id) {
		Restangular.one('data', params.id).get({
			filter: {
				table: 'dictionaries'
			}
		}).then(function(resp) {
			// resp.data = angular.fromJson(resp.data);
			$scope.items = angular.fromJson(resp.data);
			$scope.formModel = resp;
		});
	} else {
		var form = Restangular.all('data');
		$scope.formModel = {
			name: '',
			description: '',
			data: [],
		};
		$scope.items = [];
	};

	$scope.numOpts = _.range(1, 5);

	$scope.schema = [{
		property: 'name',
		label: 'Dictionary name',
		type: 'text',
		attr: {
			required: true
		}
	}, {
		property: 'description',
		label: 'Description',
		type: 'textarea'
	}];

	$scope.addItems = function(num) {
		for (var i = 0; i < num; i++) {
			$scope.items.push({
				label: '',
				isNew: true
			});
		};
	};

	$scope.delItem = function(index) {
		$scope.items.splice(index, 1);
	};

	function delItems(items, all) {
		// console.log(items);
		for (var i = items.length; i--;) {
			if (all && items[i].isNew) {
				items.splice(i, 1);
			} else if (!items[i].label.length) {
				items.splice(i, 1);
			} else {
				delete items[i].isNew;
			}
		};
		return items;
	};

	$scope.saveTable = function() {
		$scope.formModel.data = angular.toJson(delItems($scope.items));
		$scope.formModel.qty = $scope.items.length;
	};

	$scope.cancelItems = function() {
		delItems($scope.items, true);
	};

	$scope.saveForm = function() {
		$scope.saveTable();
		if (params.id) {
			$scope.formModel.put({
				table: 'dictionaries'
			}).then(function() {
				// $state.go('admin.listforms');
				$uibModalInstance.close();
			});
		} else {
			$scope.formModel.uniqId = commonFunctions.uniqid('dict_');
			form.post($scope.formModel, {
				table: 'dictionaries'
			}).then(function() {
				$uibModalInstance.close();
			});
		};
	};

	$scope.close = function() {
		$uibModalInstance.dismiss('cancel');
	};
}])
