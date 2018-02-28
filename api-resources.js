const restModule = angular.module('restModule', ['ngResource', 'apiServices'])

restModule.constant("BASE_URL", "http://localhost/onramp/wp-json/")


restModule.factory('loginProvider', ['$resource', 'BASE_URL', function ($resource, BASE_URL) {
    //$scope.apiURL = ""

    // console.log(BASE_URL + 'jwt-auth/v1/token');
    return $resource(BASE_URL + 'jwt-auth/v1/token')

}])


restModule.factory('projectProvider', ['$resource', 'BASE_URL', function ($resource, BASE_URL) {

    return $resource(BASE_URL + "wp/v2/onramp_project/:project_id", { project_id: "@id" })

}])

restModule.factory('submissionProvider', ['$resource', 'BASE_URL', 'authService', function ($resource, BASE_URL, authService) {

    // return $resource(BASE_URL + "wp/v2/onramp_submission",null,{
    //     save:
    // })

    return {
        restrictedAccess: function (token) {
            return $resource(BASE_URL + "wp/v2/onramp_submission", null, {
                save: {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                },
                query: {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                    isArray: true
                }
            })

        },

    }

}])

restModule.factory('enrollmentProvider', ['$resource', 'BASE_URL', function ($resource, BASE_URL) {


    return {
        restrictedAccess: function (token) {
            return $resource(BASE_URL + "wp/v2/onramp_enrollment", null, {
                save: {
                    method: 'POST',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    }
                },
                query: {
                    method: 'GET',
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                    isArray: true
                }
            })

        },

    }

}])
