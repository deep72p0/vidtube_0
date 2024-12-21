import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
// import ffmpeg from "ffmpeg"

const videoSchema = new Schema(
    {
        videoFile: {
            type: String, //cloudinary url
            required: true
        },
        thumbnail: {
            type: String, //cloudinary url
            required: true
        },
        title: {
            type: String, 
            required: true
        },
        description: {
            type: String, 
            required: true
        },
        duration: {
            type: Number, 
            required: true
        },
        views: {
            type: Number,
            default: 0
        },
        likes: {
            type: Schema.Types.ObjectId, //added by me
            default: "Like"
        },
        isPublished: {
            type: Boolean,
            default: true
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }

    }, 
    {
        timestamps: true
    }
)

videoSchema.plugin(mongooseAggregatePaginate)

/*videoSchema.methods.getDuration = async function(filePath){
    await return ffmpeg.ffprobe(filePath, (err, metadata) => {
    if (err) {
        console.error('Error extracting metadata:', err);
        return res.status(500).send({ error: 'Error extracting video duration' });
    }

        const duration = metadata.format.duration;
        console.log('Extracted duration:', duration);
        return duration 
    })
}*/

export const Video = mongoose.model("Video", videoSchema)