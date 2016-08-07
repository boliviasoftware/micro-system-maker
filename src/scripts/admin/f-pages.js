app.controller('adminFrontPagesCtrl', ['$scope', 'Restangular', '$uibModal', function($scope, Restangular, $uibModal) {
	$scope.itemsByPage = 10;
	$scope.pages = [];

	function getData() {
		Restangular.all('data').getList({
			filter: {
				table: 'fpages'
			}
		}).then(function(resp) {
			$scope.pages = resp.plain();
			$scope.displayedPages = [].concat($scope.pages);
		});
	};
	$scope.deleteRecord = function(id) {
		if (confirm("Delete record?")) {
			Restangular.one('data', id).remove({
				table: 'fpages'
			}).then(function(resp) {
				getData();
			});
		};
	};
	getData();
}]).controller('adminFrontPagesManageCtrl', ['$scope', '$state', '$q', 'commonFunctions', 'Restangular', function($scope, $state, $q, commonFunctions, Restangular) {
	$scope.configOptions = {
		viewTypes: ['table', 'form', 'row', 'custom'],
		align: ['left', 'right', 'justify'],
		fieldView: ['row', 'form'],
		columns: _.range(4, 13, 2),
		selField: '',
		fonts: [{
			label: '"Times New Roman", Times, serif',
			class: 'times'
		}, {
			label: '"Arial Black", Gadget, sans-serif',
			class: 'arial'
		}, {
			label: '"Palatino Linotype", "Book Antiqua", Palatino, serif',
			class: 'palatino'
		}, {
			label: '"Comic Sans MS", cursive, sans-serif',
			class: 'comic'
		}, {
			label: '"Lucida Sans Unicode", "Lucida Grande", sans-serif',
			class: 'lucida'
		}, {
			label: '"Trebuchet MS", Helvetica, sans-serif',
			class: 'trebuchet'
		}, {
			label: '"Courier New", Courier, monospace',
			class: 'courier'
		}],
		statusTypes: [{
			val: true,
			label: 'Enabled'
		}, {
			val: false,
			label: 'Disabled'
		}],
		fontSize: _.range(8, 29, 2)
	};

	$scope.actions = {
		changeForm: function() {
			$scope.selectedForm = _.find($scope.forms, {
				uniqId: $scope.formModel.form
			});
			$scope.formModel.content = '';
			$scope.items = [];
		}
	};

	var count;

	if ($state.params.id == 'add') {
		$scope.addPage = true;
		var form = Restangular.all('data');
		getForms().then(function() {
			$scope.formModel = {
				title: '',
				meta: '',
				description: '',
				content: '',
				form: '',
				tview: 'table',
				status: true,
				comments: false
			};
			$scope.items = [];
			count = 1;
		});

	} else {
		$scope.addPage = false;
		getForms().then(function() {
			Restangular.one('data', $state.params.id).get({
				filter: {
					table: 'fpages'
				}
			}).then(function(resp) {
				$scope.items = angular.fromJson(resp.content);
				$scope.selectedForm = _.find($scope.forms, {
					uniqId: resp.form
				});
				var last = _.last($scope.items, 1);
				if (last && last.id) {
					count = last.id + 1;
				} else {
					count = 1;
				};
				$scope.formModel = resp;
			});
		});
	};

	// TODO async forms 
	function getForms() {
		var deferred = $q.defer();
		Restangular.all('data').getList({
			filter: {
				table: 'forms',
				fields: ['uniqId', 'name', 'description', 'data']
			},
		}).then(function(resp) {
			_.each(resp, function(v) {
				v.data = angular.fromJson(v.data);
			});
			$scope.forms = resp;
			deferred.resolve(true);
		});
		return deferred.promise;
	};

	$scope.schema = [{
		property: 'title',
		type: 'text',
		attr: {
			required: true
		}
	}, {
		property: 'form',
		label: 'Available forms',
		type: 'select',
		list: 'item.uniqId as item.name for item in forms',
		attr: {
			required: true,
			ngChange: 'actions.changeForm()'
		}
	}, {
		property: 'tview',
		label: 'Type of view',
		type: 'select',
		list: 'item for item in configOptions.viewTypes',
		attr: {
			required: true,
			ngShow: '$data.form'
		}
	}, {
		property: 'status',
		type: 'select',
		list: 'item.val as item.label for item in configOptions.statusTypes',
		attr: {
			ngShow: '$data.form'
		}
	}, {
		property: 'meta',
		label: 'Meta tags',
		type: 'textarea'
	}, {
		property: 'description',
		type: 'textarea'
	}];

	////////////////////
	// fields manager //
	////////////////////
	$scope.items = [];
	$scope.addField = function() {
		if ($scope.configOptions.selField) {
			var field = _.find($scope.selectedForm.data, {
				id: $scope.configOptions.selField
			});
			// console.log($scope.configOptions.selField);
			var item = {
				id: count,
				fieldId: field.id,
				label: true,
				align: 'left',
				font: '',
				fieldView: '',
				columns: 12,
				fsize: ''
			};
			$scope.items.push(item);
			$scope.selectedField = _.last($scope.items);
			count++;
		} else {
			alert('First select one field');
		};
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

	$scope.getLabel = function(id) {
		var temp = _.find($scope.selectedForm.data, {
			id: id
		});
		return (temp) ? temp.label : 'N/A';
	};

	$scope.getRowClass = function(item) {
		var out = 'text-' + item.align;
		if (item.font) {
			out += ' font-' + item.font
		};
		if (item.fsize) {
			out += ' fz-' + item.fsize
		};
		return out;
	};
	///////////////
	// save page //
	///////////////
	$scope.savePage = function() {
		$scope.formModel.content = angular.toJson($scope.items);
		$scope.formModel.alias = _.kebabCase(_.lowerCase(_.deburr($scope.formModel.title)))
		if (!$scope.items.length) {
			alert('You need at least 1 field!');
		} else {
			if ($scope.addPage) {
				form.post($scope.formModel, {
					table: 'fpages'
				}).then(function(resp) {
					alert('Saved');
					$state.go('admin.fpagesList');
				});
			} else {
				$scope.formModel.put({
					table: 'fpages'
				}).then(function(resp) {
					alert('Updated');
					$state.go('admin.fpagesList');
				});
			};
		};
	};

}]);

