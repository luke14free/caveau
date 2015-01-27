angular.module('starter.controllers', [])

    .controller('DashCtrl', function ($scope, $rootScope, $ionicModal, $ionicActionSheet, $state) {

        $rootScope.$watch(function () {
                return $rootScope.caveau;
            },
            function () {
                $scope.pins = [];
                $scope.ibans = [];
                $scope.creditcards = [];
                $scope.passwords = [];
                for (i = 0; i < $rootScope.caveau.length; i++) {
                    item = $rootScope.caveau[i];
                    if (item.type == 'pin') {
                        $scope.pins.push(item);
                    }
                    if (item.type == "creditcard") {
                        $scope.creditcards.push(item);
                    }
                    if (item.type == "iban") {
                        $scope.ibans.push(item);
                    }
                    if (item.type == "password") {
                        $scope.passwords.push(item);
                    }
                }
            }
        );

        $scope.share = function (item, idx) {

            // Show the action sheet
            var msg = 'Hi, Here is my IBAN: ' + item.IBAN;
            if (item.bic) {
                msg += "\nmy BIC/SWIFT is: " + item.bic;
            }
            if (item.holder) {
                msg += "\nthe account holder is: " + item.bic;
            }
            msg += "\n\nHave a nice day! (IBAN shared with Caveau app - http://caveau.cc)";

            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    {text: 'Edit'},
                    {text: 'Copy to clipboard'},
                    {text: 'Share via email'},
                ],
                cancelText: 'Cancel',
                cancel: function () {
                    // add cancel code..
                },
                buttonClicked: function (index) {
                    console.log(index);
                    if (index == 0) {
                        $state.go('tab.friend-detail', {'idx': idx}, {reload: true});
                        //$scope.share(item);
                    }
                    if (index == 1) {
                        alert("Your iban was copied to the clipboard, just past it anywhere you want!");
                        cordova.plugins.clipboard.copy(msg);
                    }
                    if (index == 2) {
                        console.log("email");
                        if (window.plugins) {
                            window.plugins.emailComposer.showEmailComposerWithCallback(function () {
                            }, msg);
                        } else {
                            window.location.href = 'mailto:someone@email.com?subject=My IBAN&body=' + msg;
                        }
                    }
                }
            })
        };

        $ionicModal.fromTemplateUrl('templates/firstlogin.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal = modal;
            $rootScope.first_login = window.localStorage['caveau'] === undefined;
            if ($rootScope.first_login)
                $scope.modal.show();
        });

        $ionicModal.fromTemplateUrl('templates/login.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function (modal) {
            $scope.modal2 = modal;
            $rootScope.first_login = window.localStorage['caveau'] === undefined;
            if (!$rootScope.first_login && !$rootScope.unlocked)
                $scope.modal2.show();

        });

        $scope.data = {};
        $scope.isValidPassword = function (psw) {
            return psw.length >= 4;
            //return /((?=.*\d)(?=.*[A-Z](?=.*\W).{8,100})/ig.test(psw);
        };

        $scope.delete = function (item) {
            for (i = 0; i < $rootScope.caveau.length; i++) {
                if ($rootScope.caveau[i].IBAN == item.IBAN) {
                    $rootScope.caveau.splice(i, i + 1);
                    window.localStorage['caveau'] = CryptoJS.AES.encrypt(JSON.stringify($rootScope.caveau), $rootScope.pass);
                    return;
                }
            }
        };

        $scope.restoreCaveau = function () {
            delete window.localStorage['caveau'];
        };

        $scope.setUpAccount = function () {
            window.localStorage['secret'] = CryptoJS.AES.encrypt("can you decrypt me?!", $scope.data.password);
            window.localStorage['caveau'] = CryptoJS.AES.encrypt("[]", $scope.data.password);
            $rootScope.pass = $scope.data.password;
            $rootScope.unlocked = true;
            $rootScope.first_login = false;
            $rootScope.caveau = [];
            $scope.modal.remove();
        };

        $scope.checkPassword = function (pass) {
            if (pass == undefined)
                return;
            var decrypted = CryptoJS.AES.decrypt(window.localStorage['secret'], pass);
            return decrypted.toString(CryptoJS.enc.Utf8) == "can you decrypt me?!";
        };

        $scope.logIn = function (pass) {
            $rootScope.pass = pass;
            $rootScope.unlocked = true;
            $rootScope.first_login = false;
            var raw_caveau = CryptoJS.AES.decrypt(window.localStorage['caveau'], pass);
            $rootScope.caveau = JSON.parse(raw_caveau.toString(CryptoJS.enc.Utf8));
            console.log($rootScope.caveau);
            $scope.modal2.remove();
            return true;
        }
    })

    .controller('FriendsCtrl', function ($scope, $rootScope) {
        $scope.data = {};
        $scope.addIBAN = function () {
            $scope.data.IBAN = $scope.data.IBAN.replace(/\s/ig, "");
            $rootScope.caveau.push($scope.data);
            window.localStorage['caveau'] = CryptoJS.AES.encrypt(JSON.stringify($rootScope.caveau), $rootScope.pass);
            alert("Nicely done. Your IBAN has been encrypted and is now safely stored in the caveau.");
            $scope.data = {};
            $state.go("tab.dash");
        };

        $scope.IBANIsValid = function (iban) {
            return IBAN.isValid(iban);
        };

        $scope.addItem = function () {
            $rootScope.caveau.push($scope.data);
            window.localStorage['caveau'] = CryptoJS.AES.encrypt(JSON.stringify($rootScope.caveau), $rootScope.pass);
            alert("Nicely done. Your " + $scope.data.type + " has been encrypted and is now safely stored in the caveau.");
            $scope.data = {};
            $state.go("tab.dash");
        };

        $scope.IBANAlreadyExists = function (iban) {
            if (!$rootScope.caveau)
                return false;
            for (var i = 0; i < $rootScope.caveau.length; i++) {
                if ($rootScope.caveau[i].IBAN == iban) {
                    return true;
                }
            }
            return false;
        }
    })

    .controller('FriendDetailCtrl', function ($scope, $rootScope, $stateParams, $state) {
        $scope.data = $rootScope.caveau[$stateParams.idx];

        $scope.addIBAN = function () {
            $scope.data.IBAN = $scope.data.IBAN.replace(/\s/ig, "");
            $rootScope.caveau[$stateParams.idx] = $scope.data;
            window.localStorage['caveau'] = CryptoJS.AES.encrypt(JSON.stringify($rootScope.caveau), $rootScope.pass);
            alert("Nicely done. Your IBAN has been updated, encrypted and is now safely stored in the caveau.");
            $state.go("tab.dash");
        };


        $scope.addItem = function () {
            console.log("ehehehheheheh");
            $rootScope.caveau.push($scope.data);
            alert("Nicely done. Your " + $scope.data.type + " has been encrypted and is now safely stored in the caveau.");
            $scope.data = {};
        };


        $scope.IBANIsValid = function (iban) {
            if (iban)
                return IBAN.isValid(iban);
        };

        $scope.IBANAlreadyExists = function (iban) {
            if (!$rootScope.caveau)
                return false;
            for (var i = 0; i < $rootScope.caveau.length; i++) {
                if ($rootScope.caveau[i].IBAN == iban && i != $stateParams.idx) {
                    return true;
                }
            }
            return false;
        }

    })


    .
    controller('AccountCtrl', function ($scope) {
    });
