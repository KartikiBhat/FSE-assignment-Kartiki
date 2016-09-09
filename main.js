var express=require('express');
var app=require('express')();
var http=require('http').Server(app);
var io=require('socket.io')(http);
 
var cookie=require('cookie-parser');
var mysql=require("mysql");
app.use(cookie());
//connect to sql database
var con=mysql.createConnection({
	host: "localhost",
	user: 'root',
	password:'H@rrypotter3',
	database:"chat_db"
});
con.connect(function(err){
	
	if(err){
		
		console.log("error connecting to db");
		return;
	}
	console.log("connection established");
});


// display login page

app.get('/login.html',function(req,res){
res.sendFile('C:/Javascript files/chat_basic/Kartiki Bhat submit'+'/login.html');
});

    
	var user;
	
	//login and redirect to chat page
	app.get('/process_get',function(req,res){
	response={name:req.query.name};
	if(req.query.name=="")
	{
		res.redirect('/login.html');
	}
	else{
	console.log(response);
	res.cookie('userName',req.query.name);
	res.redirect('/index.html');
	con.query('INSERT INTO users SET username=?',[ req.query.name], function(err,resp){
	if(err)throw err;
	});
	console.log('logged in');
	user=req.query.name;
	}
	});
	
	// logout from chat and go back to login page
	app.get('/logout', function(req,res){
	res.redirect('/login.html');
	con.query('DELETE FROM users WHERE username=?',[user], function(err,resp){
	if(err)throw err;
		});
	console.log('logged out');
	
	});

	con.query('SELECT message FROM messages',function(err,rows){
		if(err)throw err;
		
		console.log(rows);
		
		io.emit('load_previous',rows);
		for(var i=0;i < rows.length;i++)
		io.emit(rows[i].message);
		
		console.log(rows.length);
	});

	
	io.on('connection',function(socket){
//	console.log('a user connected');
	
	socket.on('chat message', function(msg){

		var d= new Date();
	
		console.log(msg.user+':'+ msg.message);
	
	con.query('INSERT INTO messages SET username=?, message=?, time=?',[ msg.user, msg.message, d], function(err,resp){
	if(err)throw err;
	});
		io.emit('chat message',msg);
	});
	});

app.use(express.static('C:/Javascript files/chat_basic/Kartiki Bhat submit'));
http.listen(8081,function(){
	
	console.log("listening on *:8081");
});