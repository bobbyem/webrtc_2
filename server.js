/* --------------------------------- imports -------------------------------- */
const dotenv = require("dotenv").config();
const express = require("express");
const { Server } = require("socket.io");
const colors = require("colors");
const { createServer } = require("http");
const { onConnection, onDisconnecting } = require("./socketHandlers");

/* -------------------------------- Variables ------------------------------- */
const app = express();
const httpServer = createServer();
const socketServerOptions = {
  cors: {
    origin: "*",
  },
};
const io = new Server(httpServer, socketServerOptions);
const CONFIG = {
  EXPRESS_PORT: process.env.EXPRESS_PORT || 3000,
  WSS_PORT: process.env.WSS_PORT || 5000,
};

//Middleware
io.on("connect", (socket) => onConnection({ io, socket }));
app.use(express.static("public"));

/* --------------------------- server init/listen --------------------------- */
io.listen(CONFIG.WSS_PORT);
app.listen(CONFIG.EXPRESS_PORT, () =>
  console.log(
    colors.bgGreen(
      "😀 Server started at:",
      new Date(),
      "On port:",
      CONFIG.EXPRESS_PORT
    )
  )
);
