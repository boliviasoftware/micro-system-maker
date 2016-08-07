'use strict';
app.directive('uiSrefActiveIf', ['$state', function($state) {
	return {
		restrict: "A",
		link: function(scope, elem, attrs) {
			var state = attrs.uiSrefActiveIf;
			// console.log(state);

			function update() {
				if ($state.includes(state) || $state.is(state)) {
					elem.addClass("active");
				} else {
					elem.removeClass("active");
				}
			}
			scope.$on('$stateChangeSuccess', update);
			update();
		}
	};
}]).directive('adminHeader', ['Restangular', '$window', '$rootScope', function(Restangular, $window, $rootScope) {
	return {
		restrict: 'E',
		templateUrl: 'partials/admin/header.htm',
		link: function(scope, elem, attrs) {
			function getDataMenu(a) {
				Restangular.all('data').getList({
					filter: {
						table: 'forms',
						fields: ['uniqId', 'name']
					}
				}).then(function(resp) {
					// console.log(a);
					scope.dataItems = resp.plain();
				});
			};
			scope.config = angular.fromJson($window.localStorage.getItem('config'));
			getDataMenu();
			// $rootScope.$on('updatedForms', getDataMenu(133));
		}
	};
}]).directive('frontHeader', ['Restangular', function(Restangular) {
	return {
		restrict: 'E',
		templateUrl: 'partials/front/header.htm',
		link: function(scope, elem, attrs) {
			Restangular.all('data').getList({
				filter: {
					table: 'fpages',
					fields: ['id', 'title', 'description']
				}
			}).then(function(resp) {
				scope.menu = resp.plain();
			});

			scope.goToPage = function (id,e) {
				var test = angular.element(document.getElementById('headerLeftMenu'));
				 test.addClass('hidden')
				// angular.element(e.target).parents('.nav').find('li').removeClass('active');
				// angular.element(e.target).addClass('active');
				console.log(angular.element(e.target));
			}
		}
	};
}])
