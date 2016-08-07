app.controller('adminLoginCtrl', ['$scope', '$window', '$state', '$q', 'Restangular', function($scope, $window, $state, $q, Restangular) {
	function showError(string) {
		alert(string);
	};

	function checkServerStatus() {
		var deferred = $q.defer();
		var server = Restangular.all('status');
		server.head().then(function(good) {
			deferred.resolve(good);
		}, function(bad) {
			deferred.reject(bad);
		});
		return deferred.promise;
	};

	if ($window.localStorage.getItem('expired')) {
		$window.localStorage.removeItem('expired');
		$scope.expired = true;
	};
	$scope.loginData = {};
	$scope.login = function() {
		checkServerStatus().then(function() {
			var form = Restangular.all('login');
			form.post($scope.loginData).then(function(resp) {
				if (resp && resp.token) {
					Restangular.all('data').getList({
						filter: {
							table: 'sysconfig',
							fields: ['system_name', 'theme']
						},
					}).then(function(config) {
						var config = _.head(config.plain());
						$window.localStorage.setItem('config', angular.toJson(_.pick(config, ['system_name', 'theme'])));
						$window.localStorage.setItem('api-key', resp.token);
						$window.localStorage.setItem('userData', angular.toJson(resp.data));
						$state.go('admin.listforms');
					});
				} else {
					showError('Try later');
				};
			}, function(err) {
				if (err && err.data) {
					showError(err.data.message);
				} else {
					showError('Try again later');
				};
			});
		}, function(bad) {
			console.log('bad', bad);
		});
	};
}]);
