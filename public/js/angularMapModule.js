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
          parse: function (value, forceApi) {
               var regexp = /([0-9-.]+),([0-9-.]+)/,
                    coords,
                    data = {},
                    deferred = $q.defer();

               if (regexp.test(value) && !forceApi) {
                    coords = value.match(regexp);

                    data.lat = parseFloat(coords[1]);
                    data.lng = parseFloat(coords[2]);

                    deferred.resolve(data);
               }

               else {
                    $http.get('https://maps.google.com/maps/api/geocode/json?address=' + value + '&sensor=false')
                         .success(function (data) {
                              data.address = data.results[0].formatted_address;
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
 * Funcion encargada de dibujar la ruta más adecuada entro los puntos
 *
 * @param $rootScope
 * @returns {{calculate: Function}}
 */
function directionsDisplay ($rootScope) {
     return {
          calculate: function (origin, destination, travelMode, FailMessage) {
               var travel = travelMode || 'DRIVING',
                    message = FailMessage || 'Directions request failed';

               $rootScope.directionsService.route({
                    origin: origin,
                    destination: destination,
                    travelMode: google.maps.TravelMode[travel]
               },
                    function(response, status) {
                         if (status === google.maps.DirectionsStatus.OK) {
                              $rootScope.directionsDisplay.setDirections(response);
                         }

                         else {
                              window.alert(message);
                         }
                    });
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
               $rootScope.infowindowsTemplate = {};
               $rootScope.directionsService = new google.maps.DirectionsService;
               $rootScope.directionsDisplay = new google.maps.DirectionsRenderer;

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

                    $rootScope.directionsDisplay.setMap($rootScope.map);
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
                              var infowindow = new google.maps.InfoWindow(),
                                   tr = transclude(),
                                   template = scope.$eval($interpolate(tr[1].innerHTML));

                              infowindow.setContent(template);

                              marker.addListener('click touchstart', function (e) {
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
 * Directivaa que se encarga de crgar el autocomplete de google maps
 * a una etiqueta input
 *
 * options => atributo disponible para configurar restriccion de pais, etc.
 *
 * options="{types: ['geocode'], componentRestrictions: {country: 'ec'}}"
 *
 * Nota: es necesario cargar la libreria de places 'https://maps.google.com/maps/api/js?libraries=places'
 *
 * @param $rootScope
 * @returns {{restrict: string, scope: {mapOptions: string}, link: Function}}
 */
function autocompletebox ($rootScope) {
     return {
          restrict: 'AEC',
          scope: {
               mapOptions: '@options'
          },
          link: function (scope, element, attrs, ctrl) {
               var options = scope.$eval(scope.mapOptions) || {};

               $rootScope.InitAutoCompleteBox = new google.maps.places.Autocomplete(element[0], options);
          }
     }
}

/**
 * Directiva que pinta el cuadro de direcciones
 * entre dos puntos
 *
 * @param $rootScope
 * @returns {{restrict: string, link: Function}}
 */
function directionspanel ($rootScope) {
     return {
          restrict: 'AEC',
          link: function (scope, element, attrs, ctrl) {
               $rootScope.directionsDisplay.setPanel(element[0]);
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
     .factory('directionsDisplay', ['$rootScope', directionsDisplay])
     .directive('map', ['parseGeoPoints', '$rootScope', map])
     .directive('marker', ['parseGeoPoints', '$rootScope', '$interpolate', marker])
     .directive('autocompletebox', ['$rootScope', autocompletebox])
     .directive('directionspanel', ['$rootScope', directionspanel]);