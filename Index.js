const express= require('express');
const bodyParser=require('body-parser');
const app=express();
const cors =require('cors');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const jwt=require('jsonwebtoken');
const mongoClient=require('mongodb');
url="mongodb://localhost:27017";
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

function authenticatepassenger(req,res,next){
	
	let token=req.header('Authorization');
	console.log(token);
	if(token == undefined){
		res.status(401).json({
			message:"Unauthorized"
		});
	}else{
		let decode=jwt.verify(token,'fasfsdfdsfs');
		if(decode!== undefined){
			next();
		}else{
			res.status(401).json({
			message:"Unauthorized"
		});
		}
    }
    
	
}

function authenticateoperator(req,res,next){
	
	let token=req.header('Authorization');
	console.log(token);
	if(token == undefined){
		res.status(401).json({
			message:"Unauthorized"
		});
	}else{
		let decode=jwt.verify(token,'ddssdsdsd');
		if(decode!== undefined){
			next();
		}else{
			res.status(401).json({
			message:"Unauthorized"
		});
		}
    }
    
	
}

app.post('/register/passenger' ,function(req,res){
    mongoClient.connect(url, (err, client) => {
           if (err) return console.log(err);
           var db=client.db("busdb");
           var newData={
           name :req.body.name,
           age:req.body.age,
           email:req.body.email, 
           pwd:req.body.pwd,
           contact:req.body.contact,
            ticketsbooked:{
                ticketid:null,
                price:null,
                status:null,
                seat:null,
                date:null
            }
                   
           }
           bcrypt.genSalt(saltRounds, function(err, salt) {
               if(err)throw err;
               console.log(salt); // Salt is generated(hash)
           bcrypt.hash(req.body.pwd, salt, function(err, hash) {
               if(err)throw err;
               console.log(hash);
               newData.pwd=hash;
       db.collection("buspass").insertOne(newData,function(err,data){
           if(err)throw err;
           client.close();
           res.json({
            message:"Passenger registered Successfully"
       });
           });
           
           
   
           });
       });
   });
    });
    

    app.post('/login/passenger' ,function(req,res){
        mongoClient.connect(url, (err, client) => {
               if (err) return console.log(err);
               var db=client.db("busdb");
           db.collection("buspass").findOne({email:req.body.email},function(err,userdata){
               if(err)throw err;
               client.close();
               console.log(userdata);
               bcrypt.compare(req.body.pwd,userdata.pwd, function(err, result) {
               if(result){
                   
                   //Generate token
                   var jwtToken =jwt.sign({id:userdata.id},authenticate,'fasfsdfdsfs');
                   console.log(jwtToken);
               res.json({
                   message:"Logged in",
                   token :jwtToken
               });
           }
       });
               });
               
               
       
               });
           });


           app.post('/register/operator' ,function(req,res){
            mongoClient.connect(url, (err, client) => {
                   if (err) return console.log(err);
                   var db=client.db("busdb");
                   var newData={
                   name :req.body.name,
                   age:req.body.age,
                   email:req.body.email, 
                   pwd:req.body.pwd,
                   contact:req.body.contact
        
                           
                   }
                   bcrypt.genSalt(saltRounds, function(err, salt) {
                       if(err)throw err;
                       console.log(salt); // Salt is generated(hash)
                   bcrypt.hash(req.body.pwd, salt, function(err, hash) {
                       if(err)throw err;
                       console.log(hash);
                       newData.pwd=hash;
               db.collection("busop").insertOne(newData,function(err,data){
                   if(err)throw err;
                   client.close();
                   res.json({
                    message:"Operator registered,Approval pending"
               });
                   });
                   
                   
           
                   });
               });
           });
            });


           app.post('/login/operator' ,function(req,res){
            mongoClient.connect(url, (err, client) => {
                   if (err) return console.log(err);
                   var db=client.db("busdb");
               db.collection("busop").findOne({email:req.body.email},function(err,userdata){
                   if(err)throw err;
                   client.close();
                   console.log(userdata);
                   bcrypt.compare(req.body.pwd,userdata.pwd, function(err, result) {
                   if(result){
                       
                       //Generate token
                       var jwtToken =jwt.sign({id:userdata.id},authenticate,'ddssdsdsd');
                       console.log(jwtToken);
                   res.json({
                       message:"Logged in",
                       token :jwtToken
                   });
               }
           });
                   });
                   
                   
           
                   });
               });
    app.put('/passengers/editprofile/:emailid',authenticatepassenger,function(req,res){
	 console.log(req.params.email);
	 
	 mongoClient.connect(url,function(err,client){
		if(err)throw err;
	var db = client.db("Busdb");
	db.collection("buspass").updateOne({email:req.params.email},{$set :{"name":req.body.name,"age":req.body.age,"contact":req.body.contact}},function(err,data){
		if(err)throw err;
		
		client.close();
		 res.json({
		 message:"Profile Updated"
		
	});
	
	 });
	 
	
	 });
 });
 app.get('passenger/viewroutes/:source/:destination/:date',authenticatepassenger,(req,res)=>{
    console.log(req.params.source);
    console.log(req.params.destination);
    console.log(req.params.date);
    mongoClient.connect(url,(err,client)=>{
        if(err) throw err;
        var db = client.db('busdb');
        db.collection('buspass').find({'source':req.params.source,'destination':req.params.destination,'date':req.params.date},(err,data)=>{
            if(err) throw err;
            if(data){
                client.close();
                res.json(data)
            }
            else{
                client.close();
                res.json({
                    message: 'no buses found'
                })
            }
        })
    })

})
app.get('passenger/viewtickets/:email',authenticatepassenger,(req,res)=>{
    mongoClient.connect(url,(err,client)=>{
        if(err) throw err;
        var db = client.db('busdb');
        db.collection('buspass').find({'email':req.params.email},(err,data)=>{
            if(err) throw err;
            client.close();
            res.json({
                tickets: data.ticketsBooked
            })
        })
    })
})

