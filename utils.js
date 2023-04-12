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
const STATE = {
  username: "",
  roomId: "",
  mySocketId: "",
  connections: [],
  currentMembers: [],
};
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

      //Update state
      STATE.mySocketId = message.data.socketId;

      break;
    case "offer":
      const { offer, sender } = message.data;
      console.log(
        "🚀 ~ file: utils.js:98 ~ handleMessage ~ offer:",
        offer,
        sender
      );
      handleOffer({ offer, sender });
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
      if (message.data.members) updateConnections(message.data.members);
      break;
    case "error":
      userFeedback("error", message.data.message);
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

//handleUsername - gets the username input and sends it to the server
export function handleUsername() {
  const userNameInput = document.querySelector("#username");
  STATE.username = userNameInput?.value;
  if (!userNameInput || STATE.username === "")
    return console.log(
      "🚀 ~ file: utils.js:130 ~ handleUsername ~ userNameInput:",
      userNameInput,
      STATE.username
    );

  sendMessage({
    socket,
    message: new Message("username", { username: STATE.username }),
  });
}

//handleJoinRoom - gets the room id input value and emits event to server
export function handleJoinRoom() {
  const roomIdInput = document.querySelector("#room");
  STATE.roomId = roomIdInput.value;

  if (!roomIdInput || STATE.roomId === "")
    return console.log(
      "🚀 ~ file: utils.js:147 ~ handleJoinRoom ~ roomIdInput:",
      roomIdInput,
      STATE.roomId
    );

  sendMessage({
    socket,
    message: new Message("joinRoom", { roomId: STATE.roomId }),
  });
}

//handleOffer - handles offer from other member
async function handleOffer({ offer, sender }) {
  console.log("🚀 ~ file: utils.js:166 ~ handleOffer ~ offer:", offer);

  try {
    const myConnection = STATE.connections.find(
      (connection) => connection.socketId === STATE.mySocketId
    );
    if (myConnection)
      return await sendAnswer({ connection: myConnection, offer, sender });
  } catch (error) {
    console.error("🚀 ~ file: utils.js:175 ~ handleOffer ~ error:", error);
  }
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
//updateRoomMembers - updates state and triggers display update
async function updateConnections(newMembersInfo) {
  if (!newMembersInfo)
    return console.error(
      "🚀 ~ file: utils.js:173 ~ updateRoomMembers ~ members:",
      newMembersInfo
    );

  //Update state
  STATE.currentMembers = newMembersInfo;

  //Filter connections
  filterConnections(STATE.currentMembers);

  //Create new connection objects and store
  STATE.currentMembers.forEach(async (member) => {
    if (!isUnique(member)) return;
    const connection = await createMemberConnection(member);

    //Add to state
    STATE.connections.push(connection);

    //SendOffer
    await sendOffer(connection);
  });

  //Update the display list
  updateRoomMemberDisplay(STATE.connections);
}

//isUnique - check if user is already in connections
function isUnique(member) {
  const { username, socketId } = member;

  //Try to find a match
  const match = STATE.connections.find(
    (connectionObject) =>
      connectionObject.username === username ||
      connectionObject.socketId === socketId
  );

  return match ? false : true;
}

//updateRoomMemberDisplay
function updateRoomMemberDisplay(members) {
  //Get memberslist element div
  const membersListElement = document.querySelector("#members");

  if (!membersListElement)
    return console.error(
      "🚀 ~ file: utils.js:184 ~ updateRoomMembers ~ membersListElement:",
      membersListElement
    );

  //Clear memberslist
  membersListElement.replaceChildren();

  //Loop thru members and create elements
  members.forEach((member) => {
    const paragraph = document.createElement("p");
    const memberString = `Username: ${member.username} - SocketId: ${member.socketId}`;

    //Set element text content
    paragraph.textContent = memberString;

    //Add to list element
    membersListElement.appendChild(paragraph);
  });
}

//createMemberConnection
async function createMemberConnection(member) {
  const { username, socketId } = member;
  console.log(
    "🚀 ~ file: utils.js:246 ~ createMemberConnection ~ username:",
    username
  );
  console.log(
    "🚀 ~ file: utils.js:246 ~ createMemberConnection ~ socketId:",
    socketId
  );

  const peerConnection = await new RTCPeerConnection(iceServer);
  const memberConnection = {
    username,
    socketId,
    peerConnection,
  };

  return memberConnection;
}

//filterMembers - filters out memebers that are no longer in the session
function filterConnections(currentMembers) {
  const filtered = STATE.connections.filter((connection) =>
    currentMembers.some((member) => connection.username === member.username)
  );

  //Update state
  STATE.connections = filtered;
}

//sendOffer - creates and sends offer to member
async function sendOffer(connection) {
  console.log("🚀 ~ file: utils.js:308 ~ sendOffer ~ connection:", connection);

  try {
    //Create offer
    const offer = await connection.peerConnection.createOffer();
    console.log("🚀 ~ file: utils.js:346 ~ sendOffer ~ offer:", offer);

    await connection.peerConnection.setLocalDescription(offer);

    sendMessage({
      socket,
      message: new Message("offer", { target: connection.socketId, offer }),
    });
  } catch (error) {
    console.error("🚀 ~ file: utils.js:314 ~ sendOffer ~ error:", error);
  }
}

//sendAnswer - creates and sends answer to member
async function sendAnswer({ connection, offer, sender }) {
  console.log(
    "🚀 ~ file: utils.js:351 ~ sendAnswer ~ connection:",
    connection,
    offer,
    sender
  );

  try {
    const { peerConnection } = connection;
    console.log(
      "🚀 ~ file: utils.js:369 ~ sendAnswer ~ peerConnection:",
      peerConnection
    );

    const result = await peerConnection.setRemoteDescription(offer);

    const answer = await peerConnection.createAnswer();

    console.log("🚀 ~ file: utils.js:376 ~ sendAnswer ~ result:", result);

    console.log("🚀 ~ file: utils.js:380 ~ sendAnswer ~ answer:", answer);

    sendMessage({
      socket,
      message: new Message("answer", { target: sender, answer }),
    });
  } catch (error) {
    console.log("🚀 ~ file: utils.js:358 ~ sendAnswer ~ error:", error);
  }
}
