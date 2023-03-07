const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const { ExpressPeerServer } = require("peer");
const { v4: uuidV4 } = require("uuid");

const peerServer = ExpressPeerServer(server, {
	debug: true,
});

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use("/peerjs", peerServer);

app.get("/", (req, res) => {
	res.redirect(`/${uuidV4()}`);
});

app.get("/:room", (req, res) => {
	res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
	socket.on("join-room", (roomId,userId) => {
		socket.join(roomId);
		socket.to(roomId).emit("user-connected", userId);

		socket.on("disconnect", () => {
			socket.to(roomId).emit("user-disconnected", userId);
		});
		// console.log("yonas join", roomId);
		socket.on("message", (message) => {
			io.to(roomId).emit("createMessage", message);
		});

		
	});
});

server.listen(process.env.PORT || 3000, () => {
	console.log(`Server started on port ${process.env.PORT || 3000}`);
});
