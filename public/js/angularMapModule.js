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
               var regexp = /([0-9-.]+),([0-9-.]+)/,
                    coords,
                    data = {},
                    deferred = $q.defer();

               if (regexp.test(value)) {
                    coords = value.match(regexp);

                    data.lat = parseFloat(coords[1]);
                    data.lng = parseFloat(coords[2]);

                    deferred.resolve(data);
               }

               else {
                    $http.get('https://maps.google.com/maps/api/geocode/json?address=' + value + '&sensor=false')
                         .success(function (data) {
                              data.lat = data.results[0].geometry.location.lat;
                              data.lng = data.results[0].geometry.location.lng;

                              deferred.resolve(data);
                         })
                         .error(function (msg, code) {
                              $log.error(msg, code);
                         });
               }

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
               $rootScope.markers = [];
               $rootScope.infowindow = {};

               var height = scope.mapHeight || '300px',
                    width = scope.mapWidth || '500px',
                    zoom = scope.mapZoom || 7,
                    el = document.getElementById(attrs.id);

               el.style.display = 'block';
               el.style.height = height;
               el.style.width = width;

               parseGeoPoints.parse(scope.mapPoints).then(function (data) {
                    $rootScope.map = new google.maps.Map(el, {
                         center: {
                              lat: data.lat,
                              lng: data.lng
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
 * Directiva que pinta los puntos en el mapa,
 * si se pasa el atributo info con valor true(string) muestra
 * la ventana de informacion que se define dentro de marker
 * contenido por un div con la directiva ng-no-bindable
 *
 * @param parseGeoPoints
 * @param $rootScope
 * @param $interpolate
 * @returns {{restrict: string, transclude: boolean, link: Function}}
 */
function marker (parseGeoPoints, $rootScope, $interpolate) {
     return {
          restrict: 'E',
          transclude: true,
          link: function (scope, element, attrs, ctrl, transclude) {
               function setMarker () {
                    parseGeoPoints.parse(attrs.points).then(function (data) {
                         var marker = new google.maps.Marker({
                              position: {
                                   lat: data.lat,
                                   lng: data.lng
                              },
                              map: $rootScope.map
                         });

                         if (attrs.info === 'true') {
                              marker.addListener('click', function () {
                                   var infowindow = new google.maps.InfoWindow(),
                                        tr = transclude();

                                   infowindow.setContent(scope.$eval($interpolate(tr[1].innerHTML)));
                                   infowindow.open($rootScope.map, marker);
                              });
                         }

                         $rootScope.markers.push(marker);
                    });
               }

               attrs.$observe('points', setMarker);
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
     .directive('marker', ['parseGeoPoints', '$rootScope', '$interpolate', marker])