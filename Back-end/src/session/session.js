const mongoose = require("mongoose");

const sessionSchema = mongoose.Schema({
    sessionName:  { type: String, required: true},
    owner : {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    currentSongInfo: { 
        songuri : { type: String},
        songName : { type: String},
        artist : { type: String},
        album : { type: String}
    }, 
    nextSong:   { type: String },    // might store ID depending on Spotify API
    sessionPic: { type: Buffer},
    createdAt:  { type: Date, default: new Date()},
    history:[{
        song:{
            type: String,
            ref: 'Song'
        }
    }],
    requestedSongs:{
        type: Map,
        of: Number,
        default: {}
    }
})
const Session = mongoose.model("Session", sessionSchema);

module.exports = {Session};
