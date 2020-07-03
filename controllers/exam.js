app.controller("examCtrl", function ($scope, $interval) {

    $scope.examCode = getParaCurr("examCode")
    $scope.licenseCode = license.code

    let questionNos = fullExams.filter(function(exam){return (exam.exam == parseInt($scope.examCode) && exam.licenseCode == $scope.licenseCode)}).map(function(exam){return exam.questionNo})
    $scope.questionNos = questionNos
    $scope.questions = fullQuestions.filter(function(question){return questionNos.includes(question.index)})

    $scope.countDown = license.timer
    //$scope.saveAnses = new Array(questionNos.length).fill(false)

    $interval(function() {
        $scope.countDown--
        let minutes = Math.floor($scope.countDown / 60)
        let seconds = Math.floor($scope.countDown % 60)

        $scope.timer = `${minutes} : ${seconds}`
        
        if ($scope.countDown == 0) $scope.submit()
    }, 1000, $scope.countDown)

    load(0)

    function load(index = 0) {
        
        $scope.index = index;
        $scope.show_result = false;

        $scope.question = $scope.questions[index]
    }

    $scope.nextQuestion = function() {
        let index = $scope.index;
        index ++;

        if (index > $scope.questions.length - 1) index =$scope.questions.length - 1

        load(index);
    }

    $scope.prevQuestion = function() {
        let index = $scope.index;
        index --;

        if (index < 0) index = 0;

        load(index);
    }

    $scope.toggleAnswer = function (answerIndex) {
        toggleExamAnswer($scope.licenseCode, $scope.examCode, $scope.question.index, answerIndex);
    }

    $scope.isAnswered = function(answerIndex) {
        return getExamAnswered($scope.licenseCode, $scope.examCode, $scope.question.index) == answerIndex ? "checked" : ""
    }

    $scope.submit = function() {
        let saveAnses = $scope.questionNos.map(function(questionIndex){
            return isExamAnsweredCorrect($scope.licenseCode, $scope.examCode, questionIndex)
        })
        let dangerQuestions = $scope.questions.filter(function(question){return question.required > 0})
        let dangerCorrectAnses  = dangerQuestions.map(function(question){return isExamAnsweredCorrect($scope.licenseCode, $scope.examCode, question.index) })
        let danger = dangerCorrectAnses.length
        let passed = saveAnses.filter(function(ans){return ans == true}).length
        let result = (passed >= license.pass)?1:0
        let hasAns = $scope.questions.filter(function(question){return hasExamAnswered($scope.licenseCode, $scope.examCode, question.index)}).length
        let unchecked = $scope.questionNos.length - hasAns
        let failed = $scope.questionNos.length - (passed + unchecked)
        saveExam($scope.licenseCode, $scope.examCode, `{"passed":${passed}, "failed":${failed}, "danger":${danger}, "unchecked": ${unchecked}, "time":${$scope.countDown}, "result":${result}}`)
    }
});
