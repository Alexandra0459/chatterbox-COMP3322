Please note that 
1.CSS3 features like display:flex; as well as HTML5 features are used ,
so please use newer versions of browsers to test the page.
2.Please don't delete chatterbox1.png in public folder. This is a web page header logo designed by me.
3.This program highly depends on one assumption: Newer messages always have larger objectid than older messages. According to the mongodb manual,
 this is always true. But if we manually break this rule, this program may not work properly.
4.In the mongodb messageList database, I designed the serderId and receiverId to be string.
5.In my data structure, lastMsgId of each friend in userList is stored as ObjectId, while sendId/receiverId is stored as string.
  So if you have some problems in testing my program, please adjust to this data structure.
6.Please do not use IE to test the page. Some functions doesn't work well on IE.
Implementation details:
Server-side logic:
1.At first, I hope to perform multiple mongodb queries at the same time.
For example, in the response to /load request, server side should retrieve the new message numbers of all the friends.
At the beginning, I implemented it by using foreach() function and send one mongodb query for each friend.
But soon I found that it's almost impossible for me to control the time sequences of the queries.
So I changed the way of making queries: I tried to retrieve all the messages sent by the user, and count them in the server.
And all the complex responses implementations continues this line of thinking.
2.I found that there may be some bugs when two people have no messages to each other before（That is to say, lastMsgId=0）. When lastMsgId=0, my mongodb cannot retrieve newer messages by using the filter $gt: lastMsgId.
Two fix this bug, I added some code to the client side. When lastMsgId=0, server directly retrieve all the messages and ignore the filter $gt: lastMsgId, since all messages are new messages at that time.



Client-side logic:
1.	Webpage is implemented by modularization using display:flex .
2.	The most difficult part, I think, is displaying all the messages between two people in time order, adding a tag for each date, and making sure that messages sent and messages received display differently. I implemented this by the following steps:
    1.	First, search the received messages for dates, if there is a new date, add the date to the time collection;
    2.  Search received messages again, and insert messages to each date. Set the flag of received messages to be 1.
    3.  Search sent messages and try to find if there are new dates, if so, insert the date to the time collection, and use id of the first message of this date to sort the date.
    4.  Insert sernt messages to each date.Set the flag of received messages to be 0.
    5.  Display messages and dates using ng-repeat.
    6.  Control the css styling rules of received messages and sent messages using the flag.


  
