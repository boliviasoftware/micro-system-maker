'use strict';
var app = angular.module('msm', ['ui.router', 'restangular', 'ui.bootstrap', 'autofields', 'angular-loading-bar', 'smart-table', 'xeditable', 'servs', 'ipsum']);
app.config(['$stateProvider', '$urlRouterProvider', '$injector', 'RestangularProvider', function($stateProvider, $urlRouterProvider, $injector, RestangularProvider) {
	RestangularProvider.setBaseUrl('api');
	RestangularProvider.addFullRequestInterceptor(function(element, operation, route, url, headers, params, httpConfig) {
		if (window.localStorage.getItem('api-key')) {
			headers['api-token'] = window.localStorage.getItem('api-key');
		};
		return element;
	});
	RestangularProvider.setErrorInterceptor(function(response, deferred, responseHandler) {
		if (response && response.data) {
			if (_.indexOf([404, 409], response.status) >= 0) {
				alert(response.data);
				return true;
			} else if (response.status == 403) {
				alert(response.data);
				var locationParts = window.location.href.split('/');
				if (_.indexOf(locationParts, 'admin')) {
					window.history.back(-1);
				}
			} else if (response.status == 428) {
				alert('The backend server requires to run the setup script');
				window.location.href = './api/setup';
			} else {
				window.localStorage.setItem('expired', true);
				window.location.href = '#/admin/logout';
				return false;
			}
		} else {
			return true;
		};
	});
	$urlRouterProvider.otherwise("/admin/login");
	// admin
	$stateProvider.state('admin', {
		url: '/admin',
		log: true,
		abstract: true,
		template: '<div ui-view="adminView"></div>',
	}).state('admin.listforms', {
		url: '/list-forms',
		log: true,
		views: {
			"adminView": {
				templateUrl: 'partials/admin/form-list.htm',
				controller: 'adminListFormsCtrl'
			}
		}
	}).state('admin.addform', {
		url: '/add_form',
		log: true,
		views: {
			"adminView": {
				templateUrl: 'partials/admin/form-manage.htm',
				controller: 'adminManageFormCtrl'
			}
		}
	}).state('admin.editform', {
		url: '/edit_form/:id',
		log: true,
		views: {
			"adminView": {
				templateUrl: 'partials/admin/form-manage.htm',
				controller: 'adminManageFormCtrl'
			}
		}
	}).state('admin.roles', {
		url: '/roles',
		log: true,
		views: {
			"adminView": {
				templateUrl: 'partials/admin/roles-list.htm',
				controller: 'adminRolesCtrl'
			}
		}
	}).state('admin.permissions', {
		url: '/permissions',
		log: true,
		views: {
			"adminView": {
				templateUrl: 'partials/admin/permissions-list.htm',
				controller: 'adminPermissionsCtrl'
			}
		}
	}).state('admin.users', {
		url: '/users',
		log: true,
		views: {
			"adminView": {
				templateUrl: 'partials/admin/users-list.htm',
				controller: 'adminUsersCtrl'
			}
		}
	}).state('admin.dictionaries', {
		url: '/dictionaries',
		log: true,
		views: {
			"adminView": {
				templateUrl: 'partials/admin/dictionaries-list.htm',
				controller: 'adminDictionariesCtrl'
			}
		}
	}).state('admin.data', {
		url: '/data/:id',
		log: true,
		views: {
			"adminView": {
				templateUrl: 'partials/admin/data-list.htm',
				controller: 'adminDataCtrl'
			}
		}
	}).state('admin.fpagesList', {
		url: '/frontend/pages',
		log: true,
		views: {
			"adminView": {
				templateUrl: 'partials/admin/front-pages-list.htm',
				controller: 'adminFrontPagesCtrl'
			}
		}
	}).state('admin.fpagesEdit', {
		url: '/frontend/pages/:id',
		log: true,
		views: {
			"adminView": {
				templateUrl: 'partials/admin/front-pages-manage.htm',
				controller: 'adminFrontPagesManageCtrl'
			}
		}
	}).state('admin.fmenuList', {
		url: '/frontend/menu',
		log: true,
		views: {
			"adminView": {
				templateUrl: 'partials/admin/front-menu-list.htm',
				controller: 'adminFrontMenuCtrl'
			}
		}
	}).state('admin.sConfig', {
		url: '/system-config',
		log: true,
		views: {
			"adminView": {
				templateUrl: 'partials/admin/system-config.htm',
				controller: 'adminSysConfigCtrl'
			}
		}
	}).state('admin.login', {
		url: '/login',
		log: true,
		views: {
			"adminView": {
				templateUrl: 'partials/admin/login.htm',
				controller: 'adminLoginCtrl'
			}
		}
	}).state('admin.logout', {
		url: '/logout',
		views: {
			"adminView": {
				// templateUrl: 'partials/admin/login.htm',
				controller: ['$state', '$window', function($state, $window) {
					$window.localStorage.removeItem("api-key");
					$window.localStorage.removeItem("userData");
					$window.localStorage.removeItem("config");
					$state.go('admin.login');
				}]
			}
		}
	});
	// frontpage
	$stateProvider.state('front', {
		abstract: true,
		template: '<front-header></front-header><div ui-view="frontView"></div>',
	}).state('front.home', {
		url: '/',
		views: {
			"frontView": {
				templateUrl: 'partials/front/home.htm',
				controller: 'frontHomeCtrl'
			}
		},
	});

}]);
app.run(['$window', 'editableOptions', 'Restangular', function($window, editableOptions, Restangular) {
	// x-editable
	editableOptions.theme = 'bs3';
	// TODO: ver el tema de log en ui-router
}]);
// angular.element(document).ready(function() {
//  angular.bootstrap(document, ['msm']);
// });

