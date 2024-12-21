import mongoose, {Schema} from "mongoose"

const subscriptionSchema = new Schema({
    subscriber: {
        type: Schema.Types.ObjectId, // one who is subscribing
        ref: "User"
    },
    channel: {
        type: Schema.Types.ObjectId, // one to whom 'subscriber' is subscribing
        ref: "User"
    },
    videos: {
        type: Schema.Types.ObjectId, // Created by me
        ref: "Video"
    },
    likes: {
        type: Schema.Types.ObjectId, // Created by me
        ref: "Like"
    }
}, {timestamps: true})



export const Subscription = mongoose.model("Subscription", subscriptionSchema)