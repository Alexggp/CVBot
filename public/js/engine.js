
(function(){
     var app = angular.module('chat',[]);
     
     app.controller('ChatController',['$timeout','$http','$scope',function($timeout,$http,$scope){
            $scope.messageList = [];
            $scope.currentMessage= '';
            $scope.currentTone= 'neutral';
            var currentContext = '';
            $scope.sendMessage = function(msn){

                    if(msn || $scope.currentMessage){
                        if($scope.currentMessage){
                            $scope.messageList.push({
                                text: $scope.currentMessage,
                                input: false
                            });
                        }

                        setTimeout(function(){
                            $("#display").scrollTop($("#display").height()*100);
                        },100);
                        var data = {
                            message: $scope.currentMessage,
                            context: currentContext
                        }
                        $scope.currentMessage='';
                        $http.post('/api/conversation', data)
                            .success(function (data) {
                                console.log(data)
                                currentContext = JSON.stringify(data.context);
                                $scope.messageList.push({
                                    text: data.conversation.output.text[0],
                                    input: true,
                                    context: data.conversation.context
                                });
                                if (data.tone.document_tone && data.tone.document_tone.tones.length){
                                    var tone = _.max( data.tone.document_tone.tones, function(mood){ return mood.score; });
                                    $scope.currentTone = tone.tone_id;

                                }else{
                                    $scope.currentTone = 'neutral'
                                }

                                setTimeout(function(){
                                    $("#display").scrollTop($("#display").height()*100);
                                },100);
                            })
                            .error(function (data) {
                                console.log(data)
                            });
                    }s

            }
            $scope.sendMessage(true)

            $timeout(function(){
                $( window ).bind('keypress', function(e){
                    if ( e.keyCode == 13 ) {
                        $( '#send' ).click();
                    }
                });
            })
            //
     }]);
})();



