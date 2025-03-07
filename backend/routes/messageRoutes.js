import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import { getConversations, 
         getMessages, 
         sendMessage } from "../controllers/messageControllers.js";

const router = express.Router();

router.get("/conversations", protectRoute, getConversations);
router.get("/:otherUserId", protectRoute, getMessages);
router.post("/", protectRoute, sendMessage);

export default router;