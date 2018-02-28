const app = angular.module("onramp", ['apiServices', 'ui.router', 'ui.router.state.events'])


app.config(function ($stateProvider, $locationProvider, $urlRouterProvider) {

    $stateProvider.state("login", {
        url: "/login",
        templateUrl: "./views/form.html",
        controller: "mainController"
    }).state("projects", {
        url: "/projects",
        templateUrl: "./views/projects.html",
        controller: "projectController"

    }).state("home", {
        url: "/",
        templateUrl: "./views/home.html"
    }).state("projectByID", {
        url: "/project/:id",
        templateUrl: "./views/project-single.html",
        controller: "projectController",
        authenticate: true,
    })
    $locationProvider.html5Mode(true).hashPrefix('');

    $urlRouterProvider.otherwise("/")



})


app.run(function ($rootScope, $location, authService, $state, $transitions) {



    $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {

        console.log(toState)
        console.log((fromState.name == "login"))

        console.log($location)

        // console.log($location.path())
        if ($location.path() == "/login") {

            if (authService.isLoggedIn()) {
                $location.path("projects")
            }
        }

        if (toState.authenticate) {
            if (!authService.isLoggedIn()) {
                console.log("Not logged in")
                $location.path("login")
            }
        }

        // if(toState.name == "login"){
        //     console.log("this is a rest")
        //     if(authService.isLoggedIn()){
        //         console.log("this is inside login")
        //         $state.go("projects")
        //         // $location.path("projects")
        //     }
        // }

        // if ((authService.isLoggedIn() && (toState.name == "login"))) {

        //     $state.go("projects")

        // }

        // if (toState.authenticate && !authService.isLoggedIn()) {
        //     // User isn’t authenticated
        //     //   console.log("This is test")
        //     $state.transitionTo("login");
        //     event.preventDefault();
        // }
    });


    event.preventDefault();
    // $state.go('Home');

    //   $transitions.onStart({ }, function(trans) {
    //       console.log($state.$current)
    //       console.log(trans)
    //       console.log("This is a test")
    //     var auth = trans.injector().get('authService');
    //     if (!auth.isLoggedIn()) {
    //       // User isn't authenticated. Redirect to a new Target State
    //     //   return trans.router.stateService.target('login');
    //     console.log("you have to login")
    //     }
    //   });




})

app.controller('mainController', ['$scope', 'authService', '$sce', 'projectService', '$state', function ($scope, authService, $sce, projectService, $state) {

    let auth = authService;
    let projects = projectService;
    $scope.disableLoginButton = false;

    $scope.isFormProcessing = false;
    $scope.credential = {}
 


    $scope.login = function () {

        $scope.disableLoginButton = true;

        $scope.isFormProcessing = true;

        console.log($scope.credential)

        $scope.data = {
            username: $scope.credential.email,
            password: $scope.credential.password
        }

        console.log("this is a tes")

        console.log($scope.data)

        console.log("--------------")
        auth.login($scope.data, function (response) {

            if (response.success) {
                console.log(auth.isLoggedIn())
                console.log($state.go("projects"))

            } else {
                // console.log(response.message)

                $scope.loginError = $sce.trustAsHtml(response.message);
                $scope.isFormProcessing = false;
            }
        })

    }

    // $scope.getProjects = function () {
    //     projects.loadProjects(function (data) {
    //         console.log(data)
    //     });
    // }

    // $scope.getProjects();

}])


app.controller('projectController', ['$scope', 'projectService', '$stateParams', '$sce', 'authService', '$state', function ($scope, projectService, $stateParams, $sce, authService, $state) {

    $scope.projects = {}

    $scope.isLoaded = false;

    $scope.submissionStuff = {}

    $scope.singleProject = { success: false }

    $scope.hasProjectHasQuiz = true;

    $scope.projectLoaded = false;

    $scope.projectQuiz = {}

    $scope.auth = authService;

    let projectsHandler = projectService;

    let enrolledProjects = [];

    $scope.showQuiz = false;

    $scope.correctAnswerModal = false;

    /***************************Function called on ng-init or page load***********************************************/

    // Get the list of enrolled projects if logged in
    if (authService.isLoggedIn()) {
        projectsHandler.getAllEnrolledProjects(function (data) {
            console.log(data)
            enrolledProjects = data;
        })
    }

    // Get all the list of projects
    $scope.getProjects = function () {

        projectsHandler.loadProjects(function (data) {

            $scope.projects = data
            $scope.isLoaded = true;

        });

    }


    $scope.getProjectById = function () {
        // console.log($stateParams.id)
        projectsHandler.loadSingleProject($stateParams.id, function (response) {

            if (response.success) {
                if (!response.quiz) {

                    $scope.hasProjectHasQuiz = false;

                }

                $scope.projectLoaded = true;
                $scope.singleProject = response;
                $scope.isLoaded = true;


            }


        })
    }


    /********************************************************************************/

    // Enrollment Section

    // Check if the project is enrolled
    $scope.isEnrolled = function (id) {

        return enrolledProjects.indexOf(id.toString()) > -1 ? true : false

    }


    $scope.enrollToProject = function (projectID, project_title) {

        projectsHandler.enrollStudentToProject(projectID, project_title, function (data) {
            if (data.success) {
                $state.go("projectByID", { id: projectID })
            }
        })

    }

    // Quiz Sections

    $scope.startQuiz = function () {
        if ($scope.hasProjectHasQuiz) {
            $scope.showQuiz = true;
            projectService.loadQuiz($scope.singleProject.quiz, function (response) {
                console.log(response)
                $scope.projectQuiz = response;
            })

        }
    }

    $scope.checkAnswer = function (selection, event) {
        console.log($scope.correctAnswerModal)
        console.log("This is test")
        console.log(event)
        // console.log(event.target.style.backgroundColor ="red")
        let parentID = this.$parent.$index;
        let clickId = this.$index
        // console.log(this)
        // console.log(selection)

        // console.log(selection)

        // $scope.correctAnswerModal = true;
        // console.log($scope.correctAnswerModal)

        if ($scope.projectQuiz.question[parentID].c == (clickId + 1)) {
            // (event.target);
            event.target.className = "quizCorrectColor"
            $scope.correctAnswerModal = true;
            console.log($scope.correctAnswerModal)
            // alert("correct answer")
        } else {
            event.target.className = "quizErrorColor"
            // $scope.correctAnswerModal = true;

            // alert("wrong answer")
        }


    }

    $scope.closeCorrectModal = function () {
        $scope.correctAnswerModal = false;
        console.log("This si a test")
    }


    // Submission Sections

    $scope.submissions = function () {
        $scope.submissionStuff.title = $scope.singleProject.title;
        projectsHandler.submitProject($scope.submissionStuff, function (data) {
            console.log(data)
        })
    }

    // projectsHandler.getAllSubmissions(function(data){
    //     console.log(data)
    // });


}])