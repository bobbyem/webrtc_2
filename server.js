const { Server } = require("socket.io");
const colors = require("colors");
const { createServer } = require("http");
const { onConnection, onDisconnecting } = require("./socketHandlers");
const httpServer = createServer();
const socketServerOptions = {
  cors: {
    origin: "*",
  },
};
const io = new Server(httpServer, socketServerOptions);

//Middleware
io.on("connect", (socket) => onConnection({ io, socket }));

/* --------------------------- server init/listen --------------------------- */
io.listen(5000);
console.log(colors.bgGreen("😀 Server started at:", new Date()));
