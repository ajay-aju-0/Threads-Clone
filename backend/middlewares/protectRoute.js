import jwt from "jsonwebtoken";
import userModel from '../models/userModel.js';

const protectRoute = async(req,res,next) => {
    try {

        const token = req.cookies.jwt;

        if(!token) {
            return res.status(400).json({
                error:"Unauthorized"
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await userModel.findById(decoded.userId).select("-password");    

        req.user = user;
        
        next();
    } catch (error) {
        res.status(500).json({
            error: error.message
        })
    }
}

export default protectRoute;