import postModel from "../models/postModel.js";
import userModel from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";

export const getFeedPosts = async(req,res) => {
    try {
        const userId = req.user._id;
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                error: "User not found" 
            });
        }

        const following = user.following;

        const feedPosts = await postModel.find({ postedBy:{ $in:following } }).sort({ createdAt: -1 });

        res.status(200).json(feedPosts);
        
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
    
}

export const getPost = async(req,res) => {
    try {
        const post = await postModel.findById(req.params.id);
        if(!post) {
            return res.status(404).json({
                error: "Post not found"
            });
        }

        res.status(200).json(post);
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}

export const getUserPosts = async(req,res) => {
    const { username } = req.params;
	try {
		const user = await userModel.findOne({ username });
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const posts = await postModel.find({ postedBy: user._id }).sort({ createdAt: -1 });

		res.status(200).json(posts);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
}

export const createPost = async(req,res) => {
    try {
        const { postedBy, text } = req.body;
        let { img } = req.body

        if(!text || !postedBy) {
            return res.status(400).json({
                error: "Postedby and text fields are required" 
            });
        }

        const user = await userModel.findById(postedBy);
		if (!user) {
			return res.status(404).json({
                error: "User not found" 
            });
		}

        if (user._id.toString() !== req.user._id.toString()) {
			return res.status(401).json({
                error: "Unauthorized to create post"
            });
		}

        const maxLength = 500;

        if(text.length > maxLength) {
            return res.status(400).json({ 
                error: `Text must be less than ${maxLength} characters` 
            });
        }

        if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img);
			img = uploadedResponse.secure_url;
		}

        const newPost = new postModel({
            postedBy,
            text,
            img 
        });
		await newPost.save();

		res.status(201).json(newPost);
        
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}

export const deletePost = async(req,res) => {
    try {
        const post = await postModel.findById(req.params.id);
        if(!post) {
            return res.status(404).json({
                error: "Post not found"
            });
        }

        if(post.postedBy.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                error: "Unauthorized to delete post"
            });
        }

        if (post.img) {
			const imgId = post.img.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imgId);
		}

        await postModel.findByIdAndDelete(req.params.id);
        res.status(200).json({ 
            message: "Post deleted successfully"
        });

    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}

export const likeUnlikePost = async(req,res) => {
    try {
        const { id:postId } = req.params;
        const userId = req.user._id;

        const post = await postModel.findById(postId);
        
        if(!post) {
            return res.status(400).json({
                error:"Post not found!"
            })
        }

        const isLiked = post.likes.includes(userId);

        if(isLiked) {
            // unlike post
            postModel.updateOne({_id:postId},{$pull:{likes:userId}});
            res.status(200).json({ 
                message: "Post unliked successfully"
            });
        } else {
            // like post
            post.likes.push(userId);
            await post.save();
            res.status(200).json({ 
                message: "Post liked successfully"
            });
        }
        
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}

export const replyToPost = async(req,res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;
        const userId = req.user._id;
        const userProfilePic = req.user.profilePic;
		const username = req.user.username;

        if (!text) {
			return res.status(400).json({ error: "Text field is required" });
		}

        const post = await postModel.findById(postId);
		if (!post) {
			return res.status(404).json({ error: "Post not found" });
		}

        const reply = { userId, text, userProfilePic, username };
        
        post.replies.push(reply);
        await post.save();

        res.status(200).json(reply);
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}