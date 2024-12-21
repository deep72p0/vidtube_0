import mongoose, { isValidObjectId } from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    // Total Likes on the channel
    const {channelId} = req.body

    // Filter videos of a channel
    const videos = [];

    if(channelId){
        if(!isValidObjectId(channelId)){
            throw new ApiError(400, "video_id is invalid")
        }
        videos.owner = channelId
    }    

    // Count videos of a channel
    const userVideos = await Video.find(videos[0])
    
    if(!userVideos){
        throw new ApiError(400, "No videos on this channel")
    }

    const videoId = userVideos.forEach(obj => {
        return obj._id
    });

    // Filter likes of a channel
    const likes = {};

    if(videoId){
        if(!isValidObjectId(videoId)){
            throw new ApiError(400, "video_id is invalid")
        }    
        likes.owner = videoId
    }

    // Count likes of a channel
    const totalChannelLikes = await Like.countDocuments(likes)

    if(!totalChannelLikes){
        throw new ApiError(400, "No likes on this channel")
    }

    // Total videos

    // Filter the data
    const filter = {};
    if(channelId){
        filter.owner = channelId
    }

    //Get the totalVideos
    const totalVideos = await Video.countDocuments(filter)

    /* Total Views
    const views = await Video.findById(
        channelId,
        {
            $project: views
        })

    if(!views){
        throw new ApiError(400, "No views on this video")
    } */

    // Subscribers
    const subscriberFilter = {};

    if(channelId){
        subscriberFilter.channel = channelId
    }
    
    const totalSubscribers = await Subscription.countDocuments(subscriberFilter)
    // Response
    return res
     .status(200)
     .json(new ApiResponse(200, {totalChannelLikes, totalVideos, totalSubscribers}, "Fetched all the channel information successfully"))
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    // Grab the channel_id
    const {channelId} = req.body

    // Get the query
    const{page=1, limit=10} = req.query

    // Filter the data
    const filter = {};
    if(channelId){
        if(!isValidObjectId(channelId)){
            throw new ApiError(400, "channel_id is invalid")
        }
        filter.owner = channelId
    }

     // Calculate the pagination
     const skip = (page - 1) * limit ;

     //Get the videos
    const allVideos = await Video.find(filter)
    .skip(skip)
    .limit(parseInt(limit))

    //Response
    return res
     .status(200)
     .json({
        ...new ApiResponse(200, allVideos, "Fetched all videos for the Channel"),
        pagination: {
            total: allVideos.length,
            page: parseInt(page, 10),
            limit: parseInt(limit, 10),
        }
    })
})

export {
    getChannelStats, 
    getChannelVideos
    }