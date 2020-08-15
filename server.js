//===========================================================================//
//
// COVID-19 Location Scanner
// by Nicholas Smith 2020
//
// OPEN SOURCE VERSION
// As part of the 2020 Garudahacks Hackathon
//
//===========================================================================//


//Define the server port:
var port = 27015 || process.env.PORT;

//Get the required modules to start the server:
var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);

//Get the file system module:
var fs = require("fs");

//Get the hashing modules and create new instances of them:
var jshashes = require("jshashes");
var md5 = new jshashes.MD5;
var sha256 = new jshashes.SHA256;
var sha512 = new jshashes.SHA512;

//Get the cookie module:
var cookie = require("cookie");

//Initiate a new mongodb client:
var mongodb = require("mongodb");
var MongoClient = mongodb.MongoClient;
var mongo_details = JSON.parse(fs.readFileSync("db_credentials.json"));
var ObjectId = mongodb.ObjectId;

//The URI to connect to the mongodb atlas:
var uri = "mongodb+srv://"+ mongo_details.username +":"+ mongo_details.password +"@contact-tracing-data.2ke7w.mongodb.net/?retryWrites=true&w=majority";

//Start the server:
http.listen(port, function(){

    console.log("Server started on port " + port);

});

//Serve the public directory to the client:
app.use(express.static(__dirname + "/public/"));

//Serve index.html when a user connects:
app.get("/", function(request, response){
    response.sendFile(___dirname + "/index.html")
});

io.of("/submit_location", function(socket){
    
    console.log(socket.id + " connected to /submit_location");
    socket.on("disconnect", ()=>{ console.log(socket.id + " disconnected from /submit_location") })

    socket.on("fields", function(data){

        //The incoming data should be as follows:
        /* {
         *  "location_name": String,
         *  "email": String,
         *  "gov_id_no": String,
         *  "photo_gov_id": Base64 Image,
         *  "photo_diagnosis": Base64 Image,
         *  "placeID": String,
         *  "coords": JSON
         * }
        */
       //None of the incoming data should exceed the length of 5 as well as be empty

       console.log("/submit_location received data from frontend with placeID: " + data.placeID);
        
       //Given that our requirements are met, we should insert the data into the database:
       MongoClient.connect(uri, { useUnifiedTopology: true }, function(err, client){

            if (err){
                console.log("Error connecting to mongodb: " + err);
            } else {

                var db = client.db("contact_tracing");

                db.collection("garuda_pending_reports").insertOne(data, function(error, result){

                    if (error){
                        console.log("/submit_location Error inserting to mongodb: " + error);
                    } else {
                        console.log("/submit_location inserted data into mongodb");
                        socket.emit("success");
                    }

                });

            }

       });

    });

});

io.of("/approve_menu", function(socket){

    console.log(socket.id + " connected to /approve_menu");
    socket.on("disconnect", ()=>{ console.log(socket.id + " disconnected from /approve_menu") });

    console.log("/approve_menu emitting data to client");

    MongoClient.connect(uri, { useUnifiedTopology: true }, function(err, client){

        if (err){ 
            console.log("Error connecting to the server: " + err);
        } else {

            var db = client.db("contact_tracing");

            db.collection("garuda_pending_reports").find({}).toArray(function(err, results){
                for (var i = 0; i < results.length; i++){
                    
                    socket.emit("item", {
                        "href": results[i]._id,
                        "location_name": results[i].location_name
                    }, results.length);

                    console.log("/approve_menu emitting " + results[i]._id + " to user with " + results.length + " available");
                
                }
            });

        }

    });

});

