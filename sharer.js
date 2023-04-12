import {
  sendMessage,
  userFeedback,
  iceServer,
  env,
  handleMessage,
  Message,
  socket,
  shareScreen,
  handleUsername,
  handleJoinRoom,
} from "/utils.js";

//Dom elements
const buttonShareScreen = document.querySelector("#btnShare");
const buttonCall = document.querySelector("#btnCall");
const buttonUsername = document.querySelector("#btnUsername");
const buttonRoom = document.querySelector("#btnRoom");

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
function init() {}

/* ----------------------------- Event listeners ---------------------------- */
//Socket events
socket.on("connect", () => userFeedback("WSStatus", "Socket connected 👍"));
socket.on("disconnect", () =>
  userFeedback("WSStatus", "Socket not connected 👎")
);
socket.on("message", (message) => handleMessage({ socket, message }));

//element events
//buttonJoinRoom
buttonRoom.addEventListener("click", handleJoinRoom);

//buttonShareScreen
buttonShareScreen?.addEventListener("click", () => {
  if (shareScreen()) {
    buttonCall.disabled = false;
    buttonShareScreen.disabled = true;
  }
});

//buttonCall
// buttonCall?.addEventListener("click", call);

//buttonUsername
buttonUsername?.addEventListener("click", handleUsername);
/* ----------------------------- init operations ---------------------------- */

//Init operations on load
init();
