/**
 * Created by win on 3/14/16.
 */

var app = angular.module('app', ['ui.bootstrap', 'ngRoute', 'ngCookies', 'checklist-model']);

app.config(function($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'englishmemberlookup.html',
            controller: 'memberlookupController'
        })
        .when('/member', {
            templateUrl: 'adultenglish-member.html',
            controller: 'memberController'
        })
        .when('/general', {
            templateUrl: 'adultenglish-general.html',
            controller: 'generalController'
        })
        .when('/behavior', {
            templateUrl: 'adultenglish-behavior.html',
            controller: 'behaviorController'
        })
        .when('/currentcare', {
            templateUrl: 'adultenglish-currentcare.html',
            controller: 'currentcareController'
        })
        .when('/physical', {
            templateUrl: 'adultenglish-physical.html',
            controller: 'physicalController'
        })
        .when('/lifestyle', {
            templateUrl: 'adultenglish-lifestyle.html',
            controller: 'lifestyleController'
        })
        .when('/submit', {
            templateUrl: 'adultenglish-submit.html',
            controller: 'submitController'
        })
        .when('/confirmation', {
            templateUrl: 'adultenglish-confirmation.html',
            controller: 'confirmationController'
        })
});

app.factory('ApiService', ['$http', '$q', function($http, $q) {

    var data = {
        member_type: {
            age: '',
            age_num:'',
            vendor: '',
            plan: ''
        },
        member_info: {},
        answers: {},
        steps: {},

        survey_id: '',
        survey: {
            /*
            RID: '',
            SurveyCode: '',
            SurveyStartDate: '',
            SurveyStartTime: '',
            SurveyStopDate: '',
            SurveyStopTime: '',
            SurveyConfirmationNumber: '',
            SurveyResponses: {
            }*/
        }
    };

    var api_baseurl = 'http://54.152.3.202:3000';
    var api_auth = 'eyJhbGciOiJIUzI1NiJ9.YXBpc2VjdXJpdHk4QWhEVzFpVGpUQXlFYg.UmfbVr9ru8wpd7ipc7Ie-ZZJhU4xRNDIxB2gu63Qglk';

    var api_survey_url = 'http://54.152.217.69:3000/answer';

    function generateSurveyCode() {

        var survey_code = CryptoJS.MD5(Date.now().toString()).toString();

        survey_code = survey_code.substring(0,16);
        survey_code = survey_code.toUpperCase();
        survey_code = 'A' + survey_code;

        return survey_code;
    }
    function generateConfirmationNumber() {
        var confirmation_number = CryptoJS.MD5(Date.now().toString()).toString();
        return confirmation_number.toUpperCase();
    }

    return {

        membersearch2: function(firstName, lastName, dob, rid) {

            var deferred = $q.defer();

            var url = api_baseurl + '/membersearch2?firstname=' + firstName + '&lastname=' + lastName + '&dob=' + dob + '&rid=' + rid;

            $http({
                url: url,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': api_auth
                }
            }).then(function(res) {
                deferred.resolve(res);
            },function(res){
                deferred.reject(res);
            });

            return deferred.promise;
        },
        setData: function(app_data) {
            data = app_data;
        },
        getData: function() {
            return data;
        },
        setMemberInfo: function(info) {
            data.member_info = info;
        },
        getMemberInfo: function() {
            return data.member_info;
        },
        setMemberType: function(age, age_num, vendor, plan) {
            data.member_type.age = age;
            data.member_type.age_num = age_num;
            data.member_type.vendor = vendor;
            data.member_type.plan = plan;
        },
        getMemberType: function() {
            return data.member_type;
        },
        getAnswers: function() {
            return data.answers;
        },
        setAnswers: function(member_answers) {
            data.answers = member_answers;
        },
        setSteps: function(steps) {
            data.steps = steps;
        },
        getSteps: function() {
            return data.steps;
        },
        getSurveyConfirmationNumber: function() {
            return data.survey.SurveyConfirmationNumber;
        },
        surveyAddAnswer: function() {

            var deferred = $q.defer();

            var url = api_survey_url;

            var now = new Date();

            data.survey.RID = data.member_info.RID;
            data.survey.SurveyCode = generateSurveyCode();
            data.survey.SurveyStartDate = now.getFullYear() + '-' + (now.getMonth()+1) + '-' + now.getDate();
            data.survey.SurveyStartTime = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();

            $http({
                url: url,
                method: 'POST',
                data: data.survey,
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function(res) {
                if(!res.data.err) {
                    data.survey_id = res.data.result.id;
                    deferred.resolve(res);
                } else {
                    console.log(res);
                    deferred.reject(res);
                }
            },function(res) {
                deferred.reject(res);
            });

            return deferred.promise;
        },
        surveyUpdateAnswer: function(submit) {


            var deferred = $q.defer();

            var url = api_survey_url + '/' + data.survey_id;

            if(submit) {

                var now = new Date();

                data.survey.SurveyStopDate = now.getFullYear() + '-' + (now.getMonth()+1) + '-' + now.getDate();
                data.survey.SurveyStopTime = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds();
                data.survey.SurveyConfirmationNumber = generateConfirmationNumber();
            }

            data.survey.SurveyResponses = data.answers;

            $http({
                url: url,
                method: 'PUT',
                data: {
                    update_data: data.survey
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function(res) {
                if(!res.data.err && res.data.result == 'Updated') {
                    deferred.resolve(res);
                } else {
                    console.log(res);
                    deferred.reject(res);
                }
            },function(res) {
                deferred.reject(res);
            });

            return deferred.promise;
        }
    };

}]);

app.factory('ValidateService', [function() {

    return {
        phoneValidate: function(str) {
            if(str == undefined) {
                return false;
            }

            if(str.match(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/)) {
                return true;
            } else {
                return false;
            }
        },
        emailValidate: function(str) {
            if(str == undefined) {
                return false;
            }

            if(str.match(/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i)) {
                return true;
            } else {
                return false;
            }
        },
        dateValidate: function(str) {
            if(str == undefined) {
                return false;
            }

            /*yyyy-mm-dd-----------/^(19|20)\d{2}\-(0?[1-9]|1[0-2])\-(0?[1-9]|1\d|2\d|3[01])$/------------*/
            if(str.match(/^(19|20)\d{2}\-(0?[1-9]|1[0-2])\-(0?[1-9]|1\d|2\d|3[01])$/)) {
                return true;
            } else {
                return false;
            }
        },
        dateValidate2: function(str) {
            if(str == undefined) {
                return false;
            }

            /*mm/dd/yyyy-----------/^(0?[1-9]|1[0-2])\/(0?[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/------------*/
            if(str.match(/^(0?[1-9]|1[0-2])\/(0?[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/)) {
                return true;
            } else {
                return false;
            }
        },
        digit1Validate: function(str) {
            if(str == undefined) {
                return false;
            }
            if(str.match(/^\d{1}$/)) {
                return true;
            } else {
                return false;
            }
        },
        digit2LValidate: function(str) {
            if(str == undefined) {
                return false;
            }
            if(str.match(/^\d{1,2}$/)) {
                return true;
            } else {
                return false;
            }
        },
        digit3LValidate: function(str) {
            if(str == undefined) {
                return false;
            }
            if(str.match(/^\d{1,3}$/)) {
                return true;
            } else {
                return false;
            }
        },
        digit4Validate: function(str) {
            if(str == undefined) {
                return false;
            }
            if(str.match(/^\d{4}$/)) {
                return true;
            } else {
                return false;
            }
        },
        digit5Validate: function(str) {
            if(str == undefined) {
                return false;
            }
            if(str.match(/^\d{5}$/)) {
                return true;
            } else {
                return false;
            }
        },
        char2Validate: function(str) {
            if(str == undefined) {
                return false;
            }
            if(str.match(/^([a-zA-Z]){2}$/)) {
                return true;
            } else {
                return false;
            }
        }
    };

}]);

app.controller('mainController', ['$rootScope', '$scope', '$anchorScroll', '$location', '$cookies', 'ApiService', function($rootScope, $scope, $anchorScroll, $location, $cookies, api) {

    $scope.member_type = {};
    $scope.member_info = {};

    $scope.steps = {
        cur:-1,
        info:[
            {
                title:'Member Info',
                url:'/member',
                completed:false
            },
            {
                title:'General Health',
                url:'/general',
                completed:false
            },
            {
                title:'Behavioral Health & Safety',
                url:'/behavior',
                completed:false
            },
            {
                title:'Current Care',
                url:'/currentcare',
                completed:false
            },
            {
                title:'Physical Health',
                url:'/physical',
                completed:false
            },
            {
                title:'Lifestyle',
                url:'/lifestyle',
                completed:false
            },
            {
                title:'Submit',
                url:'/submit',
                completed:false
            }
        ]
    };

    $rootScope.$on("$viewContentLoaded", function () {
        $anchorScroll();
    });

    $scope.$on("moveStep", function(e, step_moveto, step_completed) {

        $scope.steps.cur = step_moveto;

        if(step_completed != null) {
            $scope.steps.info[step_completed].completed = true;
        }

        if(step_moveto == 0) {
            $scope.member_type = api.getMemberType();
            $scope.member_info = api.getMemberInfo();
        }

        if(step_moveto < 7) {

            $location.path($scope.steps.info[step_moveto].url);

        } else {

            $location.path('/confirmation');
        }

        api.setSteps($scope.steps);

        var survey_app_data = api.getData();
        $cookies.putObject('survey_app_data', survey_app_data);

    });

    $scope.linkTo = function(step_linkto) {
        $scope.$emit("moveStep", step_linkto, null);
    };

    $scope.init = function() {

        var path = $location.path();
        var step_goto = -1;
        for(var i=0;i<$scope.steps.info.length;i++) {
            if(path == $scope.steps.info[i].url) {
                step_goto = i;
                break;
            }
        }

        $scope.steps.cur = step_goto;

        if(step_goto == -1) {

            $cookies.remove('survey_app_data');

        } else {

            var survey_app_data = $cookies.getObject('survey_app_data');

            if (survey_app_data != undefined && survey_app_data != null) {

                api.setData(survey_app_data);

                $scope.member_type = survey_app_data.member_type;
                $scope.member_info = survey_app_data.member_info;

            }
        }
    };

    $scope.init();

}]);

app.controller('confirmationController', ['$scope', '$location', 'ApiService', function($scope, $location, api) {

    $scope.step_me = 7;
    $scope.member_type = {};
    $scope.member_info = {};
    $scope.answers = {};
    $scope.print = false;

    $scope.confirmation_code = '';

    $scope.onClose = function() {
        $location.path('/');
    };

    $scope.onPrint = function() {
        $scope.print = !$scope.print;
    };

    $scope.init = function() {

        $scope.member_type = api.getMemberType();
        $scope.member_info = api.getMemberInfo();
        $scope.answers = api.getAnswers();
        $scope.confirmation_code = api.getSurveyConfirmationNumber();
    };

    $scope.init();

}]);

app.controller('submitController', ['$scope', '$location', 'ApiService', 'ValidateService', function($scope, $location, api, validator) {

    $scope.step_me = 6;
    $scope.member_type = {};
    $scope.member_info = {};
    $scope.answers = {};

    $scope.init = function() {

        $scope.member_type = api.getMemberType();
        $scope.member_info = api.getMemberInfo();
        $scope.answers = api.getAnswers();

        $scope.loadDTFAnaswers();
    };

    $scope.phoneValidate = function(str) {

        return validator.phoneValidate(str);
    };

    //yyyy-mm-dd
    $scope.dateValidate = function(str) {

        return validator.dateValidate(str);
    };

    //mm/dd/yyyy
    $scope.dateValidate2 = function(str) {

        return validator.dateValidate2(str);
    };

    $scope.formValidate = function() {

        if(!$scope.answers.Q63 || !$scope.answers.Q64 || !$scope.answers.Q65_A || !$scope.answers.Q66 || !$scope.answers.Q67) {
            $scope.required = true;
            return false;
        }

        if(!$scope.dateValidate($scope.answers.Q65)) {
            $scope.required = true;
            return false;
        }

        if(!$scope.phoneValidate($scope.answers.Q65_A)) {
            $scope.required = true;
            return false;
        }

        return true;
    };

    $scope.saveDTFAnaswers = function() {

        //answers.Q65
        if($scope.dateValidate2($scope.Q65_DTF)) {
            var ymd = $scope.Q65_DTF.split("/");
            $scope.answers.Q65 = ymd[2] + '-' + ymd[0] + '-' + ymd[1];

        } else {
            $scope.answers.Q65 = '';
        }
    };

    $scope.loadDTFAnaswers = function() {

        //answers.Q65
        if($scope.dateValidate($scope.answers.Q65)) {
            var ymd = $scope.answers.Q65.split("-");
            $scope.Q65_DTF = ymd[1] + '/' + ymd[2] + '/' + ymd[0];
        } else {
            $scope.Q65_DTF = '';
        }
    };

    /*
    $scope.saveDateAnaswers = function() {

        //answers.Q65
        if($scope.Q65_DT) {
            $scope.answers.Q65 = $scope.Q65_DT.getFullYear() + '-' + ($scope.Q65_DT.getMonth() + 1) + '-' + $scope.Q65_DT.getDate();
        } else {
            $scope.answers.Q65 = '';
        }
    };

    $scope.loadDateAnaswers = function() {

        //answers.Q65

        if($scope.answers.Q65) {
            var ymd = $scope.answers.Q65.split("-");
            $scope.Q65_DT = new Date(ymd[0],ymd[1]-1,ymd[2]);
        } else {
            $scope.Q65_DT = null;
        }
    };
    */

    $scope.onNext = function() {

        $scope.saveDTFAnaswers();

        if($scope.formValidate()) {

            var steps = api.getSteps();

            for(var i=0;i<6;i++) {

                if(!steps.info[i].completed) {

                    alert("You did not complete " + steps.info[i].title + " page, Please fill all required items and press Next to complete!");

                    $scope.$emit("moveStep", i, null);

                    return;
                }
            }

            if (confirm("Are you sure you are ready to submit your survey?  Once you Submit you cannot make changes.")) {

                api.setAnswers($scope.answers);

                api.surveyUpdateAnswer(true).then(

                    function(data) {

                        $scope.$emit("moveStep", 7, 6);
                    },
                    function(data){
                        alert('Something went wrong!');
                    }
                );
            }
        } else {
            alert("You need to complete all the required questions on the page before proceeding.");
        }
    };

    $scope.onPrev = function() {

        $scope.saveDTFAnaswers();

        api.setAnswers($scope.answers);
        $scope.$emit("moveStep", 5, null);

        //$location.path('/lifestyle');
    };

    $scope.init();

}]);

app.controller('lifestyleController', ['$scope', '$location', 'ApiService', 'ValidateService', function($scope, $location, api, validator) {

    $scope.step_me = 5;
    $scope.member_type = {};
    $scope.member_info = {};
    $scope.answers = {};

    $scope.init = function() {

        $scope.member_type = api.getMemberType();
        $scope.member_info = api.getMemberInfo();
        $scope.answers = api.getAnswers();

    };

    $scope.formValidate = function() {

        if(!$scope.answers.Q59 || !$scope.answers.Q60 || !$scope.answers.Q62) {
            $scope.required = true;
            return false;
        }

        if($scope.answers.A61==undefined || !($scope.answers.A61.length>0)) {
            $scope.required = true;
            return false;
        }

        if($scope.answers.Q59 == 1 && ($scope.answers.A59_A==undefined || !($scope.answers.A59_A.length>0))) {
            $scope.required = true;
            return false;
        }

        return true;
    };

    $scope.onNext = function() {

        if($scope.formValidate()) {

            api.setAnswers($scope.answers);

            api.surveyUpdateAnswer(false).then(
                function(data) {
                    $scope.$emit("moveStep", 6, 5);
                },
                function(data){
                    alert('Server connection failed!');
                }
            );

            //$location.path('/submit');
        } else {
            alert("You need to complete all the required questions on the page before proceeding.");
        }
    };

    $scope.onPrev = function() {

        api.setAnswers($scope.answers);
        $scope.$emit("moveStep", 4, null);

        //$location.path('/physical');
    };

    $scope.init();

}]);


app.controller('physicalController', ['$scope', '$location', 'ApiService', 'ValidateService', function($scope, $location, api, validator) {

    $scope.step_me = 4;
    $scope.member_type = {};
    $scope.member_info = {};
    $scope.answers = {};

    $scope.init = function() {

        $scope.member_type = api.getMemberType();
        $scope.member_info = api.getMemberInfo();
        $scope.answers = api.getAnswers();

        $scope.loadDTFAnaswers();
    };

    $scope.saveDTFAnaswers = function() {

        //answers.Q33_A
        if($scope.dateValidate2($scope.Q33_A_DTF)) {
            var ymd = $scope.Q33_A_DTF.split("/");
            $scope.answers.Q33_A = ymd[2] + '-' + ymd[0] + '-' + ymd[1];

        } else {
            $scope.answers.Q33_A = '';
        }
    };

    $scope.loadDTFAnaswers = function() {

        //answers.Q33_A
        if($scope.dateValidate($scope.answers.Q33_A)) {
            var ymd = $scope.answers.Q33_A.split("-");
            $scope.Q33_A_DTF = ymd[1] + '/' + ymd[2] + '/' + ymd[0];
        } else {
            $scope.Q33_A_DTF = '';
        }
    };

    //yyyy-mm-dd
    $scope.dateValidate = function(str) {

        return validator.dateValidate(str);
    };

    //mm/dd/yyyy
    $scope.dateValidate2 = function(str) {

        return validator.dateValidate2(str);
    };

    $scope.formValidate = function() {

        if(!$scope.answers.Q33 || !$scope.answers.Q34 || !$scope.answers.Q35 || !$scope.answers.Q36 ||
            !$scope.answers.Q51 || !$scope.answers.Q52 || !$scope.answers.Q53 || !$scope.answers.Q54 || !$scope.answers.Q55 || !$scope.answers.Q57 || !$scope.answers.Q58) {
            $scope.required = true;
            return false;
        }

        if($scope.answers.A32==undefined || !($scope.answers.A32.length>0)) {
            $scope.required = true;
            return false;
        }

        if($scope.answers.A56==undefined || !($scope.answers.A56.length>0)) {
            $scope.required = true;
            return false;
        }


        //age restricted
        if($scope.member_type.age_num>=14) {
            if(!$scope.answers.Q37 || !$scope.answers.Q38 || !$scope.answers.Q39 || !$scope.answers.Q40 || !$scope.answers.Q41) {
                $scope.required = true;
                return false;
            }
        }

        if($scope.member_type.age_num<=20) {
            if(!$scope.answers.Q42 || !$scope.answers.Q43) {
                $scope.required = true;
                return false;
            }
        }

        if($scope.member_type.age=='child' || ($scope.member_type.age_num>=0 && $scope.member_type.age_num<=3)) {
            if(!$scope.answers.Q44 || !$scope.answers.Q45) {
                $scope.required = true;
                return false;
            }
        }

        if($scope.member_type.age=='child' || ($scope.member_type.age_num>=4 && $scope.member_type.age_num<=20)) {
            if($scope.answers.A46==undefined || !($scope.answers.A46.length>0) || !$scope.answers.Q47 || !$scope.answers.Q48 || !$scope.answers.Q49 || !$scope.answers.Q50) {
                $scope.required = true;
                return false;
            }
        }


        //if selected other, validate
        if($scope.answers.A32.indexOf(8)>=0 && !$scope.answers.Q32_A) {
            $scope.required = true;
            return false;
        }

        if($scope.answers.Q33 == 1 && (!$scope.dateValidate($scope.answers.Q33_A) || !$scope.answers.Q33_B)) {
            $scope.required = true;
            return false;
        }
        if($scope.answers.Q34 == 1 && !$scope.answers.Q34_A) {
            $scope.required = true;
            return false;
        }
        if($scope.answers.Q35 == 5 && !$scope.answers.Q35_A) {
            $scope.required = true;
            return false;
        }
        if($scope.answers.Q51 == 1 && !$scope.answers.Q51_A) {
            $scope.required = true;
            return false;
        }
        if($scope.answers.Q55 == 1 && !$scope.answers.Q55_A) {
            $scope.required = true;
            return false;
        }

        return true;
    };

    $scope.onNext = function() {

        $scope.saveDTFAnaswers();

        if($scope.formValidate()) {

            api.setAnswers($scope.answers);

            api.surveyUpdateAnswer(false).then(
                function(data) {
                    $scope.$emit("moveStep", 5, 4);
                },
                function(data){
                    alert('Server connection failed!');
                }
            );

            //$location.path('/lifestyle');
        } else {
            alert("You need to complete all the required questions on the page before proceeding.");
        }
    };

    $scope.onPrev = function() {

        $scope.saveDTFAnaswers();

        api.setAnswers($scope.answers);
        $scope.$emit("moveStep", 3, null);

        //$location.path('/currentcare');
    };

    $scope.init();

}]);

app.controller('currentcareController', ['$scope', '$location', 'ApiService', 'ValidateService', function($scope, $location, api, validator) {

    $scope.step_me = 3;
    $scope.member_type = {};
    $scope.member_info = {};
    $scope.answers = {};

    $scope.init = function() {

        $scope.member_type = api.getMemberType();
        $scope.member_info = api.getMemberInfo();
        $scope.answers = api.getAnswers();
    };

    $scope.formValidate = function() {

        if(!$scope.answers.Q25 || !$scope.answers.Q26 || !$scope.answers.Q27) {
            $scope.required = true;
            return false;
        }

        if($scope.answers.A28==undefined || !($scope.answers.A28.length>0)) {
            $scope.required = true;
            return false;
        }



        //if selected other, validate
        if($scope.answers.A28.indexOf(8)>=0 && !$scope.answers.A28_A) {
            $scope.required = true;
            return false;
        }
        if($scope.answers.Q29 == 1) {

            if($scope.answers.A29_A==undefined || !($scope.answers.A29_A.length>0)) {
                $scope.required = true;
                return false;
            }
            if($scope.answers.A29_A.indexOf(3)>=0 && !$scope.answers.Q29_B) {
                $scope.required = true;
                return false;
            }
        }
        if($scope.answers.Q30 == 1) {

            if($scope.answers.A30_A==undefined || !($scope.answers.A30_A.length>0)) {
                $scope.required = true;
                return false;
            }
            if($scope.answers.A30_A.indexOf(3)>=0 && !$scope.answers.Q30_B) {
                $scope.required = true;
                return false;
            }
        }
        if($scope.answers.Q31 == 1) {

            if($scope.answers.A31_A==undefined || !($scope.answers.A31_A.length>0)) {
                $scope.required = true;
                return false;
            }
            if($scope.answers.A31_A.indexOf(5)>=0 && !$scope.answers.Q31_B) {
                $scope.required = true;
                return false;
            }
        }

        return true;
    };

    $scope.onNext = function() {

        if($scope.formValidate()) {

            api.setAnswers($scope.answers);

            api.surveyUpdateAnswer(false).then(
                function(data) {
                    $scope.$emit("moveStep", 4, 3);
                },
                function(data){
                    alert('Server connection failed!');
                }
            );

            //$location.path('/physical');
        } else {
            alert("You need to complete all the required questions on the page before proceeding.");
        }
    };

    $scope.onPrev = function() {

        api.setAnswers($scope.answers);
        $scope.$emit("moveStep", 2, null);

        //$location.path('/behavior');
    };

    $scope.init();

}]);

app.controller('behaviorController', ['$scope', '$location', 'ApiService', 'ValidateService', function($scope, $location, api, validator) {

    $scope.step_me = 2;
    $scope.member_type = {};
    $scope.member_info = {};
    $scope.answers = {};

    $scope.init = function() {

        $scope.member_type = api.getMemberType();
        $scope.member_info = api.getMemberInfo();
        $scope.answers = api.getAnswers();
    };

    $scope.formValidate = function() {

        if(!$scope.answers.Q13 || !$scope.answers.Q14 || !$scope.answers.Q15 || !$scope.answers.Q16 || !$scope.answers.Q17 || !$scope.answers.Q19 || !$scope.answers.Q20 || !$scope.answers.Q21 || !$scope.answers.Q22 || !$scope.answers.Q23 || !$scope.answers.Q24) {
            $scope.required = true;
            return false;
        }

        //age restricted
        if($scope.member_type.age=='child' || ($scope.member_type.age_num>=4 && $scope.member_type.age_num<=17)) {
            if(!$scope.answers.Q18) {
                $scope.required = true;
                return false;
            }
        }

        //if selected other, validate
        if($scope.answers.Q19 == 2 && !$scope.answers.Q19_C) {
            $scope.required = true;
            return false;
        }
        if($scope.answers.Q21 == 1 || $scope.answers.Q21 == 3) {

            if($scope.answers.A21_A==undefined || !($scope.answers.A21_A.length>0)) {
                $scope.required = true;
                return false;
            }

            if($scope.answers.A21_A.indexOf(8)>=0 && (!$scope.answers.Q21_B || !$scope.answers.Q21_C || !$scope.answers.Q21_D)) {
                $scope.required = true;
                return false;
            }
        }
        if($scope.answers.Q23 == 1 && !$scope.answers.Q23_A) {
            $scope.required = true;
            return false;
        }
        if($scope.answers.Q24 == 1 && !$scope.answers.Q24_A) {
            $scope.required = true;
            return false;
        }

        return true;
    };

    $scope.onNext = function() {

        if($scope.formValidate()) {

            api.setAnswers($scope.answers);

            api.surveyUpdateAnswer(false).then(
                function(data) {
                    $scope.$emit("moveStep", 3, 2);
                },
                function(data){
                    alert('Server connection failed!');
                }
            );

            //$location.path('/currentcare');
        } else {
            alert("You need to complete all the required questions on the page before proceeding.");
        }
    };

    $scope.onPrev = function() {

        api.setAnswers($scope.answers);
        $scope.$emit("moveStep", 1, null);

        //$location.path('/general');
    };

    $scope.init();

}]);

app.controller('generalController', ['$scope', '$location', 'ApiService', 'ValidateService', function($scope, $location, api, validator) {

    $scope.step_me = 1;
    $scope.member_type = {};
    $scope.member_info = {};
    $scope.answers = {};

    $scope.init = function() {

        $scope.member_type = api.getMemberType();
        $scope.member_info = api.getMemberInfo();
        $scope.answers = api.getAnswers();

        $scope.loadDTFAnaswers();
    };

    $scope.saveDTFAnaswers = function() {

        //answers.Q8_A
        if($scope.dateValidate2($scope.Q8_A_DTF)) {
            var ymd = $scope.Q8_A_DTF.split("/");
            $scope.answers.Q8_A = ymd[2] + '-' + ymd[0] + '-' + ymd[1];

        } else {
            $scope.answers.Q8_A = '';
        }
        //answers.Q8_C
        if($scope.dateValidate2($scope.Q8_C_DTF)) {
            var ymd = $scope.Q8_C_DTF.split("/");
            $scope.answers.Q8_C = ymd[2] + '-' + ymd[0] + '-' + ymd[1];

        } else {
            $scope.answers.Q8_C = '';
        }
        //answers.Q9_A
        if($scope.dateValidate2($scope.Q9_A_DTF)) {
            var ymd = $scope.Q9_A_DTF.split("/");
            $scope.answers.Q9_A = ymd[2] + '-' + ymd[0] + '-' + ymd[1];

        } else {
            $scope.answers.Q9_A = '';
        }
    };

    $scope.loadDTFAnaswers = function() {

        //answers.Q8_A
        if($scope.dateValidate($scope.answers.Q8_A)) {
            var ymd = $scope.answers.Q8_A.split("-");
            $scope.Q8_A_DTF = ymd[1] + '/' + ymd[2] + '/' + ymd[0];
        } else {
            $scope.Q8_A_DTF = '';
        }
        //answers.Q8_C
        if($scope.dateValidate($scope.answers.Q8_C)) {
            var ymd = $scope.answers.Q8_C.split("-");
            $scope.Q8_C_DTF = ymd[1] + '/' + ymd[2] + '/' + ymd[0];
        } else {
            $scope.Q8_C_DTF = '';
        }
        //answers.Q9_A
        if($scope.dateValidate($scope.answers.Q9_A)) {
            var ymd = $scope.answers.Q9_A.split("-");
            $scope.Q9_A_DTF = ymd[1] + '/' + ymd[2] + '/' + ymd[0];
        } else {
            $scope.Q9_A_DTF = '';
        }
    };

    /*
    $scope.saveDateAnaswers = function() {

        //answers.Q8_A
        //answers.Q8_C
        //answers.Q9_A
        if($scope.Q8_A_DT) {
            $scope.answers.Q8_A = $scope.Q8_A_DT.getFullYear() + '-' + ($scope.Q8_A_DT.getMonth() + 1) + '-' + $scope.Q8_A_DT.getDate();
        } else {
            $scope.answers.Q8_A = '';
        }
        if($scope.Q8_C_DT) {
            $scope.answers.Q8_C = $scope.Q8_C_DT.getFullYear() + '-' + ($scope.Q8_C_DT.getMonth() + 1) + '-' + $scope.Q8_C_DT.getDate();
        } else {
            $scope.answers.Q8_C = '';
        }
        if($scope.Q9_A_DT) {
            $scope.answers.Q9_A = $scope.Q9_A_DT.getFullYear() + '-' + ($scope.Q9_A_DT.getMonth() + 1) + '-' + $scope.Q9_A_DT.getDate();
        } else {
            $scope.answers.Q9_A = '';
        }
    };

    $scope.loadDateAnaswers = function() {

        //answers.Q8_A
        //answers.Q8_C
        //answers.Q9_A

        if($scope.answers.Q8_A) {
            var ymd = $scope.answers.Q8_A.split("-");
            $scope.Q8_A_DT = new Date(ymd[0],ymd[1]-1,ymd[2]);
        } else {
            $scope.Q8_A_DT = null;
        }
        if($scope.answers.Q8_C) {
            var ymd = $scope.answers.Q8_C.split("-");
            $scope.Q8_C_DT = new Date(ymd[0],ymd[1]-1,ymd[2]);
        } else {
            $scope.Q8_C_DT = null;
        }
        if($scope.answers.Q9_A) {
            var ymd = $scope.answers.Q9_A.split("-");
            $scope.Q9_A_DT = new Date(ymd[0],ymd[1]-1,ymd[2]);
        } else {
            $scope.Q9_A_DT = null;
        }
    };
    */

    //yyyy-mm-dd
    $scope.dateValidate = function(str) {

        return validator.dateValidate(str);
    };

    //mm/dd/yyyy
    $scope.dateValidate2 = function(str) {

        return validator.dateValidate2(str);
    };


    $scope.formValidate = function() {

        if(!$scope.answers.Q1 || !$scope.answers.Q2 || !$scope.answers.Q3 || !$scope.answers.Q4 || !$scope.answers.Q8) {
            $scope.required = true;
            return false;
        }

        if($scope.answers.Q4 == 1) {
            if(!$scope.answers.Q5) {
                $scope.required = true;
                return false;
            }
        }

        if($scope.member_info.Gender == 'F') {

            if(!$scope.answers.Q9) {
                $scope.required = true;
                return false;
            }


            //if selected other, validate
            if($scope.answers.Q9 == 1) {

                if(!$scope.dateValidate($scope.answers.Q9_A) || !$scope.answers.Q10 || !$scope.answers.Q11 || !$scope.answers.Q12) {
                    $scope.required = true;
                    return false;
                }

                if($scope.answers.Q12 == 1 && ($scope.answers.A12_A==undefined || !($scope.answers.A12_A.length>0))) {
                    $scope.required = true;
                    return false;
                }

                if($scope.answers.Q12 == 1 && $scope.answers.A12_A.indexOf(4)>=0 && !$scope.answers.Q12_B) {
                    $scope.required = true;
                    return false;
                }
            }

        }


        //if selected other, validate
        if($scope.answers.Q4 == 1 && (!$scope.answers.Q5 || !$scope.answers.Q6 || !$scope.answers.Q7)) {
            $scope.required = true;
            return false;
        }

        if($scope.answers.Q8 == 1 || $scope.answers.Q8 == 2) {

            if(!$scope.dateValidate($scope.answers.Q8_A) || !$scope.answers.Q8_B) {
                $scope.required = true;
                return false;
            }

            if($scope.answers.Q8_B == 9 && !$scope.dateValidate($scope.answers.Q8_C)) {
                $scope.required = true;
                return false;
            }
        }

        return true;
    };

    $scope.onPrev = function() {

        $scope.saveDTFAnaswers();

        api.setAnswers($scope.answers);
        $scope.$emit("moveStep", 0, null);

        //$location.path('/member');
    };

    $scope.onNext = function() {

        $scope.saveDTFAnaswers();

        if($scope.formValidate()) {

            api.setAnswers($scope.answers);


            api.surveyUpdateAnswer(false).then(
                function(data) {
                    $scope.$emit("moveStep", 2, 1);
                },
                function(data){
                    alert('Server connection failed!');
                }
            );

            //$location.path('/behavior');
        } else {
            alert("You need to complete all the required questions on the page before proceeding.");
        }
    };

    $scope.init();

}]);

app.controller('memberController', ['$scope', '$location', 'ApiService', 'ValidateService', function($scope, $location, api, validator) {

    $scope.step_me = 0;
    $scope.member_type = {};
    $scope.member_info = {};
    $scope.answers = {};

    $scope.init = function() {

        $scope.member_type = api.getMemberType();
        $scope.member_info = api.getMemberInfo();
        $scope.answers = api.getAnswers();
    };

    $scope.phoneValidate = function(str) {
        return validator.phoneValidate(str);
    };

    $scope.emailValidate = function(str) {
        return validator.emailValidate(str);
    };

    $scope.digit1Validate = function(str) {
        return validator.digit1Validate(str);
    };
    $scope.digit2LValidate = function(str) {
        return validator.digit2LValidate(str);
    };
    $scope.digit3LValidate = function(str) {
        return validator.digit3LValidate(str);
    };

    $scope.formValidate = function() {

        if(!$scope.answers.A12 || !$scope.answers.A21 || !$scope.answers.S25 || !$scope.answers.A26 || !$scope.answers.S30 || !$scope.answers.S31 || !$scope.answers.S33 || !$scope.answers.S34 || !$scope.answers.S35 ||
            $scope.answers.S32==undefined || !($scope.answers.S32.length > 0)) {
            $scope.required = true;
            return false;
        }

        if(!$scope.digit1Validate($scope.answers.S27) || !$scope.digit2LValidate($scope.answers.S27_A) || !$scope.digit3LValidate($scope.answers.S28) || !$scope.digit3LValidate($scope.answers.S34)) {
            $scope.required = true;
            return false;
        }

        //
        if($scope.member_type.vendor == 'no' && !$scope.answers.A10) {
            $scope.required = true;
            return false;
        }

        //if selected other, validate
        if($scope.answers.A10 == 6 && !$scope.answers.A10_A) {
            $scope.required = true;
            return false;
        }

        if($scope.answers.A12 == 2 && (!$scope.answers.A13 || !$scope.answers.A14 || !$scope.answers.A15 || !$scope.answers.A16)) {
            $scope.required = true;
            return false;
        }

        if($scope.answers.A21 == 2 && (!$scope.phoneValidate($scope.answers.A22) || !$scope.emailValidate($scope.answers.A24) || ($scope.answers.A23 && !$scope.phoneValidate($scope.answers.A23)))) {
            $scope.required = true;
            return false;
        }

        if($scope.answers.S30 == 3 && !$scope.answers.S30_A) {
            $scope.required = true;
            return false;
        }
        if($scope.answers.S32.indexOf(6) >= 0 && !$scope.answers.S32_A) {
            $scope.required = true;
            return false;
        }
        if($scope.answers.S35 == 10 && !$scope.answers.S35_A) {
            $scope.required = true;
            return false;
        }

        return true;
    };

    $scope.onNext = function() {

        if($scope.formValidate()) {

            api.setAnswers($scope.answers);

            api.surveyUpdateAnswer(false).then(
                function(data) {
                    $scope.$emit("moveStep", 1, 0);
                },
                function(data){
                    alert('Server connection failed!');
                }
            );

            //$location.path('/general');
        } else {
            alert("You need to complete all the required questions on the page before proceeding.");
        }
    };

    $scope.init();

}]);

app.controller('memberlookupController', ['$scope', '$location', 'ApiService', 'ValidateService', function($scope, $location, api, validator) {

    $scope.answers = {};

    $scope.fname = 'BRUCE';//'';
    $scope.lname = 'GANSHORN';//'';
    $scope.dob = '10/31/2003';//'';
    $scope.rid = '1019';//'';

    $scope.med_pro_img_src = '';
    $scope.member_type = '';
    $scope.member_type_plan = '';
    $scope.member_type_age = '';
    $scope.member_type_vendor = '';

    $scope.onSelectMedPro = function() {
        if($scope.med_pro == 'hip') {
            $scope.med_pro_img_src = 'images/med_pro_image1';
            $scope.member_type_plan = 'Healthy Indiana Plan "HIP"';
        } else if($scope.med_pro == 'hhw') {
            $scope.med_pro_img_src = 'images/med_pro_image2';
            $scope.member_type_plan = 'Hoosier Healthwise HHW';
        } else if($scope.med_pro == 'hcc') {
            $scope.med_pro_img_src = 'images/med_pro_image3';
            $scope.member_type_plan = 'Hoosier Care Connect HCC';
        }

    };

    $scope.onSelectMemberType = function() {
        if($scope.member_type == 1) {
            $scope.member_type_age = 'adult';
            $scope.member_type_vendor = 'no';
        } else if($scope.member_type == 2) {
            $scope.member_type_age = 'child';
            $scope.member_type_vendor = 'no';
        } else if($scope.member_type == 3) {
            $scope.member_type_age = 'child';
            $scope.member_type_vendor = 'no';
        } else if($scope.member_type == 4) {
            $scope.member_type_age = 'adult';
            $scope.member_type_vendor = 'no';
        } else if($scope.member_type == 5) {
            $scope.member_type_age = 'child';
            $scope.member_type_vendor = 'no';
        } else if($scope.member_type == 6) {
            $scope.member_type_age = 'adult';
            $scope.member_type_vendor = 'no';
        } else if($scope.member_type == 7) {
            $scope.member_type_age = 'child';
            $scope.member_type_vendor = 'yes';
        } else if($scope.member_type == 8) {
            $scope.member_type_age = 'adult';
            $scope.member_type_vendor = 'yes';
        }
    };

    //yyyy-mm-dd
    $scope.dateValidate = function(str) {

        return validator.dateValidate(str);
    };

    //mm/dd/yyyy
    $scope.dateValidate2 = function(str) {

        return validator.dateValidate2(str);
    };

    $scope.digit4Validate = function(str) {

        return validator.digit4Validate(str);
    };
    $scope.digit5Validate = function(str) {

        return validator.digit5Validate(str);
    };
    $scope.char2Validate = function(str) {

        return validator.char2Validate(str);
    };

    //Convert mm/dd/yyyy to yyyy-mm-dd
    $scope.convertDateFormat = function(dt) {

        if($scope.dateValidate2(dt)) {
            var ymd = dt.split("/");
            return ymd[2] + '-' + ymd[0] + '-' + ymd[1];
        } else {
            return '';
        }
    };

    $scope.getAgeNum = function(dt) {

        if($scope.dateValidate2(dt)) {

            var ymd = dt.split("/");
            var dob_year = ymd[2];
            var dob_month = ymd[0];
            var dob_date = ymd[1];

            var now = new Date();
            var now_year = now.getFullYear();
            var now_month = now.getMonth() + 1;
            var now_date = now.getDate();

            var age = now_year - dob_year;

            if(now_month > dob_month) {
                return age+1;
            } else if(now_month == dob_month) {
                if(now_date >= dob_date) {
                    return age+1;
                } else {
                    return age;
                }
            } else {
                return age;
            }

        } else {
            return '';
        }
    };

    $scope.formValidate = function() {

        if(!$scope.med_pro || !$scope.member_type || !$scope.fname || !$scope.lname || !$scope.dateValidate2($scope.dob) || !$scope.rid) {
            $scope.required = true;
            return false;
        }

        if(!$scope.digit4Validate($scope.rid)) {
            $scope.required = true;
            return false;
        }

        return true;
    };

    $scope.initA1A9 = function(member_info) {

        $scope.answers.A1 = member_info.FirstName.trim();
        $scope.answers.A2 = member_info.LastName.trim();
        $scope.answers.A3 = member_info.PrimaryEmail.trim();
        $scope.answers.A4 = member_info.Address1.trim();
        $scope.answers.A5 = member_info.Address2.trim();
        $scope.answers.A6 = member_info.City.trim();
        $scope.answers.A7 = member_info.State.trim();
        $scope.answers.A8 = member_info.Zip.trim();
        $scope.answers.A9 = member_info.PrimaryPhone.trim();
    };

    $scope.onNext = function() {

        if(!$scope.formValidate()) {
            alert("You need to complete all the required questions on the page before proceeding.");
            return;
        }

        var dob = $scope.convertDateFormat($scope.dob);
        var age_num = $scope.getAgeNum($scope.dob);

         api.membersearch2($scope.fname,$scope.lname, dob, $scope.rid).then(function(res) {

             console.log(res);

             var data = res.data;

             if(data.err == true) {

                 $scope.error = data.result;

             } else if(data.result == 'Cannot find user'){

                 $scope.error = data.result;

             } else {

                 $scope.initA1A9(data.result);

                 api.setMemberInfo(data.result);
                 api.setMemberType($scope.member_type_age, age_num, $scope.member_type_vendor, $scope.member_type_plan);

                 api.setAnswers($scope.answers);

                 api.surveyAddAnswer().then(
                     function(res) {
                         $scope.$emit("moveStep", 0, null);
                     },
                     function(res){
                         $scope.error = 'Something went wrong!';
                     }
                 );
             }

         },function(res) {
            console.log(res);
            $scope.error = 'Something went wrong!';
         });
    };

    $scope.init = function() {
    };

    $scope.init();

}]);
