app.controller('adminSysConfigCtrl', ['$scope', 'Restangular', '$uibModal', function($scope, Restangular, $uibModal) {

	$scope.configOptions = {
		theme: ['basic'],
		// dateFormat: []
	};

	Restangular.all('data').getList({
		filter: {
			table: 'sysconfig'
		}
	}).then(function(resp) {
		$scope.configData = resp[0];
	});

	$scope.saveConfig = function() {
		$scope.configData.put({
			table: 'sysconfig'
		}).then(function(resp) {
			alert('updated');
		});
	};

}]);

