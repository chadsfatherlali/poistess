/**
 * Created by chadsfather on 25/9/15.
 */

'use strict';

function AppCtrl ($scope) {}

var app = angular.module('StarterApp', [
     'ngMaterial',
     'ngMap'
]);

app.controller('AppCtrl', ['$scope', AppCtrl]);