angular.module('starter.controllers', [])

    .controller('DashCtrl', function ($scope, $rootScope, $ionicModal, $ionicActionSheet) {

        $scope.share = function (item) {

            // Show the action sheet
            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    {text: 'Share via email'},
                ],
                titleText: 'Share this IBAN',
                cancelText: 'Cancel',
                cancel: function () {
                    // add cancel code..
                },
                buttonClicked: function (index) {
                    console.log(index);
                    if (index == 0) {
                        console.log("email");
                        if(window.plugins){
                            window.plugins.emailComposer.showEmailComposerWithCallback(function () {
                            }, "My IBAN", 'Hi, Here is my IBAN: ' + item.IBAN);
                        } else {
                            window.location.href = 'mailto:someone@email.com?subject=My IBAN&body=Hi, Here is my IBAN: ' + item.IBAN;
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
            return /((?=.*\d)(?=.*[A-Z])(?=.*\W).{4,100})/ig.test(psw);
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
            $rootScope.caveau.push({'name': $scope.data.name, 'IBAN': $scope.data.IBAN});
            window.localStorage['caveau'] = CryptoJS.AES.encrypt(JSON.stringify($rootScope.caveau), $rootScope.pass);
            alert("Nicely done. Your IBAN has been encrypted and is now safely stored in the caveau.");
            $scope.data = {};
        };

        $scope.addItem = function(){
            $rootScope.caveau.push($scope.data);
            alert("Nicely done. Your "+$scope.data.type+" has been encrypted and is now safely stored in the caveau.");
            $scope.data = {};
        };

        $scope.IBANIsValid = function (iban) {
            return IBAN.isValid(iban);
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

    .controller('FriendDetailCtrl', function ($scope, $stateParams, Friends) {
        $scope.friend = Friends.get($stateParams.friendId);
    })

    .controller('AccountCtrl', function ($scope) {
    });
