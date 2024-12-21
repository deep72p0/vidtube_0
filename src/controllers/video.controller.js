import mongoose, {isValidObjectId, trusted} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {deleteFromCloudinary, uploadOnCloudinary} from "../utils/cloudinary.js"

const getAllVideos = asyncHandler(async (req, res) => {

// Step 1: Extract Query Parameters
const { page = 1, limit = 10, search, sort, userId } = req.query

//TODO: get all videos based on query, sort, pagination
     try {
         // Step 2: Validate `page` and `limit`
         if (isNaN(page) || page <= 0) {
              throw new ApiError(400, "Invalid 'page' parameter. It must be a positive number.");
        }
        if (isNaN(limit) || limit <= 0) {
            throw new ApiError(400, "Invalid 'limit' parameter. It must be a positive number.");
        }
    
        // Step 3: Build and Validate Filter Object
        const filter = {};
        if (search) {
            if (typeof search !== "string") {
                  throw new ApiError(400, "Invalid 'search' parameter. It must be a string.");
            }
             filter.title = { $regex: search, $options: "i" }; // Case-insensitive search
         }

         if (userId) {
             if (!isValidObjectId(userId)) {
                   throw new ApiError(400, "User not found");
             }
             filter.owner = userId // For fetching the videos uploaded of a specific user
        }
    
         // Step 4: Build and Validate Sort Criteria
        const sortCriteria = {};
        if (sort) {
            const [field, order] = sort.split(":")
                if (!field || !["asc", "desc"].includes(order)) {
                  throw new ApiError(400, "Invalid 'sort' parameter. Use 'field:asc' or 'field:desc'.");
               }
               sortCriteria[field] = order === "desc" ? -1 : 1;
         }
    
        // Step 5: Pagination Calculations
        const skip = (page - 1) * limit;
    
        // Step 6: Query Database
         const videos = await Video.find(filter)
              .sort(sortCriteria)
              .skip(skip)
         .limit(parseInt(limit));
    
        // Validate if videos are found
         if (!videos || videos.length === 0) {
              throw new ApiError(404, "No videos found for the given query.");
         }
    
        // Step 7: Get Total Count
        const totalVideos = await Video.countDocuments(filter);
    
         // Step 8: Respond with Data
         return res
        .status(201)
        .json({
        ...new ApiResponse(201, videos, "Video fetched successfully"),
        pagination: {
        total: totalVideos,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(totalVideos / limit),
        },
        });

    } catch (error) {
        if (error instanceof ApiError) {
            res.status(error.statusCode).json({ success: false, message: error.message });
        } else {
            res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
        }
    }
});
           
const publishAVideo = asyncHandler(async (req, res) => {

    // TODO: get video, upload to cloudinary, create video
    const { title, description, userId} = req.body
    
    // Validation
     if(!title || typeof title !== "string"){
        throw new ApiError (400, "Title needs to be a string")
    }
     
    if(!description || typeof description !== "string"){
        throw new ApiError (400, "Description needs to be a string")
    }
    
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "User is not Valid")
    }

    // Get the Filepath
    const videoFilePath = req.files?.videoFile[0].path

    if(!videoFilePath){
        console.log(`hello from:`, req.files)
        throw new ApiError (400, "Video file is missing") 
    }

    const thumbnailPath = req.files?.thumbnail[0].path

    if(!thumbnailPath){
        
        throw new ApiError (400, "Thumbnail is missing") 
    }

    // Upload it on the Cloudinary
    const videoFile = await uploadOnCloudinary(videoFilePath)

    if(!videoFile.url){
        throw new ApiError(400, "Failed to upload on Cloudinary")
    }
    
    const thumbnail = await uploadOnCloudinary(thumbnailPath)

    if(!thumbnail.url){
        throw new ApiError(400, "Failed to upload on Cloudinary")
    }

    /*const path = ffmpeg.ffprobe(videoFilePath, (metadata) => {
        const duration = metadata.format;
        console.log(duration)
        return duration 
    })

    if(path){
        console.error(error)
        throw new ApiError(400, "console.log(PATH)")
    }*/
    
    try{
     // Create the Video
     const video = await Video.create({
         title,
         description,
         videoFile: videoFile.url,
         thumbnail: thumbnail.url,
         duration: 30,
         owner: userId
     })

     // Save the video?(in the updated versions *.Create* method creates an saves the object into the DB automatically)
     //await video.save({ validateBeforeSave: false })

     // Return a response
     
     return res
    .status(201)
    .json(new ApiResponse(201, video, "Published the video")
)
    } catch(error){
        console.error(error)

        throw new ApiError(500,"Something happened while uploading the video")
    }
})

const getVideoById = asyncHandler(async (req, res) => {

    // TODO: get video by id
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        
        throw new ApiError(400, "video id is invalid")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(400, "video not found")
    }

    // Returning a response
    return res
    .status(201)
    .json(new ApiResponse(201, video, "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    //TODO: update video details like title, description, thumbnail
    
    // Get video details
    const {title, description} = req.body

    if(!title || typeof title !== "string"){
        throw new ApiError (400, "Title needs to be a string")
    }
     
    if(!description || typeof description !== "string"){
        throw new ApiError (400, "Description needs to be a string")
    }
    
    // Get the thumbnail
     const thumbnailFilePath = req.file?.path
    
     if(!thumbnailFilePath){
        throw new ApiError(400, "Filepath not found")
    }
    
    const thumbnail = await uploadOnCloudinary(thumbnailFilePath)
    if(!thumbnail.url){
        throw new ApiError(400, "Thumbnail does not exist")
    }

    //Delete the old thumbnail
    const video = await Video.findById(req.params.videoId)

    if(video.thumbnail){
        await deleteFromCloudinary(thumbnail.public_id)
    }

    // Update the video
    const { videoId } = req.params
    const updatedVideo = await Video.findByIdAndUpdate(
        videoId,                                       // req.params?._id can also b used
        {
            $set:{
                title,                
                description,
                thumbnail: thumbnail.url
            }
        },
        {new: true, runValidators:true}                 // Return the updated document and run schema validators
    )

    // Returning a response
    return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video details updated successfully"))
})

const deleteVideo = asyncHandler(async (req, res) => {

    // TODO: delete video
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid id")
    }

    // Find and delete the Video
    const video = await Video.findByIdAndDelete(videoId)
    
    if(video){                             
   // We have to fetch the publicId because the video is already deleted from the DB(i guess /\(*~*)/\)
        await deleteFromCloudinary(video.public_id);
    }

    // Response
    return res
    .status(200)
    .json(new ApiResponse(200, video, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {

    // Validate the video ID
    const { videoId } = req.params

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid id")
    }

    try {
        // Find the video by ID
        const video = await Video.findById(videoId);

        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        // Toggle the published status
        video.isPublished = !video.isPublished;
        const updatedVideo = await video.save();

        // Send the updated video as a response
        return res
        .status(200)
        .json(new ApiResponse(200, updatedVideo, "Video publish status updated successfully"))
    } catch (error) {
        throw new ApiError(500, error.message || "Server error");
    }
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
