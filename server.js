const express = require("express");
const router = express.Router();
const path = require("path");

const app = express();
const server = require("http").createServer(app);

const io = require("socket.io")(server);


app.use('/receiver.html', (req, res) => {res.sendFile(path.join(__dirname + "/public/receiver.html"))});
app.use(express.static(__dirname + "/public"))
// app.use('/', (req, res) => {res.sendFile(path.join(__dirname + "/public/index.html"))});

io.on("connection", function (socket) {
  socket.on("sender-join", function (data) {
    socket.join(data.uid);
  });

  socket.on("receiver-join", function (data) {
    socket.join(data.uid);
    socket.in(data.sender_uid).emit("init", data.uid);
  });

  socket.on("file-meta", function (data) {
    socket.in(data.uid).emit("fs-meta", data.metadata);
  });

  socket.on("fs-start", function (data) {
    socket.in(data.uid).emit("fs-share", {});
  });

  socket.on("file-raw", function (data) {
    socket.in(data.uid).emit("fs-share", data.buffer);
  });
});

server.listen(5000);
