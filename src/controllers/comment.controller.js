import mongoose, {isValidObjectId, trusted} from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video

    // Grab the video_id
    const {videoId} = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "video_id is invalid")
    }

    // Grab the query
    const {page = 1, limit = 10} = req.query

    // Calculate the pagination
    const skip = (page - 1) * limit
    
    // Get the comments
    const comments = await Comment.find(
        {
            video: videoId
        }
    )

    if(!comments){
        console.log(comments)
        throw new ApiError(400, "Failed to fetch the comments")
    }

    // Response
    return res
     .status(200)
     .json({
        ...new ApiResponse(200, comments, "Fetched the comments successfully"),
        pagination: {
            page,
            limit,
            total: comments.length
        }
})

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video

    try {
        //Get the body
        const {videoId} = req.params

        const {content, userId} = req.body

        // Validation
        if(!isValidObjectId(videoId)){
            throw new ApiError(400, "Invalid Video")
        }

        if(!content || typeof content !== "string"){
            throw new ApiError(400, "Failed to fetch Content")
        }

        if(!isValidObjectId(userId)){
            throw new ApiError(400, "Invalid User")
        }
    
        // Create the comment
        const comment = await Comment.create({
            content,
            owner: userId,
            video: videoId
        })
    
        //Response
        return res
        .status(200)
        .json(new ApiResponse(200, comment, "Added a comment successfully"))
    } catch (error) {
        throw new ApiError (400, "Failed to add a comment")
    }
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment

    // Get the id of the Comment
    const{content} = req.body
    const{commentId} = req.params

    // Validation
    if(!content || typeof content !== "string"){
        throw new ApiError(400, "Failed to fetch Content")
    }

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Comment id is not valid")
    }

    try {
        // Update the Tweet
        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,{
        $set: {
            content: content
        }
    })
        
    // Response
    return res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Updated the comment successfully"))
    } catch (error) {
        throw new ApiError(400, "Failed to update the Comment")
    }
})

const deleteComment = asyncHandler(async (req, res) => {
// TODO: delete a comment

// Get the id of the Comment
const{commentId} = req.params

// Validation
if(!isValidObjectId(commentId)){
    throw new ApiError(400, "Comment id is not valid")
}
        
try {
    // Update the Tweet
    const deletedComment = await Comment.findByIdAndDelete(commentId)
            
// Response
return res
.status(200)
.json(new ApiResponse(200, deletedComment, "Deleted the comment successfully"))
} catch (error) {
    throw new ApiError(400, "Failed to Delete the Comment")
}
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }
