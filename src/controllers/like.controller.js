import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    // TODO: toggle like on video

    // Get the video_id 
    const {videoId} = req.params

    if (!isValidObjectId(videoId)) {
        return new ApiError(400, "Invalid video ID.");
    }

    // Get the user_id
    const {userId} = req.body;

    // Check if the video is already liked
    const existingLike = await Like.findOne({ 
        likedBy: userId, 
        video: videoId 
    });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike);
        return res
     .status(200)
     .json(new ApiResponse(200, existingLike, "Like removed"))
    }

    // Create new Like
    const newLike = await Like.create({ 
        likedBy: userId, 
        video: videoId 
    });

    // Response
    return res
     .status(200)
     .json(new ApiResponse(200, newLike, "Like added"))
});

const toggleCommentLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on comment

    // Get the video_id 
    const {commentId} = req.params

    if (!isValidObjectId(commentId)) {
        return new ApiError(400, "Invalid comment ID.");
    }

    // Get the user_id
    const {userId} = req.body;

    // Check if the comment is already liked
    const existingLike = await Like.findOne({ 
        likedBy: userId, 
        comment: commentId 
    });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike);
        return res
     .status(200)
     .json(new ApiResponse(200, existingLike, "Like removed"))
    }

    // Create new Like
    const newLike = await Like.create({ 
        likedBy: userId, 
        comment: commentId 
    });

    // Response
    return res
     .status(200)
     .json(new ApiResponse(200, newLike, "Like added"))
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    //TODO: toggle like on tweet

    // Get the video_id 
    const {tweetId} = req.params

    if (!isValidObjectId(tweetId)) {
        return new ApiError(400, "Invalid tweet ID.");
    }

    // Get the user_id
    const {userId} = req.body;

    // Check if the tweet is already liked
    const existingLike = await Like.findOne({ 
        likedBy: userId, 
        tweet: tweetId 
    });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike);
        return res
     .status(200)
     .json(new ApiResponse(200, existingLike, "Like removed"))
    }

    // Create new Like
    const newLike = await Like.create({ 
        likedBy: userId, 
        tweet: tweetId 
    });

    // Response
    return res
     .status(200)
     .json(new ApiResponse(200, newLike, "Like added"))
})

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    // Get the user_id
    const {userId} = req.body;

    // Validation
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user_id")
    }

    // Get all liked videos
    const videos = {};

    if(userId){
        if(!isValidObjectId(userId)){
            throw new ApiError(400, "Invalid User")
        videos.likedBy = userId
    }

    const likedVideos = await Like.find(videos)

    // Response
    return res
     .status(200)
     .json(new ApiResponse(200, likedVideos, "Found all the liked videos"))
}
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}