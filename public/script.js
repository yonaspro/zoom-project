const socket = io("/");
const myPeer = new Peer(undefined, {
	path: "/peerjs",
	host: "/",
	port: "443",
});
const peers = {};
const videoGrid = document.getElementById("video_grid");
const myVideo = document.createElement("video");
myVideo.muted = true;
let myVideoStream;

navigator.mediaDevices
	.getUserMedia({
		video: true,
		audio: true,
	})
	.then((stream) => {
		myVideoStream = stream;
		addVideoStream(myVideo, stream);
			socket.on("user-connected", (userId) => {
			connectToNewUser(userId, stream);
		});
		myPeer.on("call", (call) => {
			call.answer(stream);
			const video = document.createElement("video");
			call.on("stream", (userVideoStream) => {
				addVideoStream(video, userVideoStream);
			});
		});
		socket.on("user-connected", (userId) => {
			connectToNewUser(userId, stream);
		});
	
		let text = $("input");
		$("html").keydown(function (e) {
			if (e.which == 13 && text.val().length !== 0) {
				socket.emit("message", text.val());
				text.val("");
			}
		});
		socket.on("createMessage", (message) => {
			$("ul").append(`<li class="message"><b>user</b><br/>${message}</li>`);
		});
	})
	.catch((error) => {
		console.error("Failed to access media devices:", error);
	});

myPeer.on("open", (id) => {
	console.log(id);
	socket.emit("join-room", Room_ID, id);
});

socket.on("user-disconnected", (userId) => {
	if (peers[ userId ]) {
		peers[userId].close();
	} 
});

const addVideoStream = (video, stream) => {
	video.srcObject = stream;
	video.addEventListener("loadedmetadata", () => {
		video.play();
	});
	videoGrid.append(video);
};


function connectToNewUser(userId, stream) {
	console.log("User connected.", userId);
	const call = myPeer.call(userId, stream);
	const video = document.createElement("video");
	call.on("stream", (userVideoStream) => {
		addVideoStream(video, userVideoStream);
	});
	call.on("close", () => {
		video.remove();
	});
	peers[userId] = call;
}

const playStop = () => {
	let enabled = myVideoStream.getVideoTracks()[0].enabled;
	if (enabled) {
		myVideoStream.getVideoTracks()[0].enabled = false;
		setPlayVideo();
	} else {
		setStopVideo();
		myVideoStream.getVideoTracks()[0].enabled = true;
	}
};
const muteUnmute = () => {
	const enabled = myVideoStream.getAudioTracks()[0].enabled;
	if (enabled) {
		myVideoStream.getAudioTracks()[0].enabled = false;
		setUnmuteButtun();
	} else {
		setMuteButtun();
		myVideoStream.getAudioTracks()[0].enabled = true;
	}
};

const setStopVideo = () => {
	const html = `  
	<i class="fa-solid fa-video"></i>
	<span>Stop Video</span>  `;
	document.querySelector(".main__video_buttun").innerHTML = html;
};

const setPlayVideo = () => {
	const html = `  
	<i class=" red fa-solid fa-video-slash"></i>
	<span>Play Video</span>  `;
	document.querySelector(".main__video_buttun").innerHTML = html;
};

const setMuteButtun = () => {
	const html = `  
	<i class="fa-solid fa-microphone"></i>

	<span>Mute</span>  `;
	document.querySelector(".main__mute_buttun").innerHTML = html;
};
const setUnmuteButtun = () => {
	const html = `  
	<i class=" red fa-solid fa-microphone-slash"></i>
	
	<span>UnMute</span>  `;
	document.querySelector(".main__mute_buttun").innerHTML = html;
};
