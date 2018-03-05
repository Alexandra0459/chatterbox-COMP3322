var my_app = angular.module('loadpage', []);
var currentname='';
my_app.filter('htmlContent',['$sce', function($sce) {
    return function(input) {
        return $sce.trustAsHtml(input);
    }
}]);
function gettime() {
    var date = new Date();

    var seperator2 = ":";
    var hour=date.getHours();
    if(hour<10)
        hour='0'+hour;
    var minute=date.getMinutes();
    if(minute<10)
        minute='0'+minute;
    var second=date.getSeconds();
    if(second<10)
        second='0'+second;
    var currenttime = hour + seperator2 + minute
        + seperator2 + second;
    return currenttime;
}

function getdate() {
    var date = new Date();
    var a = new Array("SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT");
    var week = new Date().getDay();
    var day = a[week];
    var seperator2 = " ";
    var month=new Array(12);
    month[0]="Jan";
    month[1]="Feb";
    month[2]="Mar";
    month[3]="Apr";
    month[4]="May";
    month[5]="Jun";
    month[6]="Jul";
    month[7]="Aug";
    month[8]="Sep";
    month[9]="Oct";
    month[10]="Nov";
    month[11]="Dec";
    var mon=month[date.getMonth()];
    var currentdate = day + seperator2 + mon
        + seperator2 + date.getDate()+seperator2+date.getFullYear();
    return currentdate;
}
var setscroll=function(){
    mai=document.getElementById('overflow');

    mai.scrollTop=mai.scrollHeight+100;
};
angular.module('loadpage').directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {
            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });

                event.preventDefault();
            }
        });
    };
});
my_app.controller('pagecontroller', ['$scope','$interval','$http',function($scope,$interval, $http){

    $scope.load = function(){
        $scope.new_user = {username:"",password:""};
        $http.get("/load").then(function(response){
            if(response.data!=''){
                $scope.visible = 1;
                $scope.friendsinfo=response.data.friends; //store the name and id of each friend
                $scope.usericon=response.data.icon;
                $scope.username=response.data.name;
                $scope.friendnames='';
                $scope.friendsinfo.forEach(function(item){
                    if(item.messagecount>0){
                        item.message="("+item.messagecount+")";
                    }
                    else
                        item.message='';
                });

            }
        }, function(response){
            alert("Error getting response:"+response.statusText);
        });
    };
    $scope.login = function(user){

        if(user.username==''||user.password==''){
            alert("You must enter username and password.");
            return;
        }
        $http.post("/login",user).then(function(response){
            if(response.data!=''&&response.data.msg==''){
                $scope.visible = 1;
                $scope.friendsinfo=response.data.friends; //store the name and id of each friend
                user.password='';                  //Clear the password to prepare for the logout
                $scope.lgfailvisible=0;
                $scope.usericon=response.data.icon;
                $scope.username=response.data.name;
                $scope.friendsinfo.forEach(function(item){
                    if(item.messagecount>0){
                        item.message="("+item.messagecount+")";
                    }
                    else
                        item.message='';
                });
                //$scope.load();
            }
            else{
                $scope.lgfailvisible=1;
            }

        }, function(response){
            alert("Error getting response:"+response.statusText);
        });
    };
    $scope.logout = function(){
        $http.get("/logout").then(function(response){
            if(response.data!=''){
                $scope.visible = !$scope.visible;
                $scope.viscont = 0;
                $scope.visconv=0;
                           }
            else{
                alert("Logout Failed");
            }
        }, function(response){
            alert("Error getting response:"+response.statusText);
        });
    };
    $scope.getinfo = function(){
        $http.get("/getuserinfo").then(function(response){
            if(response.data!=''){
                $scope.viscont = 1;

                $scope.visconv=0;
                $scope.new_user.mobilenumber=response.data.mobileNumber;
                $scope.new_user.homenumber=response.data.homeNumber;
                $scope.new_user.address=response.data.address;
                $scope.friendsinfo.forEach(function(item){   //Try to control the css behaviour
                        item.friendclick=0;
                });
            }

            else{
                alert("Failed to get user information");
            }
        }, function(response){
            alert("Error getting response:"+response.statusText);
        });
    };
    $scope.save = function(user){
        var putmessage={};
        putmessage.mobileNumber=user.mobilenumber;
        putmessage.homeNumber=user.homenumber;
        putmessage.address=user.address;
        $http.put("/saveuserinfo",putmessage).then(function(response){
            if(response.data!=''){
                $scope.viscont = 1;
                $scope.visconv=0;

            }
            else{
                alert("Update User Information Failed:"+response.data.msg);
            }
        }, function(response){
            alert("Error getting response:"+response.statusText);
        });
    };
    $scope.loadfriend=function(target,scroll){
        $scope.conversationid='';

        $scope.friendsinfo.forEach(function(item){   //Try to control the css behaviour
            if(item.name==target){
                item.friendclick=1;
                item.message='';
                $scope.conversationid=item.id;
            }
            else {
                item.friendclick = 0;
                if (item.messagecount > 0) {
                    item.message = "(" + item.messagecount + ")";
                }
                else
                    item.message = '';
            }
        });
        $http.get("/getconversation/"+$scope.conversationid).then(function(response){
            if(response.data!=''){
                $scope.visconv = 1;
                $scope.viscont=0;
                $scope.conversation=response.data;
                $scope.i=0;
                $scope.time=new Array();

                $scope.found=0;
                $scope.biggerflag=0;
                //$scope.found=$scope.conversation.receivedmessages[0].date<$scope.conversation.sentmessages[0].date; //testing code
                $scope.conversation.receivedmessages.forEach(function(item){ //Try to find dates

                    $scope.time.forEach(function(item1){
                    if(item1.date==item.date) {
                    $scope.found=1;
                      }});
                    if($scope.found==0){
                        $scope.time[$scope.i]=new Array();
                    $scope.time[$scope.i].date=item.date;
                        $scope.time[$scope.i].messages=new Array();
                    $scope.i++;}
                    $scope.found=0;
                });

                $scope.conversation.receivedmessages.forEach(function(item){  //Try to insert messages into dates
                    $scope.time.forEach(function(item1){
                        if(item1.date==item.date) {
                            item.receiveflag=1;  //Means messages is received, not sent
                            item.deleted=0;
                            item1.id=item._id;
                            item1.messages.push(item);
                        }});
                });
                $scope.conversation.sentmessages.forEach(function(item){ //Try to find sent dates and try to sort the dates

                   $scope.time.forEach(function(item1){
                       if(item1.date==item.date) {
                            $scope.found=1;
                       }});
                  if($scope.found==0){
                      if($scope.i==0){
                          var p=new Array();
                          p.date=item.date;
                          p.messages=new Array();
                          $scope.time.splice(0,0,p);
                          $scope.i++;
                      }
                      else {
                          for (var j = 0; j < $scope.i; j++) {
                              if (j == 0 && $scope.time[j]._id > item._id) {
                                  var p = new Array();
                                  p.date = item.date;
                                  p.messages = new Array();
                                  $scope.time.splice(j, 0, p);
                                  $scope.time[j].id = item._id;
                                  $scope.i++;
                                  break;
                              }
                              if (($scope.time[j]._id < item._id && $scope.time[j]._id > item._id) || j == ($scope.i - 1)) {
                                  var p = new Array();
                                  p.date = item.date;
                                  p.messages = new Array();
                                  $scope.time.splice(j + 1, 0, p);
                                  $scope.time[j].id = item._id;
                                  $scope.i++;
                                  break;
                              }
                          }
                      }
                     }
                  $scope.found=0;
               });
               $scope.conversation.sentmessages.forEach(function(item){  //Try to insert messages into dates
                  $scope.time.forEach(function(item1){
                      if(item1.date==item.date) {
                          item.receiveflag=0;  //Means messages is sent, not received
                          item.deleted=0;
                          item1.messages.push(item);
                      }});
               });
                if(scroll==1){
                    $scope.checknewmsgnum();
                    setTimeout("setscroll()",100);
                    $scope.userinput="Type your message here";
                }
            }
            else{
                alert("Getting Conversation Failed:"+response.data.msg);
            }
        }, function(response){
            alert("Error getting response:"+response.statusText);
        });
        $scope.conversationname=target;
        currentname=target;
        //
    };
    $scope.deletemessage=function(target,flag) {
        if(flag==0){
    var mesid=target;

        var confirmation = confirm('Are you sure you want to delete this message?');
        if(confirmation==true){
        $http.delete("/deletemessage/"+mesid).then(function(response){
            if(response.data!=''){
                $scope.time.forEach(function(item){
                    item.messages.forEach(function(item1,index,object){
                        if(item1._id==mesid){
                            item1.deleted=1;
                            object.splice(index, 1);
                            //$scope.loadfriend(currentname,0);

                        }
                    });
                });
                $scope.time.forEach(function(item,index1,object1){    //If after deleting, there is no messages on that day,just delete that date.


                        if(item.length==0){


                            $scope.loadfriend(currentname,0);

                        }

                });
            }
            else{
                alert("Delete Message Failed:"+response.data.msg);
            }
        }, function(response){
            alert("Error getting response:"+response.statusText);
        });
        }}
    };
    $scope.clickinput=function(){
        if($scope.userinput=="Type your message here")   //If it's not a user input, just clear it; otherwise keep the input
        $scope.userinput='';
    };
    $scope.addmessage=function(){

        if(message=''){
            alert("Input message should not be none.");
            $scope.userinput="Type your message here";
        }
        else{
            $scope.newmessage=new Array();
            $scope.newmessage.date=getdate();
            $scope.newmessage.time=gettime();
            $scope.newmessage.message=$scope.userinput;
            var str = {"date":getdate(), "time":gettime(),"message":$scope.userinput};
            var sent=JSON.stringify(str);

            var friendid=$scope.conversationid;
            $http.post("/postmessage/"+friendid, sent).then(function(response){
                if(response.data!=''){
                    //$scope.loadfriend(currentname,1);
                    if($scope.time.length!=0){
                    response.data.forEach(function(item){ //Try to find sent dates and try to sort the dates
                    
                        $scope.time.forEach(function(item1){
                            if(item1.date==item.date) {
                                $scope.found=1;
                            }});
                        if($scope.found==0){
                            if($scope.i==0){
                                var p=new Array();
                                p.date=item.date;
                                p.messages=new Array();
                                $scope.time.splice(0,0,p);
                                $scope.i++;
                            }
                            else {
                                for (var j = 0; j < $scope.i; j++) {
                                    if (j == 0 && $scope.time[j]._id > item._id) {
                                        var p = new Array();
                                        p.date = item.date;
                                        p.messages = new Array();
                                        $scope.time.splice(j, 0, p);
                                        $scope.time[j].id = item._id;
                                        $scope.i++;
                                        break;
                                    }
                                    if (($scope.time[j]._id < item._id && $scope.time[j]._id > item._id) || j == ($scope.i - 1)) {
                                        var p = new Array();
                                        p.date = item.date;
                                        p.messages = new Array();
                                        $scope.time.splice(j + 1, 0, p);
                                        $scope.time[j].id = item._id;
                                        $scope.i++;
                                        break;
                                    }
                                }
                            }
                        }
                        $scope.found=0;
                    });
                    response.data.forEach(function(item){  //Try to insert messages into dates
                        $scope.time.forEach(function(item1){
                            if(item1.date==item.date) {
                                item.receiveflag=0;  //Means messages is sent, not received
                                item.deleted=0;
                                item1.messages.push(item);
                            }});
                    });
                    $scope.userinput="Type your message here";
                    setTimeout("setscroll()",100);
                    }else $scope.loadfriend(currentname,1);
                }
                else{
                    alert("Error inserting message.")
                }
            }, function(response){
                alert("Error getting response:"+response.statusText);
            });
        }
    };
    $scope.checknewmsgnum=function(){
        if($scope.visible==1) {

            $scope.friendsinfo.forEach(function (item) {

                $http.get("/getnewmsgnum/" + item.id).then(function (response) {
                    if (response.data != '') {
                        item.messagecount=response.data.num;
                        if (response.data.num > 0) {
                            item.message = "(" + response.data.num + ")";
                        }
                        else
                            item.message = '';
                    }
                    else {
                        alert("Error requesting new message numbers.")
                    }
                }, function (response) {
                    alert("Error getting response:" + response.statusText);
                });

            });
        }
    };
    $scope.checknewmessages=function(){
        if($scope.visconv==1){                      //Only check when there is a active conversation
            var friendid=$scope.conversationid;
            $http.get("/getnewmessages/" + friendid).then(function (response) {
                if (response.data != '') {
					if(response.data.allmesid.length!=0){
                    $scope.conversation.status=response.data.status;
                    //var deleteflag=1;
                    var performdelete=0;
                    $scope.time.forEach(function(item){
                        item.messages.forEach(function(item1,index,object){
							item1.deleteflag=0;
                            if(item1.receiveflag===1) item1.deleteflag=1;
                            
                            response.data.allmesid.forEach(function(item2){
                                if(item1._id===item2){
                                    item1.deleteflag=0;
                                }
                            });
                            if(item1.deleteflag==1){
                                //item1.deleted=1;
                               // performdelete+=1;
                                object.splice(index, 1);
                            }
                        });

                    });
                    $scope.time.forEach(function(item,index1,object1){//If after deleting, there is no messages on that day,just delete that date.
                        if(item.messages.length==0){
                            object1.splice(index1, 1);
                            //$scope.loadfriend(currentname,0);
                        }
                    });
                    
                  if(performdelete==0){
						var foundflag=0;
						if(response.data.messages!=null){
                   if(response.data.messages.length!=0) {
                        response.data.messages.forEach(function (item) {  //Try to insert messages into dates
							var du=0;
                           $scope.time.forEach(function (item1) {
                               if (item1.date == item.date) {
								   item1.messages.forEach(function(item2){
									   if (item2._id==item._id)
									   du=1;
								   });
								   if(du==0){
                                  item.receiveflag = 1;  //Means messages is received,not send
                                   item.deleted = 0;
                                   item1.messages.push(item);
                                   foundflag=1;}
                                   du=0;
                               }
                           });
                           if(foundflag==0){
							   $scope.loadfriend(currentname,1);
						   }
						   foundflag=0
                       });
                       setTimeout("setscroll()",100);
                    }}
				}else{$scope.loadfriend(currentname,0);
					performdelete=0;}
					
                }else $scope.loadfriend(currentname,0);
                }
                //$scope.checkfriendstatus();
               //$scope.loadfriend(currentname,0);
            }, function (response) {
                alert("Error getting response:" + response.statusText);
            });

        }
    };
    $scope.checkfriendstatus=function(){
        if($scope.visconv==1){                      //Only check when there is a active conversation
            var friendid=$scope.conversationid;
            $http.get("/getconversation/"+$scope.conversationid).then(function(response){
                if(response.data!=''){

                        $scope.conversation=response.data;
                        $scope.i=0;
                        $scope.time=new Array();

                        $scope.found=0;
                        $scope.biggerflag=0;
                        //$scope.found=$scope.conversation.receivedmessages[0].date<$scope.conversation.sentmessages[0].date; //testing code
                        $scope.conversation.receivedmessages.forEach(function(item){ //Try to find dates

                            $scope.time.forEach(function(item1){
                                if(item1.date==item.date) {
                                    $scope.found=1;
                                }});
                            if($scope.found==0){
                                $scope.time[$scope.i]=new Array();
                                $scope.time[$scope.i].date=item.date;
                                $scope.time[$scope.i].messages=new Array();
                                $scope.i++;}
                            $scope.found=0;
                        });

                        $scope.conversation.receivedmessages.forEach(function(item){  //Try to insert messages into dates
                            $scope.time.forEach(function(item1){
                                if(item1.date==item.date) {
                                    item.receiveflag=1;  //Means messages is received, not sent
                                    item.deleted=0;
                                    item1.id=item._id;
                                    item1.messages.push(item);
                                }});
                        });
                        $scope.conversation.sentmessages.forEach(function(item){ //Try to find sent dates and try to sort the dates

                            $scope.time.forEach(function(item1){
                                if(item1.date==item.date) {
                                    $scope.found=1;
                                }});
                            if($scope.found==0){
                                if($scope.i==0){
                                    var p=new Array();
                                    p.date=item.date;
                                    p.messages=new Array();
                                    $scope.time.splice(0,0,p);
                                    $scope.i++;
                                }
                                else {
                                    for (var j = 0; j < $scope.i; j++) {
                                        if (j == 0 && $scope.time[j]._id > item._id) {
                                            var p = new Array();
                                            p.date = item.date;
                                            p.messages = new Array();
                                            $scope.time.splice(j, 0, p);
                                            $scope.time[j].id = item._id;
                                            $scope.i++;
                                            break;
                                        }
                                        if (($scope.time[j]._id < item._id && $scope.time[j]._id > item._id) || j == ($scope.i - 1)) {
                                            var p = new Array();
                                            p.date = item.date;
                                            p.messages = new Array();
                                            $scope.time.splice(j + 1, 0, p);
                                            $scope.time[j].id = item._id;
                                            $scope.i++;
                                            break;
                                        }
                                    }
                                }
                            }
                            $scope.found=0;
                        });
                        $scope.conversation.sentmessages.forEach(function(item){  //Try to insert messages into dates
                            $scope.time.forEach(function(item1){
                                if(item1.date==item.date) {
                                    item.receiveflag=0;  //Means messages is sent, not received
                                    item.deleted=0;
                                    item1.messages.push(item);
                                }});
                        });

                }
                else{
                    alert("Getting Conversation Failed:"+response.data.msg);
                }
            }, function(response){
                alert("Error getting response:"+response.statusText);
            });

        }
    };

    var timer = $interval($scope.checknewmsgnum,1000);
    var timer1 = $interval($scope.checknewmessages,1000);

}]);
