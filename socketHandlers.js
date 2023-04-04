const colors = require("colors");

//Stores the current connections. - {socketId, userName, room}
let connections = [];

function onConnection({ io, socket }) {
  //Send socket ID to frontend when connection is made
  sendSocketId(socket);

  //Handle messages from client
  socket.on("message", (message) => handleMessage({ io, socket, message }));

  //Handle socket disconnect
  socket.on("disconnect", () => findConnectionByIdAndRemove(socket.id));

  //Handle room created
  io.of("/").adapter.on("create-room", (room) => {
    console.log("🚀 ~ file: server.js:17 ~ room:", room);
  });

  //Handle room joined
  io.of("/").adapter.on("join-room", async (room, id) => {
    console.log("socket: ", id, " joined room: ", room);
    const sockets = await io.in(room).fetchSockets();
    if (compileMemberslist(sockets)) {
      //Tell members about the new roaster
      io.in(room).emit("message", {
        type: "members",
        data: { members: compileMemberslist(sockets) },
      });
    }
  });

  //Handle room joined
  io.of("/").adapter.on("leave-room", (room, id) => {
    console.log("socket: ", id, " leaved room: ", room);
  });

  //Handle room delete
  io.of("/").adapter.on("delete-room", (room) => {
    console.log("Delete room: ", room);
  });
}

function onDisconnecting({ io, socket }) {
  findConnectionByIdAndRemove(socket.id);
}
/* ----------------------------- Emit functions ----------------------------- */

function sendSocketId(socket) {
  socket.emit("message", { type: "socketId", data: { socketId: socket.id } });
  console.log(colors.green("sending socketId to id:", socket.id));
}

function sendError(socket, error) {
  //Validate
  if (!socket) console.log(colors.bgRed("socket:", socket));

  //Let user know there has been an error
  socket.emit("message", { type: "error", data: { error } });
}

function sendMessage({ io, target, message }) {
  //Validate
  if (!io || !target || !message)
    return console.log(
      colors.red("io:", io, "target:", target, "data:", message)
    );

  //Emit message event to provided target id
  console.log(
    "🚀 ~ file: socketHandlers.js:45 ~ sendMessage ~ message:",
    message
  );
  io.to(target).emit("message", message);
}

/* ---------------------------- Handler functions --------------------------- */

function handleMessage({ io, socket, message }) {
  if (!io || !socket || !message || !message.type)
    return sendError(socket, "handleMessage missing parameters");

  console.log(
    "🚀 ~ file: socketHandlers.js:53 ~ handleMessage ~ message:",
    message
  );

  //Switch on message.type
  switch (message.type) {
    /* -------------------------------- username -------------------------------- */
    case "username":
      //Validate username
      if (!message.data.username) return sendError(socket, "userName invalid");

      sendMessage({
        io,
        target: socket.id,
        message: { type: "message", data: { message: "username Recieved" } },
      });

      socket.username = message.data.username;

      //Store connection
      if (storeConnection({ socket, username: message.data.username }))
        return sendMessage({
          io,
          target: socket.id,
          message: {
            type: "message",
            data: { message: "username stored success" },
          },
        });
      break;

    /* -------------------------------- joinRoom -------------------------------- */
    case "joinRoom":
      //Validate username
      if (!message.data.roomId) return sendError(socket, "roomId invalid");

      console.log(
        colors.magenta(
          "joinRoom recieved: ",
          message.data.roomId,
          " from ",
          socket.id
        )
      );

      //Join the socket to provided roomId
      socket.join(message.data.roomId);

      sendMessage({
        io,
        target: socket.id,
        message: { type: "message", data: { message: "room joined" } },
      });
      break;

    /* --------------------------------- Default -------------------------------- */
    default:
      console.log(colors.red("could not resolve type:", message.type));
      break;
  }
}

/* ---------------------------- Helper functions ---------------------------- */

//storeConnection -
function storeConnection({ socket, username }) {
  if (findConnectionById(socket.id) || findConnectionByUsername(username))
    return console.log("Duplicate id or username");

  console.log(colors.magenta("storing connection for username: ", username));

  //Connection to be stored
  const connection = {
    socketId: socket.id,
    socket,
    username,
  };

  //Push connection
  connections.push(connection);

  //Validate if storing was successful
  if (findConnectionById(socket.id) && findConnectionByUsername(username))
    return true;
  return false;
}

//findConnectionById - return connection connected to given id
function findConnectionById(id) {
  return connections.find((con) => con.socketId === id);
}
//findConnectionByUsername - return connection connected to given username
function findConnectionByUsername(username) {
  return connections.find((con) => con.username === username);
}
//findConnectionByIdAndRemove - return
function findConnectionByIdAndRemove(id) {
  let match = connections.find((con) => con.socketId === id);

  //if no match return false
  if (!match) return false;

  //Mutate array - filter out the mathing item
  connections = connections.filter((con) => con.socketId !== id);

  //See if item was truly removed
  match = connections.find((con) => con.socketId === id);
  if (!match) {
    console.log(colors.red("removed: ", id, " from connections"));
    return true;
  }

  //If there still is a match - we havent removed the item
  return false;
}

//compileMemberslist
function compileMemberslist(sockets) {
  const membersList = [];
  sockets.forEach((socket) =>
    membersList.push({ username: socket.username, socketId: socket.id })
  );
  return membersList ? membersList : null;
}

module.exports = { onConnection, onDisconnecting };
