const apiServices = angular.module('apiServices', ['restModule', 'angular-jwt'])


apiServices.constant("BASE_URL", "http://localhost/onramp/wp-json/")

apiServices.service('authService', ['loginProvider', 'jwtHelper', function (loginProvider, jwtHelper) {


    this.login = function (credentials, callback) {
        console.log(credentials)
        loginProvider.save(credentials).$promise.then(function (response) {

            console.log(response)
            response.success = true
            localStorage.setItem('id_token', response.token)
            localStorage.setItem('username', response.user_nicename)
            callback(response)

        }).catch(function (error) {
            // console.log(error)
            let msg = error.data.message
            let newMsg = msg.replace(/<a\b[^>]*>(.*?)<\/a>/i, "")

            let response = {
                'success': false,
                'message': newMsg
            }
            // console.log(response)
            callback(response)
        })
    }


    this.logout = function () {
        localStorage.removeItem('id_token')
        localStorage.removeItem('user_nicename')
    }


    this.getToken = function () {
        return localStorage.getItem("id_token");
    }

    this.getUsername = function () {
        return localStorage.getItem("username");
    }

    this.isLoggedIn = function () {

        let token = this.getToken();

        if (token == undefined) {
            return false;
        }

        if (jwtHelper.isTokenExpired(token)) {
            localStorage.removeItem("id_token")
            return false;
        }

        return true
    }

}])

apiServices.service('projectService', ['projectProvider', 'submissionProvider', '$http', 'BASE_URL', '$sce', 'authService', 'enrollmentProvider', function (projectProvider, submissionProvider, $http, BASE_URL, $sce, authService, enrollmentProvider) {


    // Submission Helper Functions
    this.submitProject = function (data, callback) {
        data.status = "private"
        submissionProvider.restrictedAccess(authService.getToken()).save(data).$promise.then(function (data) {
            console.log("saved")
            callback(data)
        }).catch(function (error) {
            callback(error)
        })


    }

    this.getAllSubmissions = function (callback) {

        submissionProvider.restrictedAccess(authService.getToken()).query().$promise.then(function (data) {
            console.log("saved")
            callback(data)
        }).catch(function (error) {
            callback(error)
        })

    }


    // Enrollment Helper Functions

    this.getAllEnrolledProjects = function (callback) {
        enrollmentProvider.restrictedAccess(authService.getToken()).query().$promise.then(function (data) {
            //console.log(data)
            let enrolledProject = []
            angular.forEach(data, function (value, key) {
                //  console.log(value.cmb2.onramp_rest_enrollment_metabox.enrolled_project)
                enrolledProject.push(value.cmb2.onramp_rest_enrollment_metabox.enrolled_project)
            })

            callback(enrolledProject)

        });
    }


    this.enrollStudentToProject = function (projectId,title,callback) {

        let schema = {
            "cmb2": {
                "onramp_rest_enrollment_metabox": {
                    "enrolled_project": projectId
                }
            },

            "status": "private",
            "title": authService.getUsername() + " enrolled to " + title
        }

        enrollmentProvider.restrictedAccess(authService.getToken()).save(schema).$promise.then(function (data) {
            
            let returnResponse;
            if(data.id == undefined){
                returnResponse = {success:false , message:"Enrollment Failed"}
            }else{
                returnResponse = {success:true,message:"Enrolled"}
            }

            callback(returnResponse)

        })
    }


    // Project Helper Functions
    this.loadProjects = function (callback) {
        let projects = []
        projectProvider.query().$promise.then(function (response) {

            console.log(typeof response)
            console.log(response)
            angular.forEach(response, function (value, key) {
                let media = false;
                if (value.featured_media != 0) {
                    $http.get(BASE_URL + "wp/v2/media/" + value.featured_media).then(function (data) {

                        media = data.data.source_url;

                        let project = {
                            id: value.id,
                            title: value.title.rendered,
                            content: value.cmb2.onramp_rest_project_metabox.description,
                            quiz: value.cmb2.onramp_rest_project_metabox.assigned_quiz,
                            media: media
                        }
                        projects.push(project)

                    })
                } else {
                    //let htmlContent = $sce.trustAsHtml(value.content.rendered)
                    let project = {
                        id: value.id,
                        title: value.title.rendered,
                        content: value.cmb2.onramp_rest_project_metabox.description,
                        quiz: value.cmb2.onramp_rest_project_metabox.assigned_quiz,
                        media: media
                    }
                    projects.push(project)
                }



            })

            callback(projects)

        }).catch(function (error) {
            console.log("Internal Error")
        })
    }

    this.loadQuiz = function (id, callback) {
        $http.get(BASE_URL + "wp/v2/onramp_quiz/" + id).then(function (data) {
            let response = data.data
            // console.log(response)
            let quiz = {
                question: response.cmb2.onramp_rest_quiz_metabox.onramp_rest_quiz_demo,
                title: response.title.rendered
            }
            callback(quiz)
        })
    }

    this.loadSingleProject = function (id, callback) {
        console.log("this is id", id)
        projectProvider.get({ project_id: id }).$promise.then(function (response) {
            // console.log(response)
            let project = {
                success: true,
                title: response.title.rendered,
                content: $sce.trustAsHtml(response.content.rendered),
                quiz: response.cmb2.onramp_rest_project_metabox.assigned_quiz
            }

            callback(project)
            // console.log(project)
        }).catch(function (error) {
            console.log("Internal Error")
        })
    }




}])
