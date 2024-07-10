import express from "express";
import protectRoute from "../middlewares/protectRoute.js";
import { followUnFollowUser, 
         freezeAccount, 
         getSuggestedUser, 
         getUserProfile, 
         loginUser, 
         logoutUser, 
         signupUser, 
         updateUser } from "../controllers/userControllers.js";

const router = express.Router();

router.get("/profile/:query", getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUser)
router.post("/signup", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/follow/:id", protectRoute, followUnFollowUser);
router.put("/update/:id", protectRoute, updateUser);
router.put("/freeze", protectRoute, freezeAccount);


export default router;