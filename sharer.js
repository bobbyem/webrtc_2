import {
  sendMessage,
  userFeedback,
  iceServer,
  env,
  handleMessage,
  Message,
  socket,
  shareScreen,
} from "/utils.js";

//Dom elements
const buttonJoinRoom = document.querySelector("#joinRoom");
const buttonShareScreen = document.querySelector("#share");
const buttonCall = document.querySelector("#call");

//Default variables
const username = "sharer";
const roomToJoin = "test";

//PeerConnections
let peerConnection;

/* ----------------------------- async functions ---------------------------- */
//createPeerConnection - sets peerConnection
async function createPeerConnection(iceServer) {
  let peerConnection = await new RTCPeerConnection();
  console.log(
    "🚀 ~ file: sharer.js:12 ~ createPeerConnection ~ peerConnection:",
    peerConnection
  );
}

/* -------------------------- synchronus functions -------------------------- */
//init - initial operations that need to happen on load
function init() {
  //Show the username
  userFeedback("username", username);

  if (socket)
    sendMessage({ socket, message: new Message("username", { username }) });
}

/* ----------------------------- Event listeners ---------------------------- */
//Socket events
socket.on("connect", () => userFeedback("WSStatus", "Socket connected 👍"));
socket.on("disconnect", () =>
  userFeedback("WSStatus", "Socket not connected 👎")
);
socket.on("message", (message) => handleMessage({ socket, message }));

//element events
//buttonJoinRoom
buttonJoinRoom.addEventListener("click", () => {
  sendMessage({
    socket,
    message: new Message("joinRoom", { roomId: roomToJoin }),
  });
});

//buttonShareScreen
buttonShareScreen?.addEventListener("click", () => {
  if (shareScreen()) {
    buttonCall.disabled = false;
    buttonShareScreen.disabled = true;
  }
});

//buttonCall
buttonCall?.addEventListener("click", call);
/* ----------------------------- init operations ---------------------------- */

//Init operations on load
init();
