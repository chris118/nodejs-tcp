var net = require('net');  
var mysql = require('mysql');
var dbConfig = require('./dbconfig');
var logSql = require('./logsql');
var util = require('./util');

// 使用DBConfig.js的配置信息创建一个MySQL连接池
// var pool = mysql.createPool( dbConfig.mysql );
//创建一个connection
var connection = mysql.createConnection(dbConfig.mysql);
//创建一个connection
connection.connect(function(err){
    if(err){       
        console.log('[query] - :'+err);
        return;
    }
    console.log('[connection connect]  succeed!');
});

var server = net.createServer();  
  
//聚合所有客户端  
var sockets = [];  
  
//接受新的客户端连接  
server.on('connection', function(socket){  
    console.log('got a new connection');  
    sockets.push(socket);  
    //从连接中读取数据  
    socket.on('data', function(data){  
        console.log('got data:', data.toString());  

        let time = util.formatDate(new Date(), "yyyy-MM-dd hh:mm:ss.S");
        console.log(time);

        //存入数据库
        connection.query(logSql.insert,[data, new Date()],function (err,result) {
            if(err){
                console.log('[INSERT ERROR] - ',err.message);
                return;
            }
            //console.log('INSERT ID:',result);
        });

  
        // console.log('client count:', sockets.length);
        //广播数据  
        //每当一个已连接的用户输入数据，就将这些数据广播给其他所有已连接的用户  
        sockets.forEach(function(otherSocket){  
            otherSocket.write(data + 'from server'); 
            // if (otherSocket !== socket){  
            //     otherSocket.write(data.toString() + 'from server');  
            // }  
        });  
  
        //删除被关闭的连接  
        socket.on('close', function(){  
            console.log('connection closed');  
            var index = sockets.indexOf(socket);  
            sockets.splice(index, 1);  
        });  
    });  
});  
  
server.on('error', function(err){  
    console.log('Server error:', err.message);  
});  
  
server.on('close', function(){  
    console.log('Server closed');  
});   
  
server.listen(4000);