+function () {
    'use strict';

    angular.module('hydrant.filters', [])
    
    .filter('selectedNetwork', function () {
        return function (faucets, network) {
            if (!network)
                return faucets;

            return faucets.filter(function (faucet) {
                for (var i in faucet.networks) {
                    if (faucet.networks[i].name === network.name)
                        return true;
                }
                return false;

            });
        };
    });
}();
+function () {
    'use strict';
    
    angular.module('hydrant.services', [])
    
    .service('selectedNetworkService', function() {
        this.network = null;

        this.get = function() {
            return this.network;
        };

        this.set = function(network) {
            this.network = network;
        };
    })
    
    .service('metadataService', ['localStorageService', function(localStorageService) {
            this.get = function(key) {
                return localStorageService.get(key);
            };

            this.set = function(key, value) {
                if (isEmpty(value))
                    return localStorageService.remove(key);

                localStorageService.set(key, value);
            };

            this.keys = function() {
                return localStorageService.keys();
            };

            function isEmpty(obj) {
                for (var prop in obj) {
                    if (obj.hasOwnProperty(prop) && obj[prop] !== undefined) {
                        return false;
                    }
                }

                return true;
            }
            ;
        }])
    
    .factory('faucetApi', ['$http', function ($http) {
        return {
            visit: function (token, referral) {
                return $http.post(Routing.generate('visit', { token: token }), { referral: referral });
            },
            vote: function (token, type) {
                return $http.post(Routing.generate('vote', { token: token }), { type: type });
            }
        };
    }])

}();
angular.module('hydrant', ['hydrant.filters', 'hydrant.services', 'hydrant.initialData',
    'fosJsRouting', 'ui.bootstrap', 'angularMoment', 'LocalStorageModule'
])

.config(['$interpolateProvider', function ($interpolateProvider) {
        $interpolateProvider.startSymbol('[[');
        $interpolateProvider.endSymbol(']]');
    }])

.config(['localStorageServiceProvider', function (localStorageServiceProvider) {
        localStorageServiceProvider.setPrefix('hydrant');
    }])

.config(['$locationProvider', function ($locationProvider) {
        $locationProvider.hashPrefix('!');
    }])


.constant('angularMomentConfig', {
    preprocess: 'unix'
});
(function () {
    'use strict';

    var app = angular.module('hydrant.app.home', ['hydrant', 'hydrant.initialData',
    ]);

    app.controller('TitleController', ['$scope',
        'selectedNetworkService',
        function ($scope, selectedNetworkService) {
            $scope.title = function () {
                var title = 'Bitcoin';
                if (selectedNetworkService.get())
                    title = selectedNetworkService.get().name;
                return title;
            };
        }])
    .controller('TabsController', [
        '$scope',
        'selectedNetworkService',
        '$location',
        'initialData',
        'lowercaseFilter',
        function ($scope, selectedNetworkService, $location, initialData, lowercaseFilter) {
            $scope.networks = initialData.networks;

            $scope.$on('$locationChangeSuccess', function (event) {
                
                var networkPath = $location.path().replace('/', '').replace('-faucet-list', '');

                $scope.selectedNetwork = $scope.networks.filter(function (i) {
                    return i.slug === networkPath;
                })[0];

                selectedNetworkService.set($scope.selectedNetwork);
            });

            $scope.isActive = function (viewLocation) {
                return viewLocation === $location.path();
            };
        }])
    .controller('TableController', [
        '$scope',
        'initialData',
        'selectedNetworkService',
        '$interval',
        'metadataService',
        'faucetApi',
        function ($scope, initialData, selectedNetworkService, $interval, metadataService, faucetApi) {
            $scope.faucets = initialData.faucets;
            $scope.predicate = 'reward_average';
            $scope.reverse = true;
            $scope.Math = window.Math;

            function getFaucetByToken(token) {
                for (var i = 0; i < $scope.faucets.length; i++) {
                    var faucet = $scope.faucets[i];
                    if (faucet.token === token)
                        return faucet;
                }

                return null;
            };

            function setVisited(faucet, time) {
                if (!time)
                    return;

                var store = metadataService.get(faucet.token);
                if (!store) {
                    var store = {visited: time};
                    faucet.countdown = time + faucet.reward_interval;
                }
                else {
                    //Countdown not expired
                    if (store.visited + faucet.reward_interval > getTime())
                        return;

                    store.visited = time;
                    faucet.countdown = time + faucet.reward_interval;
                }
                metadataService.set(faucet.token, store);
            }
            ;

            function setDisabled(faucet, flag) {
                var store = metadataService.get(faucet.token);
                if (!store)
                    var store = {disabled: flag};
                else
                    store.disabled = flag ? flag : undefined;
                metadataService.set(faucet.token, store);
                faucet.disabled = flag ? flag : undefined;
            };

            function getTime() {
                return $scope.Math.round(new Date().getTime() / 1000);
            };

            function decorateFaucet(token, data) {
                var faucet = getFaucetByToken(token);
                if (!faucet)
                    return;

                if (data.visited)
                    faucet.countdown = data.visited + faucet.reward_interval;

                if (data.disabled)
                    faucet.disabled = data.disabled;
            };

            var keys = metadataService.keys();
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var value = metadataService.get(key);
                decorateFaucet(key, value);
            }


            $scope.orderBy = function (predicate) {
                $scope.predicate = predicate;
                $scope.reverse = !$scope.reverse;
            };

            $scope.filterNetwork = function () {
                return selectedNetworkService.get();
            };

            $scope.visit = function (event, faucet, referral) {
                //Click and Middle mouse
                if (event.which !== 1 && event.which !== 2)
                    return;

                var promise = faucetApi.visit(faucet.token, referral);
                promise.success(function (data, status, headers, config) {
                    setVisited(faucet, getTime());
                }).error(function (data, status, headers, config) {
                });
            };
            
            $scope.vote = function (faucet, type) {
                var promise = faucetApi.vote(faucet.token, type);
                promise.success(function (data, status, headers, config) {
                    faucet.votes_up = data.votes_up;
                    faucet.votes_down = data.votes_down;
                });
            };

            $scope.disable = function (faucet, flag) {
                setDisabled(faucet, flag);
            };

            $scope.countdown = $interval(function () {
                $scope.faucets.filter(function (i) {
                    return i.countdown;
                })
                .forEach(function (faucet) {
                    if (faucet.countdown < getTime()) {
                        faucet.countdown = undefined;
                        var store = metadataService.get(faucet.token);
                        store.visited = undefined;
                        metadataService.set(faucet.token, store);
                    }
                });
            }, 2000);


        }]);

}());
"use strict";

$(function () {
    //var browsers = { firefox: /firefox/i, msie: /internet explorer/i, msie11: /trident/i };
    var firefox = /firefox/i;
    
    if (firefox.test(navigator.userAgent)) {
        $(document).click(function (event) {
            switch (event.which) {
                case 2:
                {
                    var faucet = angular.element(event.target).scope().faucet;
                    var controller = angular.element('#hydrantList').scope();
                    var isReferral = !$(event.target).hasClass('non-referral');
                    if (!faucet.has_referral)
                        controller.visit(event, faucet, false);
                    else
                        controller.visit(event, faucet, isReferral);
                }
            }
        });
    }
});