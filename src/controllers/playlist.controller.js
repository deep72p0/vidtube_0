import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    //TODO: create playlist

    // Grab the body
    const {name, description, videos, userId} = req.body

    // Validation
    if(!Array.isArray(videos)){
        throw new ApiError(400, "videos must be an array")
    }

    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user_id")
    }

    // Create playlist
    const playlist = await Playlist.create({
        name,
        description,
        videos,
        owner: userId
    })

    // Response
    return res
     .status(200)
     .json(new ApiResponse(200, playlist, "Playlist created successfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    //TODO: get user playlists

    // Get the id
    const {userId} = req.params

    //Filter the playlists
    const filter = {};
    if(userId){
        if(!isValidObjectId(userId)){
            throw new ApiError(400, "user_id is invalid")
        }
        filter.owner = userId
    }
    // Get the users playlists
    const userPlaylists = await Playlist.find(filter)
    
    // Response
    return res
     .status(200)
     .json(new ApiResponse(200, userPlaylists, "Found all the playlists"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    //TODO: get playlist by id

    // Grab the id
    const {playlistId} = req.params

    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "playlist_id is not valid")
    }

    // Get playlist
    const playlist = await Playlist.findById(playlistId)

    if(!playlist){
        throw new ApiError(400, "Playlist doesn't exist") 
    }
    
    // Response
    return res
     .status(200)
     .json(new ApiResponse(200, playlist, "Fetched the playlist successfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    // Grab the id's
    const {playlistId, videoId} = req.params

    // Validation
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "playlist_id is not valid")
    }
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "video_id is not valid")
    }

    // Add the video to the playlist
    const newPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
    {
        $set: {
            videos: videoId
        }
    })

    // Response
    return res
     .status(200)
     .json(new ApiResponse(200, newPlaylist, "Video added to playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    // TODO: remove video from playlist

    // Grab the id
    const {playlistId, videoId} = req.params
 
     // Validation
     if(!isValidObjectId(playlistId)){
         throw new ApiError(400, "playlist_id is not valid")
     }
     if(!isValidObjectId(videoId)){
         throw new ApiError(400, "video_id is not valid")
     }
 
     // Remove the video from the playlist
     const newPlaylist = await Playlist.findByIdAndUpdate(
         playlistId,
     {
         $pull: {
             videos: videoId
         }
     })
 
     // Response
     return res
     .status(200)
     .json(new ApiResponse(200, newPlaylist, "Video removed from playlist successfully"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    // TODO: delete playlist
    const {playlistId} = req.params
    
    // Validation
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "playlist_id is not valid")
    }

    // Delete the playlist 
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    // Response
    return res
     .status(200)
     .json(new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    //TODO: update playlist
    const {playlistId} = req.params
    const {name, description} = req.body

    // Validation
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "playlist_id is not valid")
    }

    // Update the playlist
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name,
                description
            }
        }
    )
    
    // Response
    return res
     .status(200)
     .json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
