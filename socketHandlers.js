const colors = require("colors");

//Stores the current connections. - {socketId, userName, room}
let connections = [];

function onConnection({ io, socket }) {
  //Send socket ID to frontend when connection is made
  sendSocketId(socket);

  findSocketByUsername({ io, username: "sharer" });

  //Handle messages from client
  socket.on("message", (message) => handleMessage({ io, socket, message }));

  //Handle room joined
  io.of("/").adapter.on("join-room", async (room, id) => {
    //Check to see if room === socket.id - then we don't need to do anything
    if (room === id) return;
    //Get att sockets connected with room
    const sockets = await io.in(room).fetchSockets();

    if (compileMemberslist(sockets)) {
      //Tell members about the new roaster
      io.in(room).emit("message", {
        type: "members",
        data: { members: compileMemberslist(sockets) },
      });
    }
  });

  //Handle room leave
  io.of("/").adapter.on("leave-room", async (room, id) => {
    //Check to see if room === socket.id - then we don't need to do anything
    if (room === id) return;

    //Log message
    console.log("socket: ", id, " left room: ", room);

    //Get att sockets connected with room
    const sockets = await io.in(room).fetchSockets();

    if (compileMemberslist(sockets)) {
      //Tell members about the new roaster
      io.in(room).emit("message", {
        type: "members",
        data: { members: compileMemberslist(sockets) },
      });
    }

    const socketThatLeft = findSocketById({ io, id });
  });

  //Handle socket disconnect, remove eventlisteners
  socket.on("disconnect", (reason) => {
    console.log(
      "🚀 ~ file: socketHandlers.js:55 ~ socket.on disconnect ~ reason:",
      reason
    );

    //Remove listener message
    socket.off("message", (message) => handleMessage({ io, socket, message }));
  });
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
  console.log("🚀 ~ file: socketHandlers.js:77 ~ sendError ~ error:", error);
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
  let target, offer;

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

      if (findSocketByUsername({ io, username: message.data.username }))
        return sendMessage({
          io,
          target: socket.id,
          message: {
            type: "error",
            data: { message: "username already taken" },
          },
        });

      //Set username on socket object
      socket.username = message.data.username;

      if (findSocketByUsername({ io, username: message.data.username }))
        return sendMessage({
          io,
          target: socket.id,
          message: {
            type: "message",
            data: { message: "username set Successfully" },
          },
        });

      sendMessage({
        io,
        target: socket.id,
        message: {
          type: "error",
          data: { message: "username was not set please try a different one" },
        },
      });

      break;

    /* -------------------------------- joinRoom -------------------------------- */
    case "joinRoom":
      //Validate payload
      if (!message.data.roomId) return sendError(socket, "roomId invalid");

      //Validate username
      if (!socket.username)
        return sendError(socket, "username needs to be set");

      //Join the socket to provided roomId
      socket.join(message.data.roomId);

      sendMessage({
        io,
        target: socket.id,
        message: { type: "message", data: { message: "room joined" } },
      });
      break;

    /* --------------------------------- offer; --------------------------------- */
    case "offer":
      target = message.data.target;
      offer = message.data.offer;

      // { target, offer } = message.data;
      sendMessage({
        io,
        target,
        message: { type: "offer", data: { offer, sender: socket.id } },
      });
      break;
    /* --------------------------------- answer; --------------------------------- */
    case "answer":
      target = message.data.target;
      offer = message.data.offer;
      // { target, offer } = message.data;
      sendMessage({
        io,
        target,
        message: { type: "answer", data: { offer, sender: socket.id } },
      });
      break;
    /* --------------------------------- Default -------------------------------- */
    default:
      console.log(colors.red("could not resolve type:", message.type));
      break;
  }
}

/* ---------------------------- Helper functions ---------------------------- */

//findConnectionById - return connection connected to given id
function findSocketById({ io, id }) {
  const socket = io.sockets.sockets.get(id);

  return socket;
}
//findConnectionByUsername - return connection connected to given username
function findSocketByUsername({ io, username }) {
  const sockets = [...io.sockets.sockets.values()];
  const socket = sockets.find((item) => item.username === username);

  if (socket?.username) {
    console.log(
      "🚀 ~ file: socketHandlers.js:166 ~ findSocketByUsername ~ username:",
      socket.username
    );
  }

  return socket;
}

//compileMemberslist
function compileMemberslist(sockets) {
  const membersList = [];
  sockets.forEach((socket) =>
    membersList.push({ username: socket.username, socketId: socket.id })
  );
  console.log(
    "🚀 ~ file: socketHandlers.js:175 ~ compileMemberslist ~ membersList:",
    membersList
  );
  return membersList ? membersList : null;
}

module.exports = { onConnection };
