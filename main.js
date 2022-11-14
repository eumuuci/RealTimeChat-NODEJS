const express = require("express");
const server = express();

const path = require("path");
const http = require("http").Server(server);
const io   = require("socket.io")(http);

server.use(express.static("public_html"))

server.get("/", (req, res) => {
  res.sendFile(path.resolve("public_html/index.html"));
});

let usuariosOnline = [];
var usuariosOnlineSocket = [];
let usuariosLastId = 0;

io.on("connection", client => {
  client.on("message", mensagem => {
    mensagem = JSON.parse(mensagem);

    switch(mensagem.type){
      case "c":
        usuariosOnline[usuariosLastId] = mensagem.data;
        usuariosOnlineSocket[usuariosLastId] = client;
        usuariosLastId += 1;

        io.emit("message", JSON.stringify({type: "l", data: usuariosOnline}))
        break;

      case "m":
        var to = mensagem.data[0];
        var msg = mensagem.data[1];
        var from = usuariosOnlineSocket.indexOf(client);
        var sock = usuariosOnlineSocket[to];

        sock.emit("message", JSON.stringify({type: "m", data: [from, msg]}))

      break;
    }
  });

  client.on("disconnect", () => {
    var id = usuariosOnlineSocket.indexOf(client);

    delete usuariosOnline[id];
    delete usuariosOnlineSocket[id];

    io.emit("message", JSON.stringify({type: "l", data: usuariosOnline}))
  });
});

http.listen(3333, () => {
  console.log("Servidor rodando na: 3333")
});
