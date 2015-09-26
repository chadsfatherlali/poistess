/**
 * Created by chadsfather on 25/9/15.
 */

'use strict';

var app = angular.module('StarterApp', [
     'ngMaterial',
     'ngMap'
]);

app.config(['$interpolateProvider', function ($interpolateProvider) {
     $interpolateProvider.startSymbol('[[').endSymbol(']]');
}]);

function AppCtrl ($scope) {
}

app.controller('AppCtrl', ['$scope', AppCtrl]);