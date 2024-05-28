const express = require("express");
const { WebSocketServer } = require("ws");
const WebSocket = require("ws");

const app = express();
const port = 3000;

app.use(express.static("public"));

const server = app.listen(port, () => {
  console.log(`Server is listening on http://localhost:${port}`);
});

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("Client connected");

  const mockWebSocket = new WebSocket("wss://mock.lo.tech:8443/ws/orderbook");

  mockWebSocket.on("open", () => {
    console.log("Connected to mock WebSocket server");
  });

  // Forward the received data to the client
  mockWebSocket.on("message", (data) => {
    ws.send(data);
  });

  mockWebSocket.on("close", () => {
    console.log("Disconnected from mock WebSocket server");
  });

  mockWebSocket.on("error", (error) => {
    console.error("Mock WebSocket error:", error);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
    mockWebSocket.close();
  });

  ws.on("error", (error) => {
    console.error("Client WebSocket error:", error);
    mockWebSocket.close();
  });
});
