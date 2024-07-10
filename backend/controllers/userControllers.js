import userModel from "../models/userModel.js";
import postModel from "../models/postModel.js";
import bcrypt from "bcryptjs";
import generateTokenAndSetCookie from "../helpers/generateTokenAndSetCookie.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
// import { writeFileSync,writeFile } from "fs";

export const signupUser = async(req,res) => {
    try {
        const { fullname, username, password, email, confirmPassword } = req.body;

        if(password !== confirmPassword) {
            return res.status(400).json({
                error:"Password and confirm password mismatch!"
            })
        }

        const user = await userModel.findOne({$or:[{email},{username}]})

        if(user) {
            return res.status(400).json({
                error:"An user with this username or email already exists!"
            })
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password,salt);

        const newUser = new userModel({
			fullname,
			email,
			username,
			password: hashedPassword,
		});
		await newUser.save();

        if (newUser) {
			generateTokenAndSetCookie(newUser._id, res);

			res.status(201).json({
				_id: newUser._id,
				name: newUser.name,
				email: newUser.email,
				username: newUser.username,
				bio: newUser.bio,
				profilePic: newUser.profilePic,
			});
		} else {
			res.status(400).json({ error: "Invalid user data" });
		}

    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }

}

export const loginUser = async(req,res) => {
    try {
        const { username, password } = req.body;

        const user = await userModel.findOne({username});
        const isPasswordCorrect = await bcrypt.compare(password,user.password || "");

        if(!user) {
            return res.status(400).json({
                error:"Invalid username!"
            })
        }
        if(!isPasswordCorrect) {
            return res.status(400).json({
                error:"Password is Incorrect!"
            })
        }

        if (user.isFrozen) {
			user.isFrozen = false;
			await user.save();
		}

        generateTokenAndSetCookie(user._id, res);

        res.status(200).json({
			_id: user._id,
			fullname: user.fullname,
			email: user.email,
			username: user.username,
			bio: user.bio,
			profilePic: user.profilePic,
		});

    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}

export const followUnFollowUser = async(req,res) => {
    try {
        const { id } = req.params;
        const userToFollow = await userModel.findById(id);
        const currentUser = await userModel.findById(req.user._id);

        if(id === req.user._id.toString()) {
            return res.status(400).json({
                error:"You can't follow/unfollow yourself!"
            })
        }
        if (!userToFollow || !currentUser) {
            return res.status(400).json({ 
                error: "User not found" 
            });
        }

        const isFollowing = currentUser.following.includes(id);

        if(isFollowing) {
            // unfollow user
            await userModel.findByIdAndUpdate(id,{$pull:{followers:req.user._id}});
            await userModel.findByIdAndUpdate(req.user._id,{$pull:{following:id}});
            res.status(200).json({ message: "User unfollowed successfully" });
        } else {
            // Follow user
			await userModel.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
			await userModel.findByIdAndUpdate(req.user._id, { $push: { following: id } });
			res.status(200).json({ message: "User followed successfully" });
        }

    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}

export const updateUser = async(req,res) => {
    const { fullname, email, username, password, bio } = req.body;
    let { profilePic } = req.body;

    // const imgPath = `C:\\Users\\ajayaju\\Projects\\MERN\\Threads Clone\\backend\\uploads\\profile\\${username}_dp.png`
    
    // let base64Image = profilePic.split(';base64,').pop();

    // writeFile(imgPath, base64Image, {encoding: 'base64'}, function(err) {
    //     console.log('File created');
    // });

    const userId = req.user._id;

    try {
        let user = await userModel.findById(userId);
		if (!user) {
            return res.status(400).json({
             error: "User not found"
            });
        }
        if (req.params.id !== userId.toString()) {
			return res.status(400).json({ 
                error: "You cannot update other user's profile" 
            });
        }

        if (password) {
			const salt = await bcrypt.genSalt(10);
			const hashedPassword = await bcrypt.hash(password, salt);
			user.password = hashedPassword;
		}

		if (profilePic) {
			if (user.profilePic) {
				await cloudinary.uploader.destroy(user.profilePic.split("/").pop().split(".")[0]);
			}

			const uploadedResponse = await cloudinary.uploader.upload(profilePic);
			profilePic = uploadedResponse.secure_url;
		}

		user.fullname = fullname || user.fullname;
		user.email = email || user.email;
		user.username = username || user.username;
		user.profilePic = profilePic || user.profilePic;
		user.bio = bio || user.bio;

		user = await user.save();

        // Find all posts that this user replied and update username and userProfilePic fields
        await postModel.updateMany(
            { "replies.userId" : userId },
            {
                $set: {
                    "replies.$[reply].username" : user.username,
                    "replies.$[reply].userProfilePic" : user.profilePic
                },
            },
            { arrayFilters: [{ "reply.userId": userId }] }
        )

        // password should be null in response
		user.password = null;

        res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}

export const freezeAccount = async(req,res) => {
    try {
        const user = await userModel.findById(req.user._id);
		if (!user) {
			return res.status(400).json({ error: "User not found" });
		}

		user.isFrozen = true;
		await user.save();

		res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}

export const logoutUser = async(req,res) => {
    try {
        res.cookie("jwt","",{maxAge:1});
        res.status(200).json({
            message:"User logged out successfully"
        })
    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }

}

export const getUserProfile = async(req,res) => {
    const { query } = req.params;
    try {
        let user;

		// query is userId
		if (mongoose.Types.ObjectId.isValid(query)) {
			user = await userModel.findOne({ _id: query }).select("-password").select("-updatedAt");
		} else {
			// query is username
			user = await userModel.findOne({ username: query }).select("-password").select("-updatedAt");
		}

		if (!user) return res.status(404).json({ error: "User not found" });

		res.status(200).json(user);

    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }

}

export const getSuggestedUser = async(req,res) => {
    try {
        // exclude the current user from suggested users array and exclude users that current user is already following
		const userId = req.user._id;

        const usersFollowedByYou = await userModel.findById(userId).select("following");

        const users = await userModel.aggregate([
            {
                $match: {
                    _id: { $ne : userId }
                }
            },
            {
                $sample: { size : 10 }
            }
        ]);

        const filteredUsers = users.filter((user) => !usersFollowedByYou.following.includes(user._id));

		const suggestedUsers = filteredUsers.slice(0, 4);

        res.status(200).json(suggestedUsers);

    } catch (error) {
        res.status(500).json({
            error: error.message 
        });
    }
}