app.controller('adminDataCtrl', ['$scope', '$state', '$uibModal', 'Restangular', function($scope, $state, $uibModal, Restangular) {
	// Restangular.setDefaultHeaders({token: "x-restangular aaas"});
	function getData(id) {
		Restangular.all('data').getList({
			filter: {
				table: id
			}
		}).then(function(resp) {
			$scope.data = resp.plain();
			$scope.displayedData = [].concat($scope.data);
		});
	};
	Restangular.all('data').getList({
		filter: {
			table: 'forms',
			where: {
				uniqId: $state.params.id
			}
		}
	}).then(function(resp) {
		if (_.size(resp.plain())) {
			resp = _.first(resp.plain());
			resp.data = angular.fromJson(resp.data);
			getData(resp.uniqId);
			$scope.base = resp;
		};
	});

	$scope.manageRecord = function(id) {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'partials/admin/data-modal.htm',
			controller: 'adminDataManageCtrl',
			// size: 'lg',
			resolve: {
				params: function() {
					return {
						form: $scope.base,
						id: (id) ? id : null
					};
				}
			}
		});
		modalInstance.result.then(function() {
			getData($state.params.id);
		});
	};
	$scope.deleteRecord = function(id) {
		if (confirm("Delete record?")) {
			Restangular.one('data', id).remove({
				table: $state.params.id
			}).then(function() {
				getData($state.params.id);
			});
		};
	};

	$scope.exportToCsv = function () {
		// TODO : exportar a csv, https://github.com/asafdav/ng-csv
	};

	$scope.exportToMysql = function () {
		// TODO: exportar a mysql
	};
}]).controller('adminDataManageCtrl', ['$scope', '$uibModalInstance', 'Restangular', 'params', 'commonFunctions', function($scope, $uibModalInstance, Restangular, params, commonFunctions) {
	if (params.id) {
		Restangular.one('data', params.id).get({
			filter: {
				table: params.form.uniqId
			}
		}).then(function(resp) {
			$scope.model = resp;
		});
	} else {
		$scope.model = _.zipObject(_.map(params.form.data, 'property'), emptyVal);
	};

	function schemaBuilder(data) {
		if (_.map(data, {
				type: 'select'
			})) {
			getDictionaries();
		};
		_.each(data, function(v) {
			if (v.type == 'select') {
				v.list = 'val.label as val.label for val in dicts.' + v.dictionary
			};
		});
		return data;
	};

	// dictionaries 
	function getDictionaries() {
		$scope.dicts = {};
		var temp = _.compact(_.map(params.form.data, 'dictionary'));
		Restangular.all('data').getList({
			filter: {
				table: 'dictionaries',
				fields: ['id', 'data', 'uniqId'],
				where: {
					or: _.map(temp, function(v) {
						return {
							uniqId: v
						}
					})
				}
			}
		}).then(function(resp) {
			_.each(resp.plain(), function(v) {
				$scope.dicts[v.uniqId] = angular.fromJson(v.data)
			});
		});
	};

	// build model and schema
	$scope.schema = schemaBuilder(params.form.data);
	var emptyVal = _.map(_.range($scope.schema.length), function() {
		return ''
	});
	$scope.options = commonFunctions.autoFieldsOpts();
	// save data
	$scope.saveData = function() {
		if (params.id) {
			$scope.model.put({
				table: params.form.uniqId
			}).then(function() {
				alert('updated');
				$uibModalInstance.close();
			});
		} else {
			var form = Restangular.all('data');
			form.post($scope.model, {
				table: params.form.uniqId
			}).then(function(resp) {
				$uibModalInstance.close();
				alert('saved');
			});
		};
	};
	// close modal
	$scope.close = function() {
		$uibModalInstance.dismiss();
	};
}]);
