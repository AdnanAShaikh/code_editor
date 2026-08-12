const express = require("express");
const {
  generatePyFile,
  executePyFile,
  generateJsFile,
  executeJsFile,
} = require("./py_jy");
const cors = require("cors");
const PORT = process.env.PORT || 3715;

const app = express();

app.use(cors());
app.use(express.json()); // Add this line to parse JSON

// const baseURL = process.env.NODE_ENV === 'production' ? 'https://code-editor-b2st.onrender.com' : 'http://localhost:5000';

//deploy
const path = require("path");

app.use(express.static(path.join(__dirname, "frontend", "dist")));
//routes
app.get("/", (req, res) => {
  res.send("<h1>Welcome to code editor</h1>");
});

app.post("/py", async (req, res) => {
  const { code } = req.body;
  if (!code) {
    return res.json({ message: "Empty Input!" });
  }

    try {
      const filepath = await generatePyFile("py", code);
      const output = await executePyFile(filepath);
      res.json({ output });
    } catch (error) {
      res.status(400).json({ output: error });
    }
});

app.post("/js", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.json({ message: "Empty Input!" });
  }

 try {
    const filepath = await generateJsFile("js", code);
    const output = await executeJsFile(filepath);
    res.json({ output });
  } catch (error) {
    res.status(400).json({ output: error });
  }

});

// Catch-all handler to serve the React app for all other routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "dist", "index.html"));
});


const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" }, // tighten this to your frontend URL in production
});

const pendingVotes = new Map(); // roomId -> { language, required, approvals, requesterId }

io.on("connection", (socket) => {

  // create-room now receives username
  socket.on("create-room", (username, callback) => {
    const roomId = Math.random().toString(36).slice(2, 8).toUpperCase();
    socket.data.username = username;
    socket.join(roomId);
    callback({ roomId });
  });

  // join-room now receives username
  socket.on("join-room", ({ roomId, username }, callback) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    if (!room) {
      callback({ error: "Room not found" });
      return;
    }
    socket.data.username = username;
    socket.join(roomId);
    callback({ success: true });
      
    socket.to(roomId).emit("user-joined", { username });  // add this

    const existing = [...room].find((id) => id !== socket.id);
    if (existing) {
      io.to(existing).emit("request-sync", { requesterId: socket.id });
    }
  });

  // Existing member responds with current state
  socket.on("sync-code", ({ requesterId, code, language }) => {
    io.to(requesterId).emit("receive-sync", { code, language });
  });

  
  // Broadcast code changes to everyone else in the room
  socket.on("code-change", ({ roomId, code }) => {
    socket.to(roomId).emit("code-update", code);
  });

  // Broadcast language switches too
  socket.on("language-change", ({ roomId, language }) => {
    socket.to(roomId).emit("language-update", language);
  });

  socket.on("leave-room", (roomId) => {
    socket.to(roomId).emit("user-left", {
      username: socket.data.username || "Anonymous",
    });
    socket.to(roomId).emit("cursor-remove", { id: socket.id });
    socket.leave(roomId);
  });

// rejoin-room too
 socket.on("rejoin-room", ({ roomId, username }, callback) => {
  socket.data.username = username;
  socket.join(roomId);
  callback({ success: true });
  const room = io.sockets.adapter.rooms.get(roomId);

  socket.to(roomId).emit("user-joined", { username });  // add this

  const existing = [...room].find((id) => id !== socket.id);
  if (existing) {
    io.to(existing).emit("request-sync", { requesterId: socket.id });
  }
});

 // NEW: get people list
  socket.on("get-room-users", (roomId, callback) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    if (!room) {
      callback({ users: [] });
      return;
    }
    const users = [...room].map((id) => {
      const s = io.sockets.sockets.get(id);
      return s?.data?.username || "Anonymous";
    });
    callback({ users });
  });

 socket.on("request-language-change", ({ roomId, language }) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    if (!room) return;

    const otherUsers = room.size - 1;

    // Solo in the room → instantly accepted
    if (otherUsers === 0) {
      io.to(roomId).emit("language-change-result", { accepted: true, language });
      return;
    }

    // Only one vote at a time per room
    if (pendingVotes.has(roomId)) {
      socket.emit("language-change-result", {
        accepted: false,
        language,
        reason: "Another request is already pending",
      });
      return;
    }

    pendingVotes.set(roomId, {
      language,
      required: otherUsers,
      approvals: 0,
      requesterId: socket.id,
    });

    // Ask everyone else
    socket.to(roomId).emit("language-change-requested", { language });
  });

  socket.on("language-change-vote", ({ roomId, accept }) => {
    const vote = pendingVotes.get(roomId);
    if (!vote) return;

    if (!accept) {
      // One rejection kills it
      pendingVotes.delete(roomId);
      io.to(roomId).emit("language-change-result", {
        accepted: false,
        language: vote.language,
      });
      return;
    }

    vote.approvals += 1;

    if (vote.approvals >= vote.required) {
      pendingVotes.delete(roomId);
      io.to(roomId).emit("language-change-result", {
        accepted: true,
        language: vote.language,
      });
    }
  });

  // Clean up if someone disconnects mid-vote so it can't hang forever
  socket.on("disconnecting", () => {
    for (const roomId of socket.rooms) {

        if (roomId === socket.id) continue; // every socket is in a "room" of its own id — skip it
        
        socket.to(roomId).emit("cursor-remove", { id: socket.id });   // must be here  
        socket.to(roomId).emit("user-left", {
            username: socket.data.username || "Anonymous",
        });

      const vote = pendingVotes.get(roomId);
      if (!vote) continue;

      const room = io.sockets.adapter.rooms.get(roomId);
      const remainingOthers = (room ? room.size : 1) - 2; // minus leaver and requester

      if (vote.requesterId === socket.id) {
        // Requester left — cancel the vote
        pendingVotes.delete(roomId);
        socket.to(roomId).emit("language-change-result", {
          accepted: false,
          language: vote.language,
          reason: "Requester disconnected",
        });
      } else if (vote.approvals >= remainingOthers) {
        // The leaver was the last pending voter
        pendingVotes.delete(roomId);
        io.to(roomId).emit("language-change-result", {
          accepted: true,
          language: vote.language,
        });
      } else {
        vote.required = remainingOthers;
      }
    }

  });


  // Relay cursor positions to others in the room
  socket.on("cursor-move", ({ roomId, x, y }) => {
    socket.to(roomId).emit("cursor-update", {
      id: socket.id,
      username: socket.data.username || "Anonymous",
      x,
      y,
    });
  });

});

server.listen(PORT, () => {
  console.log("app server started on ", PORT);
});