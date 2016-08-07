app.controller('adminListFormsCtrl', ['$scope', 'Restangular', function($scope, Restangular) {
	$scope.itemsByPage = 10;
	$scope.forms = [];

	function getData() {
		Restangular.all('data').getList({
			filter: {
				table: 'forms',
				fields: ['id', 'description', 'fieldCounter', 'name', 'status']
			}
		}).then(function(resp) {
			$scope.forms = resp;
			$scope.displayedForms = [].concat($scope.forms);
		});
	};
	$scope.delete = function(id) {
		console.log(id);
		if (confirm("Delete record?")) {
			Restangular.one('data', id).remove({
				table: 'forms'
			}).then(function(resp) {
				getData();
			});
		};
	};
	getData();
}]).controller('adminManageFormCtrl', ['$scope', '$rootScope', '$state', '$stateParams', 'Restangular', 'commonFunctions', function($scope, $rootScope, $state, $stateParams, Restangular, commonFunctions) {
	////////////////
	// basic data //
	////////////////
	var count;
	if ($stateParams.id) {
		Restangular.one('data', $stateParams.id).get({
			filter: {
				table: 'forms'
			}
		}).then(function(resp) {
			$scope.items = angular.fromJson(resp.data);
			var last = _.last($scope.items, 1);
			if (last && last.id) {
				count = last.id + 1;
			} else {
				count = 1;
			};
			$scope.formModel = resp;
		});
	} else {
		var form = Restangular.all('data');
		$scope.formModel = {
			name: '',
			description: '',
			status: true
		};
		count = 1;
		// initForm();
	}
	$scope.schema = [{
		property: 'name',
		label: 'Form name',
		type: 'text',
		attr: {
			required: true
		}
	}, {
		property: 'status',
		type: 'select',
		list: 'item.val as item.label for item in statusList'
	}, {
		property: 'description',
		type: 'textarea'
	}];
	$scope.statusList = [{
		val: true,
		label: 'Enabled'
	}, {
		val: false,
		label: 'Disabled'
	}];
	$scope.datesFormats = [{
		key: 'medium',
		label: 'Sep 3, 2010 12:05:08 PM'
	}, {
		key: 'short',
		label: '9/3/10 12:05 PM'
	}, {
		key: 'fullDate',
		label: 'Friday, September 3, 2010'
	}, {
		key: 'longDate',
		label: 'September 3, 2010'
	}, {
		key: 'mediumDate',
		label: 'Sep 3, 2010'
	}, {
		key: 'shortDate',
		label: '9/3/10'
	}, {
		key: 'mediumTime',
		label: '12:05:08 PM'
	}, {
		key: 'shortTime',
		label: '12:05 PM'
	}];
	$scope.options = commonFunctions.autoFieldsOpts();

	// dictionaries
	Restangular.all('data').getList({
		filter: {
			table: 'dictionaries',
			fields: ['uniqId', 'name']
		}
	}).then(function(resp) {
		$scope.dictionaries = resp.plain();
	});

	////////////////////
	// fields manager //
	////////////////////
	$scope.items = [];
	$scope.showOptions = function(index) {
		$scope.selectedField = $scope.items[index];
	};
	$scope.dateFormat = 'fullDate';
	// autofields types
	$scope.fieldTypes = [{
		key: "text",
		label: 'Text'
	}, {
		key: "number",
		label: 'Number'
	}, {
		key: "email",
		label: 'Email'
	}, {
		key: "date",
		label: 'Date Picker'
	}, {
		key: "checkbox",
		label: 'Checkbox'
	}, {
		key: "select",
		label: 'Dropdown'
	}, {
		key: "textarea",
		label: 'Text Area'
	}];
	// field management
	$scope.temp = {};
	$scope.fakeModel = {};
	// if ($scope.form.data) {
	// 	$scope.items = angular.fromJson($scope.form.data);
	// 	count = $scope.form.fieldCounter + 1;
	// };
	$scope.addField = function() {
		var item = {
			id: count,
			type: 'text',
			label: 'Label ' + count,
			property: 'field' + count,
			dictionary: '',
			description: '',
			help: '',
			fdate: '',
			attr: {
				required: false,
			}
		};
		$scope.fakeModel['field' + count] = '';
		$scope.fakeModel['opened' + count] = false;
		$scope.items.push(item);
		$scope.selectedField = _.last($scope.items);
		count++;
	};
	$scope.removeField = function(index) {
		$scope.items.splice(index, 1);
	};
	$scope.focusField = function(index) {
		$scope.selectedField = $scope.items[index];
	};
	$scope.moveField = function(index, up) {
		if (up) {
			var temp = $scope.items[index - 1];
			$scope.items[index - 1] = $scope.items[index];
			$scope.items[index] = temp;
		} else {
			var temp = $scope.items[index + 1];
			$scope.items[index + 1] = $scope.items[index];
			$scope.items[index] = temp;
		};
	};
	$scope.refreshFake = function() {
		$scope.fakeModel['field' + $scope.selectedField.id] = '';
	};
	// build and save form data
	$scope.saveForm = function() {
		if (_.size($scope.items)) {
			$scope.formModel.data = angular.toJson($scope.items);
			$scope.formModel.fieldCounter = $scope.items.length;
			if ($stateParams.id) {
				$scope.formModel.put({
					table: 'forms'
				}).then(function(resp) {
					$rootScope.$broadcast("updatedForms");
					$state.go('admin.listforms');
				});
			} else {
				$scope.formModel.uniqId = commonFunctions.uniqid('form_');
				form.post($scope.formModel, {
					table: 'forms'
				}).then(function(resp) {
					$rootScope.$broadcast("updatedForms");
					$state.go('admin.listforms');
				});
			};
		} else {
			alert('You need at least 1 field');
		};
	};
}]);

