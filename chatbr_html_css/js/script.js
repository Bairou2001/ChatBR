"use strict";

// Getting DOM elements
const messageForm = document.getElementById("message-form");
const messageInput = document.getElementById("message-text");
const listMessage = document.getElementById("list-messages");
const input = document.getElementById("message-text");
const chatroomName = document.getElementById("chatroom");
const listUsers = document.getElementById("list-users");

// Get username and room from the URL
const { username, chatroom } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

// functions
// outputMessages displays the message
const outputMessage = function (message) {
  // creating new html message element
  let newMessage = document.createElement("div");
  newMessage.classList.add("message");
  let header = document.createElement("div");
  let content = document.createElement("div");
  header.classList.add("message-header");
  content.classList.add("message-content");
  content.innerHTML = message.text;
  // elements for header
  let headerName = document.createElement("div");
  let headerDate = document.createElement("div");
  headerName.classList.add("name");
  headerDate.classList.add("date");
  headerName.innerHTML = message.username;
  headerDate.innerHTML = message.time;
  // appending together
  header.appendChild(headerName);
  header.appendChild(headerDate);
  newMessage.appendChild(header);
  newMessage.appendChild(content);
  // appending newMessage to list of messages
  listMessage.appendChild(newMessage);
};

const upgradeRoomName = function (room) {
  chatroomName.innerHTML = room;
};
const upgradeUsers = function (users) {
  // removing all child
  while (listUsers.firstChild) {
    listUsers.removeChild(listUsers.lastChild);
  }
  // adding the default users
  const defaultUser1 = document.createElement("div");
  const defaultUser2 = document.createElement("div");
  defaultUser1.classList.add("user");
  defaultUser2.classList.add("user");
  defaultUser1.innerHTML = "Bairou (admin)";
  defaultUser2.innerHTML = "Bot1 (bot)";
  listUsers.appendChild(defaultUser1);
  listUsers.appendChild(defaultUser2);
  // adding real users
  console.log(users);
  users.forEach((currentUser) => {
    const user = document.createElement("div");
    user.classList.add("user");
    user.innerHTML = currentUser.username;
    listUsers.appendChild(user);
  });
};

const socket = io();

// Join chatroom
socket.emit("joinRoom", { username, chatroom });

// Upgrade room and Users
socket.on("roomUsers", ({ room, users }) => {
  upgradeRoomName(room);
  upgradeUsers(users);
});

// Event listener for message from server
socket.on("message", (message) => {
  outputMessage(message);
  // Scroll down to new message
  listMessage.scrollTop = listMessage.scrollHeight;
  // clear input and focus on it
  input.value = "";
  input.focus();
});

// Event Listenner for the submit of the form (message input)
messageForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const message = messageInput.value;
  // Emit chatMessage event to server, passing message
  socket.emit("chatMessage", message);
});
