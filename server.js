const http = require("http");
const express = require("express");
const socketio = require("socket.io");
// user defined modules
const formatMessage = require("./js_modules/formatMessage");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./js_modules/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// constants
const botName = "botBR (bot)";

// Serving static ressources, leading to our mainpage
app.use(express.static(`${__dirname}/chatbr_html_css`));

// socket runs when a client connects (listen for connection event)
io.on("connection", (socket) => {
  socket.on("joinRoom", ({ username, chatroom }) => {
    // User joining room
    const user = userJoin(socket.id, username, chatroom);
    socket.join(user.room);

    // emit message to the client when that client connects
    socket.emit(
      "message",
      formatMessage(botName, `Hi ${user.username}, welcome to ${chatroom}!`)
    );

    // broadcast message to every client except the client that connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat.`)
      );

    // send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // broadcast when client disconects, message to every clients including the client that connects.
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );
      // send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
  // Event listener for chatMessage
  socket.on("chatMessage", (message) => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit("message", formatMessage(user.username, message));
  });
});

// if there is no set environment variable PORT, then use 3000
const port = process.env.PORT ? process.env.PORT : 3000;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