io.of("/view_page", function(socket){

    console.log(socket.id + " connected to /view_page");
    socket.on("disconnect", ()=>{ console.log(socket.id + " disconnected from /approve_menu") });

    console.log("/view_page emitting data to client");

    socket.on("id", function(data){
        console.log("/view_page Received request for " + data + ". Sending data");

        MongoClient.connect(uri, { useUnifiedTopology: true }, function(err, client){

            if (err){
                console.log("/view_page Error connecting to MongoDB: " + err);
            } else {
                
                console.log("/view_page Connected to MongoDB");

                var db = client.db("contact_tracing");
                var object_id = new ObjectId(data);

                db.collection("garuda_pending_reports").findOne(
                    {
                        _id: object_id
                    }, function(err, result){

                    if (err){
                        console.log("/view_page Error executing findOne: " + err);
                    }
                    
                    socket.emit("data", {
                        "location_name": result.location_name.substring(0, 39) + "...",
                        "diagnosis_proof": result.photo_diagnosis,
                        "photo_gov_id": result.photo_gov_id,
                        "placeID": result.placeID.substring(0, 39) + "...",
                        "placeID_raw": result.placeID,
                        "email": result.email,
                        "coords": result.coords,
                        "patient_gov_id": result.gov_id_no,
                        "date_reported": result.date_reported
                    });

                }); 

            }

        });

    });

    socket.on("reject", function(id){

        console.log("/view_page REJECTING report " + id);

        MongoClient.connect(uri, { useUnifiedTopology: true }, function(err, client){

            if (err){
                console.log("/view_page error connecting to MongoDB: " + err);
            } else {
                
                console.log("/view_page connected to MongoDB. Deleting report");

                var db = client.db("contact_tracing");
                var object_id = new ObjectId(id);

                db.collection("garuda_pending_reports").deleteOne({
                    _id: object_id
                }, function(err, result){

                    if (err){
                        console.log(err);
                    } else {
                        console.log("/view_page successfully deleted " + id);
                        socket.emit("success");
                    }
                    
                });

            }

        });
        
    });

    socket.on("approve", function(id){

        console.log("/view_page APPROVING report " + id);
        
        MongoClient.connect(uri, { useUnifiedTopology: true }, function(err, client){

            if (err){
                console.log("/view_page connected to MongoDB. Moving to garuda_approved_reports");
            } else {

                var db = client.db("contact_tracing");
                var object_id = new ObjectId(id);

                db.collection("garuda_pending_reports").findOne({
                    _id: object_id
                }, function(err, result){

                    if (err){                
                        console.log("/view_page error findOne for "+id+": " + err);
                    } else {

                        db.collection("garuda_approved_reports").insertOne(result, function(err, result){
                            console.log("/view_page inserted into garuda_approved_reports");
                        });

                        db.collection("garuda_pending_reports").deleteOne({
                            _id: object_id
                        }, function(err, result){

                            if (err){
                                console.log("/view_page error inserting into " + garuda_pending_reports);
                            } else {
                                
                                console.log("/view_page deleted "+ id +" from garuda_pending_reports");
                                socket.emit("success");

                            }

                        });

                    }

                });

            }

        });

    });

});

io.of("/location_checker", function(socket){

    //This is the actual location checker itself
    console.log(socket.id + " connected to /location_checker");
    socket.on("disconnect", ()=>{ console.log(socket.id + " disconnected from /location_checker") });

    socket.on("location", function(position){

        console.log("/location_checker client location is at " + JSON.stringify(position));

        MongoClient.connect(uri, { useUnifiedTopology: true }, function(err, client){

            if (err){
                console.log("/location_checker error querying database: " + err);
            } else {

                console.log("/location_checker connected to the database");
            
                var db = client.db("contact_tracing");

                //For now it will find all the cases only, we can work it out later. This is good enough for a prototype
                db.collection("garuda_approved_reports").find({}).toArray(function(err, results){

                    if (err){
                        console.log("/location_checker error executing find: " + err);
                    }

                    console.log("/location_checker sending items to user");

                        for (var i = 0; i < results.length; i++){
                            socket.emit("location", {
                                no_locations: results.length,
                                coords: results[i].coords,
                                placeID: results[i].placeID
                            })
                        }

                });
            }

        });

    });

});