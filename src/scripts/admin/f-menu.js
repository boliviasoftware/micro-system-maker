app.controller('adminFrontMenuCtrl', ['$scope', 'Restangular', '$uibModal', function($scope, Restangular, $uibModal) {
	function getData() {
		Restangular.all('data').getList({
			filter: {
				table: 'fmenu'
			}
		}).then(function(resp) {
			$scope.menu = resp.plain();
			$scope.displayedMenu = [].concat($scope.menu);
		});
	};

	$scope.manageRecord = function(id) {
		var modalInstance = $uibModal.open({
			animation: true,
			templateUrl: 'partials/admin/front-menu-manage.htm',
			controller: 'adminFrontMenuManageCtrl',
			// size: 'lg',
			resolve: {
				params: function() {
					return {
						id: (id) ? id : false
					};
				}
			}
		});
		modalInstance.result.then(getData);
	};
	$scope.delete = function(id) {
		if (confirm("Delete record?")) {
			Restangular.one('data', id).remove({
				table: 'fmenu'
			}).then(function(resp) {
				getData();
			});
		};
	};

	getData();
}]).controller('adminFrontMenuManageCtrl', ['$scope', '$uibModalInstance', 'params', 'commonFunctions', 'Restangular', function($scope, $uibModalInstance, params, commonFunctions, Restangular) {
	Restangular.all('data').getList({
		filter: {
			table: 'fpages',
			fields: ['id', 'title']
		}
	}).then(function(pages) {
		$scope.pages = pages.plain();
	});

	if (params.id) {
		Restangular.one('data', params.id).get({
			filter: {
				table: 'fmenu'
			}
		}).then(function(resp) {
			$scope.formModel = resp;
		});
	} else {
		var form = Restangular.all('data');
		$scope.formModel = {
			name: '',
			status: 1,
			page: '',
			description: '',
			comments: 0
		};
	};
	$scope.schema = [{
		property: 'name',
		type: 'text',
		attr: {
			required: true
		}
	}, {
		property: 'status',
		label: 'Enabled?',
		type: 'checkbox'
	}, {
		property: 'page',
		type: 'select',
		list: 'it.id as it.title for it in pages',
		attr: {
			required: true
		}
	}, {
		property: 'description',
		type: 'textarea'
	}, {
		property: 'comments',
		label: 'Enable Disqus comments system?',
		type: 'checkbox'
	}];

	$scope.options = commonFunctions.autoFieldsOpts();

	$scope.saveMenu = function() {
		if (params.id) {
			$scope.formModel.put({
				table: 'fmenu'
			}).then(function(resp) {
				$uibModalInstance.close();
			});
		} else {
			$scope.formModel.uniqId = commonFunctions.uniqid('form_');
			form.post($scope.formModel, {
				table: 'fmenu'
			}).then(function(resp) {
				$uibModalInstance.close();
			});
		};
	};

	// modal close
	$scope.close = function() {
		$uibModalInstance.dismiss('cancel');
	};
}]);

