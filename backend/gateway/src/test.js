

// Create a WebSocket connection
const socket = new WebSocket("wss://stream-v3.pionex.com/stream");

// When connection opens
socket.onopen = () => {
  console.log("Connected to WebSocket server");

  // Send message to server
  socket.send("Hello server!");
};

// When server sends a message
socket.onmessage = (event) => {
  console.log("Message from server:", event.data);
};

// When connection closes
socket.onclose = () => {
  console.log("WebSocket connection closed");
};

// On error
socket.onerror = (err) => {
  console.log("WebSocket error:", err);
};
