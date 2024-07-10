import { Server } from "socket.io";
import http from 'http';
import express from 'express';
import conversationModel from "../models/conversationModel.js";
import messageModel from "../models/messageModel.js"

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
		methods: ["GET", "POST"],
    }
})

export const getRecipientSocketId = (recipientId) => {
	return userSocketMap[recipientId];
};

const userSocketMap = {}; // userId: socketId

io.on("connection",(socket) => {
    console.log("User connected ",socket.id);
    const userId = socket.handshake.query.userId;

	if (userId != "undefined") userSocketMap[userId] = socket.id;

    socket.on("markMessagesAsSeen", async ({ conversationId, userId }) => {
		try {
			await messageModel.updateMany({ conversationId: conversationId, seen: false }, { $set: { seen: true } });
			await conversationModel.updateOne({ _id: conversationId }, { $set: { "lastMessage.seen": true } });
			io.to(userSocketMap[userId]).emit("messagesSeen", { conversationId });
		} catch (error) {
			console.log(error.message,"error in socket");
		}
	});

    io.emit("getOnlineUsers",Object.keys(userSocketMap));

    socket.on("disconnect", () => {
		console.log("user disconnected");
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap));
	});
})

export { io, server, app };