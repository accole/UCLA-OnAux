const mongoose = require("mongoose");

const sessionSchema = mongoose.Schema({

    sessionName:  { type: String, required: true},
    owner : {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    currentSong:   { type: String }, // might store ID depending on Spotify API
    nextSong:   { type: String },    // might store ID depending on Spotify API
    sessionPic: { type: Buffer},
    createdAt:  { type: Date, default: new Date()},
    histroy:[{
        song:{
            type: String,
            ref: 'Song'
        }
    }],
    requstedSongs:[{
        song:{
            type: String,
            ref: 'Song'
        }
    }],
})


const Session = mongoose.model("Session", sessionSchema);
module.exports = {Session};