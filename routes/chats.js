//Testing code starts
var express = require('express');
var router = express.Router();
var session=require("express-session");
var bodyParser = require('body-parser');
var ssn;

var flag=0;
var jsonParser = bodyParser.json();//获取JSON解析器中间件
router.use(session({name:"userid",secret: 'random_string_goes_here'}));
/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Chat' });
});
/* Get load page */
router.get('/load', function(req, res, next) {  //haven't finished
    var db = req.db;
    var collection = db.get('messageList');
    var collection2=db.get('userList');
    ssn=req.session;
    //console.log(ssn.userid);
    if (ssn.userid!=null) {
        //var friendid=req.params.friendid;
        //var filter={ "senderid" : ssn.userid,"receiverid":friendid};
        //var filter1={"_id":friendid};
        var filter3;
        var lastMsgId;
        var doc={};
        var filter2={ "_id":ssn.userid};

        collection2.findOne(filter2, function(err, docs){ //Find the name and lastMsgId of friends, as well as name and icon
                if (err === null){
                    doc["friends"]=docs["friends"];

                    doc["name"]=docs["name"];
                    doc["icon"]=docs["icon"];

                    //res.json(doc["friends"]);
                    //try to get id of each friends
                    var newfilter=new Array();
                    doc.friends.forEach(function(item){
                        newfilter.push(item.name);
                    });
                    //console.log(newfilter);
                    collection2.find({"name":{"$in":newfilter}},{},function(err,docs){
                        var leng=docs.length;
                        for(var i=0;i<leng;i++){   //there are some problems with the sequence, so I have to design two loops
                            for(var j=0;j<doc.friends.length;j++){
                            if(doc.friends[j].name===docs[i]["name"]){
                                doc.friends[j].id=docs[i]["_id"];}
                            }
                           // console.log(doc.friends);
                        }
                        collection.find({"receiverId":ssn.userid},{},function(err,docs2){
                            //console.log(ssn.userid);
                            //console.log(docs);
                            doc.friends.forEach(function(item){
                                item.messagecount=0;
                                for(var k=0;k<docs2.length;k++){
                                    //console.log(item.name);
                                    if((docs2[k]["senderId"]==item.id)&&(docs2[k]["_id"]>item["lastMsgId"])){
                                        //console.log(docs2[k]["senderId"]);
                                        item.messagecount+=1;
                                    }
                                }
                            });
                            //console.log(doc.friends);
                        //console.log(doc);
                        res.json(doc);
                        });
                    });

                    }
                else res.send({msg:"err2" });
            });
    } else {
        //var myjson;

                res.send('');



    }
});
router.post('/login', jsonParser, function(req, res) {
    var db = req.db;
    var collection = db.get('messageList');
    var collection2 = db.get('userList');
    var username=req.body.username;
    var password=req.body.password;
    var mes={"name":username,"password":password};
    //console.log(mes);

    collection2.find(mes, function(err, docs){   //Not sure
        if(err===null){
        req.session.userid=docs[0]["_id"];
        var idd=docs[0]["_id"];
        ssn=req.session;
            var filter3;
            var lastMsgId;
            var doc={};
            var filter2={ "_id":ssn.userid};

            collection2.update(filter2,{$set:{"status": "Online"}}   //there may some problem with ""
                , function(err, result){
                    if (err === null) {
                        collection2.findOne(filter2, function (err, docs) { //Find the name and lastMsgId of friends, as well as name and icon
                            if (err === null) {
                                doc["friends"] = docs["friends"];

                                doc["name"] = docs["name"];
                                doc["icon"] = docs["icon"];

                                //res.json(doc["friends"]);
                                //try to get id of each friends
                                var newfilter = new Array();
                                doc.friends.forEach(function (item) {
                                    newfilter.push(item.name);
                                });
                                //console.log(newfilter);
                                collection2.find({"name": {"$in": newfilter}}, {}, function (err, docs) {
                                    var leng = docs.length;
                                    for (var i = 0; i < leng; i++) {   //there are some problems with the sequence, so I have to design two loops
                                        for (var j = 0; j < doc.friends.length; j++) {
                                            if (doc.friends[j].name === docs[i]["name"]) {
                                                doc.friends[j].id = docs[i]["_id"];
                                            }
                                        }
                                        // console.log(doc.friends);
                                    }


                                    collection.find({"receiverId":ssn.userid.toString()}, {}, function (err, docs1) {
                                        //console.log(ssn.userid);
                                        //console.log(docs1);
                                        doc.friends.forEach(function (item) {
                                            item.messagecount = 0;
                                            //console.log(docs1.length);
                                            for (var k = 0; k < docs1.length; k++) {
                                                //console.log(item.name,docs1[k]["senderId"],item["id"],docs1[k]["_id"], item["lastMsgId"]);
                                                if (docs1[k]["senderId"] == item["id"] && docs1[k]["_id"] > item["lastMsgId"]) { //
                                                    item.messagecount += 1;
                                                }
                                            }
                                        });
                                        //console.log(doc.friends);
                                        //console.log(doc);
                                        doc.msg = '';
                                        res.json(doc);
                                    });
                                });

                            }
                            else res.send({msg: "err"});
                        });
                    }
                    else{
                        res.send({msg:"err"});
                    }
                });

        }else {
            res.send({msg:"err"});
        }
    });
});
router.get('/logout', function(req, res){
    var db = req.db;
    var collection = db.get('userList');
    ssn=req.session;
    var filter={ "_id" : ssn.userid};
    collection.update(filter,{$set:{"status": "Offline"}}   //there may some problem with ""
        , function(err, result){
        req.session.userid = null;
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});
router.get('/getuserinfo', function(req, res){
    var db = req.db;
    var collection = db.get('userList');
    ssn=req.session;
    var filter={ "_id" : ssn.userid};
    var doc={};
    collection.findOne(filter, { mobileNumber: 1, homeNumber: 1, address:1 }   //too more information?
        , function(err, docs){
            if (err === null){
                doc.mobileNumber=docs.mobileNumber;
            doc.homeNumber=docs.homeNumber;
            doc.address=docs.address;
                res.json(doc);}
            else res.send({msg: err });
        });
});
router.put('/saveuserinfo', function(req, res){
    var db = req.db;
    var collection = db.get('userList');
    ssn=req.session;
    var filter={ "_id" : ssn.userid};
    var body=req.body;
    collection.update(filter,{$set:body}   //there may some problem with ""
        , function(err, result){
            res.send(
                (err === null) ? { msg: '' } : { msg: err }
            );
        });
});
router.get('/getconversation/:friendid', function(req, res){
    var db = req.db;
    var collection = db.get('messageList');
    var collection2=db.get('userList');
    var friendid=req.params.friendid;
    ssn=req.session;
    ssn.userid=req.session.userid;
    var filter={ "senderid" : ssn.userid,"receiverid":friendid};
    //console.log(filter);
    var filter1={"_id":friendid};
    var filter3;
    var lastMsgId;
    var doc;
    collection2.find(filter1, { name:1 }  //Find the Name of The Friend
        , function(err, docs){
            if (err === null){
                filter3=docs[0]["name"];
            var filter2={"_id":ssn.userid};
            collection2.findOne(filter2           //Find the last message id to the Frind
                , function(err, docs){
                    if (err === null){

                        var friends=docs["friends"];
                        friends.forEach(function(item){
                            var name=item["name"];
                            if(name==filter3){
                                lastMsgId =item["lastMsgId"];
                            }
                        });
                        //console.log({"senderid" : ssn.userid,"receiverid":friendid});
                        collection.find({"senderId":friendid,"receiverId":ssn.userid},function(err,docs){
                            if (err === null){
                                doc=docs;
                                 //console.log(doc);
                                doc.forEach(function(item){
                                    var newid=item["_id"];
                                    if(newid>lastMsgId){
                                        lastMsgId =newid;
                                    }
                                });
                                //console.log(lastMsgId);
                                var doc2={};
                                //console.log(friendid);
                                collection2.find({"_id" :friendid},function(err,docs){
                                    if (err === null){
                                        doc2.icon=docs[0]["icon"];
                                        doc2.status=docs[0]["status"];
                                        doc2.receivedmessages=doc;
                                        //console.log(doc2);
                                        var finalfilter={"_id":ssn.userid,"friends.name":filter3}; //Set the Last Message Label
                                        //console.log(finalfilter);
                                        collection2.update(finalfilter,{$set:{"friends.$.lastMsgId":lastMsgId}}   //there may some problem with ""
                                            , function(err, result){
                                                if(err===null)
                                                    collection.find({"receiverId":friendid,"senderId":ssn.userid}   //there may some problem with ""
                                                        , function(err, doc3){
                                                            if(err===null){
                                                                doc2.sentmessages=doc3;
                                                                //console.log(doc2);
                                                                res.json(doc2);}
                                                            else res.send({msg: err });
                                                        });

                                                else res.send({msg: err });
                                            });
                                    }
                                    else res.send({msg: err });
                                });
                            }
                            else res.send({msg: err });
                        });
                    }
                    else res.send({msg: err });
                });}
            else res.send({msg: err });
        });
});
router.post('/postmessage/:friendid', jsonParser, function(req, res) {
    var db = req.db;
    var collection = db.get('messageList');
    var friendid=req.params.friendid;
    var message=req.body.message;
    var date=req.body.date;
    var time=req.body.time;
    //console.log(req.body);
    ssn=req.session;
    var mes={"senderId":ssn.userid,"receiverId":friendid,"message":message,"date":date,"time":time};            //There may be some "" problems
    collection.insert(mes, function(err, result){   //Not sure
        collection.find(mes, { _id:1 }
            , function(err, docs){
                if (err === null){
                    //console.log(docs);
                    res.json(docs);}

                else res.send({msg: err });
            });
    });
});
router.delete('/deletemessage/:msgid', function(req, res) {
    var db = req.db;
    var currentfriend='';
    var friendname='';
    var collection = db.get('messageList');
    var collection2=db.get('userList');
    ssn=req.session;
    var id=req.params.msgid;
    var filter={ "_id" : id};
    collection.findOne(filter, function(err, result){   //try to get the recevierid
        if(err === null){
           currentfriend=result.receiverId;
           var myid=result.senderId;
            collection2.findOne({"_id":currentfriend}, { name:1 }  //Find the Name of The Friend
                , function(err, docs){
                if(err===null){
                    //console.log(docs);
                    friendname=docs.name;
                    collection.remove(filter, function(err, result){
                        if(err === null){
                            collection2.findOne({"_id":myid}, { name:1 }  //Find the Name of The Friend
                                , function(err, docs1) {
                                    if (err === null) {
                                        var myname=docs1.name;
                                        console.log(myname);
                            var filter2={ "_id" : currentfriend};
                            collection2.findOne(filter2,{}//there may some problem with ""
                                , function(err,doc){
                                console.log(doc);
                                    if(err===null){
										var findflag=0;
                                        doc.friends.forEach(function(item){
                                            console.log(item.name,item.lastMsgId.toString());
                                            if(item.name==myname&&item.lastMsgId.toString()==id){
												findflag=1;
                                                console.log("get it");
                                                var currentmessages=new Array();
                                                collection.find({
                                                    "senderId": ssn.userid,
                                                    "receiverId": currentfriend
                                                }, function (err, docs) {
                                                    if(err===null){
                                                        docs.forEach(function(item){
                                                            currentmessages.push(item._id);
                                                            }
                                                        );
                                                                var newMesId;
                                                                console.log(currentmessages.length);
                                                                if(currentmessages.length==0){
                                                                    newMesId="0";
                                                                }
                                                                else{
                                                                    newMesId=currentmessages[0];
                                                                    currentmessages.forEach(function(itemx){
                                                                        if(itemx>newMesId){
                                                                            newMesId=itemx;
                                                                        }
                                                                    });

                                                                }
                                                                console.log(newMesId);


                                                                          var finalfilter={"_id":currentfriend,"friends.name":myname}; //Set the Last Message Label
                                                                          //console.log(finalfilter);
                                                                          collection2.update(finalfilter,{$set:{"friends.$.lastMsgId":newMesId}}   //there may some problem with ""
                                                                              , function(err, result){
                                                                                  if(err===null){
                                                                                      res.send({ msg: '' });
                                                                                  }else res.send({msg: err});
                                                                              });




                                                    }
                                                    else res.send({msg: err});
                                                });
                                            }
                                            //else {}
                                        }); if(findflag==0) res.send({ msg: '' }); 

                                    }
                                    else res.send({ msg: err });
                                });

                        }  else res.send({ msg: err });
                    });
                        }  else res.send({ msg: err });
                    });
                } else res.send({ msg: err });
                });

        }  else res.send({ msg: err });
    });

});
router.get('/getnewmessages/:friendid', function(req, res) {
    var db = req.db;
    var collection = db.get('messageList');
    var collection2=db.get('userList');
    var friendid=req.params.friendid;
    ssn=req.session;
    var filter={ "senderid" : ssn.userid,"receiverid":friendid};
    var filter1={"_id":friendid};
    var filter3;
    var lastMsgId;
    var doc;
    collection2.find(filter1, { name:1 }  //Find the Name of The Friend
        , function(err, docs){
        //console.log(docs);
            if (err === null){
                filter3=docs[0]["name"];
                var filter2={"_id":ssn.userid};
                collection2.findOne(filter2           //Find the last message id to the Frind
                    , function(err, docs){
                        if (err === null){

                            var friends=docs["friends"];
                            friends.forEach(function(item){
                                var name=item["name"];
                                if(name==filter3){
                                    lastMsgId =item["lastMsgId"];
                                }
                            });
                            //console.log({"senderid" : ssn.userid,"receiverid":friendid});
                            console.log(friendid,ssn.userid);
                            if(lastMsgId==0||lastMsgId==null){
                                collection.find({"senderId" : friendid.toString(),"receiverId":ssn.userid.toString()},function(err,docs){
                                        if(docs.length!=0){
                                        doc=docs;
                                        lastMsgId=doc[0]._id;
                                        console.log(docs);
                                        doc.forEach(function(item){
                                            var newid=item["_id"];
                                            if(newid>lastMsgId){
                                                lastMsgId =newid;
                                            }
                                        });
									}else lastMsgId=0;
                                        //console.log(lastMsgId);
                                        var doc2={};
                                        //console.log(friendid);
                                        collection2.find({"_id" :friendid},function(err,docs){
                                            if (err === null){
                                                doc2.icon=docs[0]["icon"];
                                                doc2.status=docs[0]["status"];
                                                doc2.messages=doc;
                                                console.log(doc);
                                                doc2.allmesid=new Array();
                                                //console.log(doc2);
                                                var finalfilter={"_id":ssn.userid,"friends.name":filter3}; //Set the Last Message Label
                                                //console.log(finalfilter);
                                                collection2.update(finalfilter,{$set:{"friends.$.lastMsgId":lastMsgId}}   //there may some problem with ""
                                                    , function(err, result){
                                                        if(err===null){
                                                            collection.find({
                                                                "senderId": friendid,
                                                                "receiverId": ssn.userid
                                                            }, function (err, docs) {
                                                                if(err===null){
                                                                    docs.forEach(function(item){
                                                                            doc2.allmesid.push(item._id);
                                                                        }
                                                                    );
                                                                    collection.find({
                                                                        "senderId": ssn.userid,
                                                                        "receiverId": friendid
                                                                    }, function (err, docs) {
                                                                        if(err===null){
                                                                            docs.forEach(function(item1){
                                                                                    doc2.allmesid.push(item1._id);
                                                                                }
                                                                            );
                                                                            //console.log(doc2);
                                                                            res.json(doc2);
                                                                        }
                                                                        else res.send({msg: err});
                                                                    });
                                                                }
                                                                else res.send({msg: err});
                                                            });}
                                                        else res.send({msg: err });
                                                    });
                                            }
                                            else res.send({msg: err });
                                        });
                                   
                                });
                            }
                            else {
                                collection.find({
                                    "_id": {$gt: lastMsgId},
                                    "senderId": friendid,
                                    "receiverId": ssn.userid.toString()
                                }, function (err, docs) {
                                    if (err === null) {
                                        doc = docs;
                                        console.log(docs);
                                        doc.forEach(function (item) {
                                            var newid = item["_id"];
                                            if (newid > lastMsgId) {
                                                lastMsgId = newid;
                                            }
                                        });
                                        //console.log(lastMsgId);
                                        var doc2 = {};
                                        //console.log(friendid);
                                        collection2.find({"_id": friendid}, function (err, docs) {
                                            if (err === null) {
                                                doc2.icon = docs[0]["icon"];
                                                doc2.status = docs[0]["status"];
                                                doc2.messages = doc;
                                                console.log(doc);
                                                doc2.allmesid=new Array();
                                                //console.log(doc2);
                                                var finalfilter = {"_id": ssn.userid, "friends.name": filter3}; //Set the Last Message Label
                                                //console.log(finalfilter);
                                                collection2.update(finalfilter, {$set: {"friends.$.lastMsgId": lastMsgId}}   //there may some problem with ""
                                                    , function (err, result) {
                                                        if (err === null) {
                                                            collection.find({
                                                                "senderId": friendid,
                                                                "receiverId": ssn.userid
                                                            }, function (err, docs) {
                                                            if(err===null){
                                                                docs.forEach(function(item){
                                                                    doc2.allmesid.push(item._id);
                                                                    }
                                                                );
                                                                collection.find({
                                                                    "senderId": ssn.userid,
                                                                    "receiverId": friendid
                                                                }, function (err, docs) {
                                                                    if(err===null){
                                                                        docs.forEach(function(item1){
                                                                            doc2.allmesid.push(item1._id);
                                                                            }
                                                                        );
                                                                        //console.log(doc2);
                                                                        res.json(doc2);
                                                                    }
                                                                    else res.send({msg: err});
                                                                });
                                                            }
                                                            else res.send({msg: err});
                                                            });
                                                            //console.log(doc);
                                                           // res.json(doc2);
                                                        }
                                                        else res.send({msg: err});
                                                    });
                                            }
                                            else res.send({msg: err});
                                        });
                                    }
                                    else res.send({msg: err});
                                });
                            }
                        }
                        else res.send({msg: err });
                    });}
            else res.send({msg: err });
        });
});
router.get('/getnewmsgnum/:friendid', function(req, res) {
    var db = req.db;
    var collection = db.get('messageList');
    var collection2=db.get('userList');
    var friendid=req.params.friendid;
    ssn=req.session;
    var filter={ "senderid" : ssn.userid,"receiverid":friendid};
    var filter1={"_id":friendid};
    var filter3;
    var lastMsgId;
    var doc;
    collection2.find(filter1, { name:1 }  //Find the Name of The Friend
        , function(err, docs){
            if (err === null){
                filter3=docs[0]["name"];
                var filter2={"_id":ssn.userid};
                collection2.findOne(filter2           //Find the last message id to the Frind
                    , function(err, docs){
                        if (err === null){
                            var friends=docs["friends"];
                            friends.forEach(function(item){
                                var name=item["name"];
                                if(name==filter3){
                                    lastMsgId =item["lastMsgId"];
                                }
                            });
                            //console.log(lastMsgId,ssn.userid,friendid);
                            if(lastMsgId==0) {
                                collection.find({"senderId" : friendid,"receiverId":ssn.userid},function(err,docs){
                                    if (err === null){
                                        res.send({num:docs.length});

                                    }
                                    else res.send({msg: err });
                                });
                            }else{
                                collection.find({"_id":{$gt:lastMsgId},"senderId" : friendid,"receiverId":ssn.userid},function(err,docs){
                                    if (err === null){
                                        res.send({num:docs.length});

                                    }
                                    else res.send({msg: err });
                                });
                            }//to avoid some bugs
                             //   console.log("success");
                            //    lastMsgId="5a153786e329be03ac10ce7d";
                            //}
                            //console.log(lastMsgId);

                        }
                        else res.send({msg: err });
                    });}
            else res.send({msg: err });
        });
});

module.exports = router;
//Testing code ends
