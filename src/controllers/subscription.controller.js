import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    // TODO: toggle subscription

    // Get the channel id
    const {channelId} = req.params
    const {subscriberId} = req.body
    // Validation
    if(!isValidObjectId(channelId)){
        throw new ApiError(400, "Invalid Channel_id")
    }

    if(!isValidObjectId(subscriberId)){
        throw new ApiError(400, "Invalid subscriber_id")
    }

    // check if the subscriber exist
    const subscribed = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    })

    if(subscribed){
        await Subscription.findByIdAndDelete(subscribed)
        return res
     .status(201)
     .json(new ApiResponse(201, subscribed, "Subscription removed successfully"))
    }

    // Creating new subscription
    const newSubscriber = await Subscription.create({
        subscriber: subscriberId,
        channel: channelId
    })

    // Response 
    return res
     .status(200)
     .json(new ApiResponse(200, newSubscriber, "Subscribed to the channel"))
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    // Get the Channel_id
    const {channelID} = req.params

    // Filter the channels
    const filter = {};
    if(channelID){
        if(!isValidObjectId(channelID)){
            throw new ApiError(400, "Invalid channel_id")
        }
        filter.channel = channelID
    }
    // Get the Channel
    const subscribers = await Subscription.find(filter)

    // Response
    return res
     .status(200)
     .json(new ApiResponse(200, subscribers, "Fetched the subscribers successfully"))
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    // Get the subscriber's id
    const {subscriberId} = req.params
     // Filter the channels
     const filter = {};
     if(subscriberId){
         if(!isValidObjectId(subscriberId)){
             throw new ApiError(400, "Invalid user_id")
         }
         filter.subscriber = subscriberId
     }
     // Get the Channel
     const subscribedChannels = await Subscription.find(filter)

     // Response
     return res
     .status(200)
     .json(new ApiResponse(200, subscribedChannels, "Fetched the subscribed channels successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}