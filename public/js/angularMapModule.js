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
 * @param parseGeoPoints
 * @param $rootScope
 * @returns {{restrict: string, scope: {mapPoints: string, mapHeight: string, mapWidth: string, mapZoom: string}, template: Function, link: Function}}
 */
function map (parseGeoPoints, $rootScope) {
     return {
          restrict: 'E',
          scope: {
               mapPoints: '@points',
               mapHeight: '@height',
               mapWidth: '@width',
               mapZoom: '@zoom'
          },
          template: function (element, attrs) {
               return '<div id="' + attrs.id + '"></div>';
          },
          transclude: true,
          link: function(scope, element, attrs, ctrl, transclude) {
               var height = scope.mapHeight || '300px',
                    width = scope.mapWidth || '500px',
                    zoom = scope.mapZoom || 7,
                    el = document.getElementById(attrs.id);

               el.style.display = 'block';
               el.style.height = height;
               el.style.width = width;

               parseGeoPoints.parse(scope.mapPoints).then(function (data) {
                    var latlng = data.results;

                    $rootScope.map = new google.maps.Map(el, {
                         center: {
                              lat: latlng[0].geometry.location.lat,
                              lng: latlng[0].geometry.location.lng
                         },
                         scrollwheel: true,
                         zoom: zoom
                    });

                    element.append(transclude());
               });
          }
     }
}

/**
 * Directiva que pinta los puntos en el mapa.
 *
 * @param parseGeoPoints
 * @param $rootScope
 * @returns {{restrict: string, scope: {markerPoints: string}, link: Function}}
 */
function marker (parseGeoPoints, $rootScope) {
     return {
          restrict: 'E',
          scope: {
               markerPoints: '@points'
          },
          link: function(scope, element, attrs) {
               parseGeoPoints.parse(scope.markerPoints).then(function (data) {
                    var latlng = data.results;

                    $rootScope.marker = new google.maps.Marker({
                         position: {
                              lat: latlng[0].geometry.location.lat,
                              lng: latlng[0].geometry.location.lng
                         },
                         map: $rootScope.map,
                         title: 'Hello World!'
                    });
               });
          }
     }
}

/**
 * Modulo para Dibujar mapas con el API de google maps,
 * depende de la libreria de google
 * @link: https://maps.google.com/maps/api/js
 */
angular.module('maps', [])
     .factory('parseGeoPoints', ['$http', '$q', '$log', parseGeoPoints])
     .directive('map', ['parseGeoPoints', '$rootScope', map])
     .directive('marker', ['parseGeoPoints', '$rootScope', marker]);
