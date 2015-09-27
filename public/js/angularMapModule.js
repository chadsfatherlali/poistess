/**
 * Created by chadsfather on 27/9/15.
 */

/**
 * Retorna la latitud y la longitud desde el API de Google
 *
 * @param $http
 * @param $q
 * @param $log
 * @returns {{parse: Function}}
 */
function parseGeoPoints ($http, $q, $log) {
     return {
          parse: function (value) {
               var deferred = $q.defer();

               $http.get('https://maps.google.com/maps/api/geocode/json?address=' + value + '&sensor=false')
                    .success(function (data) {
                         deferred.resolve(data);
                    })
                    .error(function (msg, code) {
                         $log.error(msg, code);
                    });

               return deferred.promise;
          }
     }
}

/**
 * Directiva que se encarga de renderizar el mapa
 *
 * @param $rootScope
 * @param parseGeoPoints
 * @returns {{restrict: string, scope: {mapPoints: string, mapHeight: string, mapWidth: string, mapZoom: string}, link: Function}}
 */
function map ($rootScope, parseGeoPoints) {
     return {
          restrict: 'E',
          scope: {
               mapPoints: '@points',
               mapHeight: '@height',
               mapWidth: '@width',
               mapZoom: '@zoom'
          },
          link: function(scope, element, attrs) {
               var height = scope.mapHeight || '300px';
               var width = scope.mapWidth || '500px';
               var zoom = scope.mapZoom || 7;

               $rootScope.el = element[0];

               $rootScope.el.style.display = 'block';
               $rootScope.el.style.height = height;
               $rootScope.el.style.width = width;

               parseGeoPoints.parse(scope.mapPoints).then(function (data) {
                    var latlng = data.results;
                    var lastPoint = latlng.length - 1;

                    new google.maps.Map($rootScope.el, {
                         center: {
                              lat: latlng[lastPoint].geometry.location.lat,
                              lng: latlng[lastPoint].geometry.location.lng
                         },
                         scrollwheel: true,
                         zoom: zoom
                    });
               });
          }
     }
}

/**
 * Modulo para Dibujar mapas con el API de google maps,
 * depende de la libreria de google
 * Link: https://maps.google.com/maps/api/js
 */
angular.module('maps', [])
     .factory('parseGeoPoints', ['$http', '$q', '$log', parseGeoPoints])
     .directive('map', ['$rootScope', 'parseGeoPoints', map]);
