const http = require("http");
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const socketio = require("socket.io");
const { connectDB } = require("./utils/db.connection");
// Create an Express application
const app = express();

app.use(express.json());

// Create both HTTP and HTTPS servers
const httpServer = http.createServer(app);

// Define allowed origins

const allowedOrigins = [
  "https://chatter-ji.vercel.app",
  "http://localhost:5173",
];

// CORS options
const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST"],
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("", cors(corsOptions));

//connect db
connectDB();

// Initialize Socket.IO to work with both servers
const io = socketio(httpServer, {
  cors: corsOptions,
});

// Start both servers
const HTTP_PORT = 8000;

httpServer.listen(HTTP_PORT, () => {
  console.log(`HTTP server listening on port ${HTTP_PORT}`);
});

const emailToSocketMap = new Map();
const socketToEmailMap = new Map();

// Socket.IO connection logic (shared between HTTP and HTTPS)
const handleSocketConnection = (socket) => {
  console.log("A client connected with id:", socket.id);

  socket.on("join-room", (data) => {
    const { emailId } = data;
    const roomId = 12;
    console.log(">>>>>>>>>>>user join in : ", roomId, emailId);
    emailToSocketMap.set(emailId, socket.id);
    socketToEmailMap.set(socket.id, emailId);
    socket.join(roomId);
    socket.emit("joined-room", { roomId, emailId });
    socket.broadcast.to(roomId).emit("user-joined", { roomId, emailId });
  });

  socket.on("call-user", (data) => {
    const { offer, emailId, to } = data;
    //emailId --> current user
    //to --> user to call
    const from = socketToEmailMap.get(socket.id); // get current user email
    const socketId = emailToSocketMap.get(to); //remote user socket id
    if (socketId) {
      io.to(socketId).emit("incoming-call", { from, to, offer });
    }
  });

  socket.on("call-declined", ({ from }) => {
    const socketId = emailToSocketMap.get(from);
    console.log(">>>>>>>>>>>call declined", socketId, from);
    io.to(socketId || from).emit("call-declined", { from });
  });

  socket.on("call-accepted", ({ emailId, ans }) => {
    const socketId = emailToSocketMap.get(emailId);
    if (socketId) io.to(socketId).emit("call-accepted", { ans });
  });

  // Handle ICE candidate exchange
  socket.on("ice-candidate", ({ candidate, to }) => {
    const socketId = emailToSocketMap.get(to);
    if (socketId) {
      io.to(socketId).emit("ice-candidate", { candidate });
    }
  });

  socket.on('negotiation-needed', ({ offer, to }) => {
    const from = socketToEmailMap.get(socket.id);
    const socketId = emailToSocketMap.get(to);
    if (socketId) {
      io.to(socketId).emit('negotiation-needed', { offer, from });
    }
  });

  socket.on('negotiation-done', ({ answer, to }) => {
    const socketId = emailToSocketMap.get(to);
    if (socketId) {
      io.to(socketId).emit('negotiation-done', {from:socket.id, answer });
    }
  });


  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
};

io.on("connection", handleSocketConnection);

// Define the `/` route
app.get("/", (req, res) => {
  res.send("Hello");
});

//router
const user = require("./router/user.router");

app.use("/api/v1/user", user);
