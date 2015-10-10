/**
 * Created by chadsfather on 25/9/15.
 */

'use strict';

var app = angular.module('StarterApp', [
     'ngMaterial',
     'maps',
     'ngGeolocation',
     'facebook'
]);

app.config([
     '$interpolateProvider',
     'FacebookProvider',
     function ($interpolateProvider, FacebookProvider) {
          FacebookProvider.init('661292413991564');
          $interpolateProvider.startSymbol('[[').endSymbol(']]');
     }]);

/**
 * Controlador principal de la SPA
 *
 * @param $rootScope
 * @param $scope
 * @param $mdSidenav
 * @param $mdUtil
 * @constructor
 */
function AppCtrl($rootScope, $scope, $mdSidenav, $mdUtil, $window, $geolocation, parseGeoPoints, directionsDisplay, Facebook) {
     $scope.messasgeFail = 'Lo sentimos no hemos podido encontrar una ruta adecuada, por favor revisa tu dirección';
     $scope.params = {};
     $scope.toggleRight = buildToggler('right');

     $scope.oficinas = [
          {
               'localidad': 'Quito',
               'centros': [
                    {
                         'tipo': 'Local',
                         'local': 'Tess A-121',
                         'nombre': 'Centro comercial Iñaquito C.C.I.',
                         'direccion': 'Av. AMAZONAS N36-152 Y Av. NACIONES UNIDAS',
                         'telefono': '02-2277720',
                         'email': 'cci@ingesa.com.ec',
                         'geo': '-0.1730965,-78.483365',
                         'zoom': 7
                    },
                    {
                         'tipo': 'Isla',
                         'local': 'TESS P1-K40',
                         'nombre': 'Quicentro Shopping',
                         'direccion': 'Av. NACIONES UNIDAS S/N y SEIS DE DICIEMBRE',
                         'telefono': '02-3824002',
                         'email': 'quicentro@ingesa.com.ec',
                         'geo': '-0.1761243,-78.4802341',
                         'zoom': 7
                    },
                    {
                         'tipo': 'Local',
                         'local': 'TESS J-54',
                         'nombre': 'Centro comercial el Recreo',
                         'direccion': 'Av. MALDONADO S/N y CALLE S/N',
                         'telefono': '02-2668054',
                         'email': 'recreo@ingesa.com.ec',
                         'geo': '-0.2525642,-78.5231569',
                         'zoom': 7
                    }
               ]
          },
          {

               'localidad': 'Valle de los Chillos',
               'centros': [
                    {
                         'tipo': 'Isla',
                         'local': 'TESS I2-013',
                         'nombre': 'Centro comercial San Luis',
                         'direccion': 'CALLE SANTA CLARA Y Av. GENERAL RUMIÑAHUI',
                         'telefono': '02-2090315',
                         'email': 'sanluis@ingesa.com.ec',
                         'geo': '-0.3076142,-78.4499721',
                         'zoom': 7
                    }
               ]
          },
          {
               'localidad': 'Guayaquil',
               'centros': [
                    {
                         'tipo': 'Local',
                         'local': 'TESS No. 29',
                         'nombre': 'Paseo Shopping - Duran',
                         'direccion': 'Km. 3 1/2 - AUTOPISTA DURAN-BOLICHE',
                         'telefono': '04-3886025',
                         'email': 'duran@ingesa.com.ec',
                         'geo': '-2.1789414,-79.8246778',
                         'zoom': 7
                    },
                    {
                         'tipo': 'Local',
                         'local': 'TESS No. 76',
                         'nombre': 'La Peninsula - La Libertad',
                         'direccion': 'CENTRO COMERCIAL EL PASEO SHOPPINPG Local No. 76',
                         'telefono': '04-2775311',
                         'email': 'libertad@ingesa.com.ec',
                         'geo': '-2.2259415,-80.9211355',
                         'zoom': 7
                    },
               ]
          },
          {
               'localidad': 'Latacunga',
               'centros': [
                    {
                         'tipo': 'Isla',
                         'local': 'TESS PBK 03',
                         'nombre': 'Centro comercial Malteria',
                         'direccion': 'Av. ELOY ALFARO Y GATAZO',
                         'telefono': '03-2279074',
                         'email': 'riobamba@ingesa.com',
                         'geo': '-0.9256063,-78.6260425',
                         'zoom': 7
                    }
               ]
          },
          {
               'localidad': 'Riobamba',
               'centros': [
                    {
                         'tipo': 'Local',
                         'local': 'TESS No. 86',
                         'nombre': 'Paseo Shopping Riobamba',
                         'direccion': 'Av. ANTONIO JOSE DE SUCRE Y BEGONIAS',
                         'telefono': '03-2310072',
                         'email': 'riobamba@ingesa.com',
                         'geo': '-1.6539851,-78.6461315',
                         'zoom': 7
                    }
               ]
          },
          {
               'localidad': 'Babahoyo',
               'centros': [
                    {
                         'tipo': 'Local',
                         'local': 'TESS No. 45',
                         'nombre': 'Centro comercial Paseo Shopping',
                         'direccion': 'Av. ENRIQUE PONCE LUQUE',
                         'telefono': '05-2789019',
                         'email': 'babahoyo@ingesa.com.ec',
                         'geo': '-1.8140289,-79.5459294',
                         'zoom': 7
                    }
               ]
          },
     ];

     Facebook.getLoginStatus(function (response) {
          if (response.status === 'connected') {
               fbGetInformation();
          }

          else {
               Facebook.login(function (response) {
                         if (response.status === 'connected') {
                              fbGetInformation();
                         }
                    },
                    {
                         scope: 'user_about_me,user_location,public_profile'
                    });
          }
     });

     function fbGetInformation () {
          Facebook.api('/me?fields=email,name,location,picture', function (response) {
               if (response && response.location.name) {
                    $scope.params.origen = response.location.name;

                    if (response.picture.data.url) {
                         $scope.params.picture = response.picture.data.url;
                    }

                    if (response.name) {
                         $scope.params.name = response.name;
                    }
               }

               else if (response && response.picture.data.url) {
                    $scope.params.picture = response.picture.data.url;

                    if (response.name) {
                         $scope.params.name = response.name;
                    }
               }

               else if (response.name) {
                    $scope.params.name = response.name;
               }

               else {
                    getGeoLocation();
               }
          });
     }

     function getGeoLocation () {
          $geolocation.getCurrentPosition()
               .then(function (position) {
                    var geo = position.coords;

                    parseGeoPoints.parse(geo.latitude + ',' + geo.longitude, true).then(function (data) {
                         $scope.params.origen = data.address;
                    });
               });
     }

     function buildToggler (navID) {
          var debounceFn = $mdUtil.debounce(function () {
               $mdSidenav(navID)
                    .toggle()
                    .then(function () {
                    });
          }, 200);

          return debounceFn;
     }

     $scope.close = function () {
          $mdSidenav('right').close()
               .then(function () {});
     };

     $scope.buscar = function () {
          if ($scope.params
               && $scope.params.origen
               && $scope.params.centro) {
               directionsDisplay.calculate($scope.params.origen, $scope.params.centro, 'DRIVING', $scope.messasgeFail);
          }
     };

     $scope.fillForm = function (object) {
          $scope.params.localidad = object.localidad;
          $scope.params.centro = object.centro;

          directionsDisplay.calculate($scope.params.origen, $scope.params.centro, object.tipo, $scope.messasgeFail);
     };

     $window.sideopen = function (e) {
          var object = eval('(' + angular.element(e).attr('object') + ')');

          $scope.fillForm(object);
          $scope.toggleRight();
     };

     $rootScope.InitAutoCompleteBox;
}

app
     .controller('AppCtrl', [
          '$rootScope',
          '$scope',
          '$mdSidenav',
          '$mdUtil',
          '$window',
          '$geolocation',
          'parseGeoPoints',
          'directionsDisplay',
          'Facebook',
          AppCtrl
     ]);