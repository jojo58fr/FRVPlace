const express = require("express");
const fs = require("fs");
const cors = require("cors");
const config = require("./../config.json");
const passport = require("passport");
const http = require("http");

const app = express();

// Création du serveur HTTP/HTTPS avec Express
var httpServer = http.createServer(app);
const io = require('socket.io')(httpServer);

// Apply CORS settings
app.use(cors(config.cors_options));
// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

app.use(require('express-session')({ secret: config.EXPRESS_SESSION_SECRET, resave: true, saveUninitialized: true }));


// Define the number of cols/rows for the canvas
const CANVAS_ROWS = 50;
const CANVAS_COLS = 50;

// Create the canvas object so we can store its state locally
var canvas = [ ]

// Populate the canvas with initial values
for(var row = 0; row < CANVAS_ROWS; row++){
  canvas[row] = [ ]
  
  for(var col = 0; col < CANVAS_COLS; col++){
    canvas[row][col] = "#FFF"
  }
}

// Listen for connections from socket.io clients
io.on("connection", socket => {

  // Send the entire canvas to the user when they connect
  socket.emit("canvas", canvas)

  // This is fired when the client places a color on the canvas
  socket.on("placePixel", data => {

    console.log("placePixel event");

    // First we validate that the position on the canvas exists
    if(data.row <= CANVAS_ROWS && data.row > 0 && data.col <= CANVAS_COLS && data.col > 0){
      // Update the canvas
      canvas[data.row - 1][data.col - 1] = data.color
      // Send the new canvas to all connected clients
      io.emit("canvas", canvas)
    }
  })

})


// simple route
app.get("/", (req, res) => { res.json({ message: "SSO: Welcome to FRVtubers server." }); });

(async () => {

  httpServer.listen(config.http_port, () => {
    console.log(`Serveur HTTP en cours d\'écoute sur le port ${config.http_port}...`);
  });

})().catch(console.error);