app.put('passenger/bookseats/:email',authenticatepassenger,(req,res)=>{
    console.log(req.body);
    mongoClient.connect(url,(err,client)=>{
        if(err) throw err;
        var db = client.db('busdb');
        db.collection('buspass').find({'email':req.params.email},(err,data)=>{
            if(err) throw err;
            console.log(data);
            const passengerTicketDetails = {
                 
                    ticketId: req.body.ticketId,
                    noOfTickets:req.body.noOfTickets,
                    price: req.body.price,
                    status: 'upcoming',
                    date: req.body.date,
                    time: req.body.time,
                    seatNo: req.body.seatNo
                
            }
            db.collection('buspass').updateOne({'email':req.params.email},{ $set : {'ticketsBooked':passengerTicketDetails}},(err,data)=>{
                if(err) throw err;
                client.close();
                res.json({
                    message: 'bus tickets booked'
                })
            })
        })
    })
})


app.put('passenger/cancelseats/:email',authenticatepassenger,(req,res)=>{
    console.log(req.body);
    mongoClient.connect(url,(err,client)=>{
        if(err) throw err;
        var db = client.db('busdb');
        db.collection('buspass').find({'email':req.params.email},(err,data)=>{
            if(err) throw err;
            console.log(data);
            const passengerTicketDetails = {
                 
                    ticketId: req.body.ticketId,
                    noOfTickets:req.body.noOfTickets,
                    price: req.body.price,
                    status: 'cancelled',
                    date: req.body.date,
                    time: req.body.time,
                    seatNo: req.body.seatNo
                
            }
            db.collection('buspass').updateOne({'email':req.params.email},{ $set : {'ticketsBooked':passengerTicketDetails}},(err,data)=>{
                if(err) throw err;
                client.close();
                res.json({
                    message: 'bus tickets cancelled'
                })
            })
        })
    })
})


app.put('bus/bookseat/:regNo',authenticatepassenger,(req,res)=>{
    console.log(req.body);
    mongoClient.connect(url,(err,client)=>{
        if(err) throw err;
        var db = client.db('busdb');
        db.collection('bus').find({'regNo':req.params.regNo},(err,data)=>{
            if(err) throw err;
            console.log(data);
            const bus = {
                availableTickets:data.availableTickets - req.body.noOfTickets
            }
            db.collection('bus').updateOne({'regNo':req.params.regNo},{$set :{
                'availableTickets':bus.availableTickets
            }
        },(err,data)=>{
                if(err) throw err;
                client.close();
                res.json({
                    message: 'bus tickets booked'
                })
            })
        })
    })
})


//cancel Ticket

app.put('bus/cancelseats/:regNo',authenticatepassenger,(req,res)=>{
    console.log(req.body);
    mongoClient.connect(url,(err,client)=>{
        if(err) throw err;
        var db = client.db('busdb');
        db.collection('bus').find({'regNo':req.params.regNo},(err,data)=>{
            if(err) throw err;
            console.log(data);
            const bus = {
                availableTickets:data.availableTickets + req.body.noOfTickets
            }
            db.collection('bus').updateOne({'regNo':req.params.regNo},{$set :{
                'availableTickets':busBookDetails.availableTickets
            }
        },(err,data)=>{
                if(err) throw err;
                client.close();
                res.json({
                    message: 'bus tickets cancelled'
                })
            })
        })
    })
})



app.post('/operator/addbus', authenticateoperator, (req, res) => {
    const busDetails = {
        name: req.body.name,
        source: req.body.source,
        destination: req.body.destination,
        date: req.body.date,
        time: req.body.time,
        totalTickets: req.body.totalTickets,
        availableTickets: req.body.availableTickets,
        price: req.body.price,
        busType: req.body.busType,
        status: 'pending',
        regNo: req.body.regNo,
        driverNo: req.body.driverNo,
        operatorName: req.body.operatorName
    }
    mongoClient.connect(url, (err, client) => {
        let db = client.db('busdb');
        db.collection('bus').findOne({ "regNo": req.body.regNo }, (err, data) => {
            if (err) throw err;
            if (!data) {
                db.collection('bus').insertOne(busDetails, (err, data) => {
                    if (err) throw err;
                    client.close();

                    res.json(data)
                })
            }
            else {
                client.close();
                res.json({
                    message: 'bus already exists'
                })
            }
        })
    })
})

app.delete('/operator/deletebus/:regno',authenticateoperator,(req,res)=>{
    console.log(req.params.regNo);
    mongoClient.connect(url,(err,client)=>{
        let db = client.db('busdb');
        db.collection('bus').deleteOne({'regNo':req.params.regNo},(err,data)=>{
            if(err) throw err;
            client.close();
            res.json({
                message:'bus deleted'
            })
        })
    })
})



        
       app.listen(3000,function(){
       console.log("Port is running in 3000")
       });