/* -------------------------------- variables ------------------------------- */
export const iceServer = {
  urls: [
    "stun.freecall.com:3478",
    "stun.freeswitch.org:3478",
    "stun.freevoipdeal.com:3478",
    "stun.gmx.de:3478",
    "stun.gmx.net:3478",
    "stun.gradwell.com:3478",
    "stun.halonet.pl:3478",
    "stun.hellonanu.com:3478",
    "stun.hoiio.com:3478",
    "stun.hosteurope.de:3478",
    "stun.ideasip.com:3478",
  ],
};

export const env = {
  WSURL: "http://localhost:5000",
};

export let socket = io(env.WSURL);

//Local variables
const messages = [];
let localStream;

/* --------------------------------- classes/objects -------------------------------- */

export class Message {
  constructor(type, data) {
    this.type = type;
    this.data = data;
  }
}

/* ----------------------------- sync functions ----------------------------- */

//userFeedback - displays feedback text on given display elements
export function userFeedback(target, feedback) {
  switch (target) {
    case "roomId":
      if (feedback && document.querySelector("#displayRoomId"))
        document.querySelector("#displayRoomId").textContent = feedback;
      break;
    case "username":
      if (feedback && document.querySelector("#displayUsername"))
        document.querySelector("#displayUsername").textContent = feedback;
      break;
    case "socketId":
      if (feedback && document.querySelector("#displaySocketId"))
        document.querySelector("#displaySocketId").textContent = feedback;
      break;
    case "WSStatus":
      if (feedback && document.querySelector("#displayWSStatus"))
        document.querySelector("#displayWSStatus").textContent = feedback;
      break;
    case "PCStatus":
      if (feedback && document.querySelector("#displayPCStatus"))
        document.querySelector("#displayPCStatus").textContent = feedback;
      break;
    case "message":
      if (feedback && document.querySelector("#displayMessage"))
        document.querySelector("#displayMessage").textContent = feedback;
      break;
    case "error":
      if (feedback && document.querySelector("#displayError"))
        document.querySelector("#displayError").textContent = feedback;
      break;
    default:
      console.log("userFeedback.displayFeedback couldn't resolve target");
      break;
  }
}

/* -------------------------------- Handlers -------------------------------- */

//Handles messages from socket server
export function handleMessage({ socket, message }) {
  if (!socket || !message)
    return console.error("socket:", socket, "message:", message);

  storeMessage(message);

  switch (message.type) {
    case "socketId":
      userFeedback("socketId", message.data.socketId);
      console.log("message from server:", message);
      break;
    case "offer":
      userFeedback("socketId", "Offer revieved from server");
      console.log("message from server:", message);
      break;
    case "candidate":
      userFeedback("socketId", "Offer revieved from server");
      console.log("message from server:", message);
      break;
    case "message":
      console.log("message from server:", message);
      userFeedback("message", message.data.message);
      break;
    case "members":
      if (message.data.members) updateRoomMembers(message.data.members);
      break;
    case "error":
      userFeedback("error", message.data.socketId);
      console.error("message from server:", message);
      break;
    default:
      console.error("Could not resolve message type");
  }
}

//sendMessage - sends message to the server
export function sendMessage({ socket, message }) {
  //Validate
  if (!socket || !message)
    return console.error("socket:", socket, "message:", message);

  socket.emit("message", message);
}

/* ---------------------------- Helper functions ---------------------------- */
//storeMessage - stores the message to array
function storeMessage(message) {
  if (message) message.timestamp = new Date().getTime();

  //Add message to array
  messages.push(message);

  //Display the messages in the log
  addMessageToLogDisplay(message);
}

//addMessageToLogDisplay - converts message and adds it to the dom
function addMessageToLogDisplay(message) {
  if (!message) console.error("Messag: ", message);

  //Get display element
  const logDisplay = document.querySelector("#logs");
  //Convert object to string
  const convertedMessage = JSON.stringify(message);
  //Create new paragraph element to add
  const logElement = document.createElement("p");
  //Set element textcontent to message
  logElement.textContent = convertedMessage;
  //Append element to parent (div)
  if (logDisplay) logDisplay.appendChild(logElement);
}

//shareScreen - catches and stores the screen stream - adds it to the video output
export async function shareScreen() {
  const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
  const videoElement = document.querySelector("#localVideo");

  if (stream && videoElement) {
    localStream = stream;
    videoElement.srcObject = stream;
    return true;
  }
  console.log(
    "🚀 ~ file: utils.js:150 ~ functionsshareScreen ~ videoElement:",
    videoElement
  );
  console.log(
    "🚀 ~ file: utils.js:150 ~ functionsshareScreen ~ stream:",
    stream
  );
  return false;
}
//
function updateRoomMembers(members) {}
