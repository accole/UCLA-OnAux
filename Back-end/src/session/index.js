const checkAuth = require("../middleware/jwt_authenticator.js");
const Session = require("./session").Session;
const express = require("express");
const app = express()
const router = new express.Router();
const SessionDB = require("./controller.js");
const SongDB = require("../song/controller.js");
const { Socket } = require("dgram");
const http = require('http').Server(app);
const io = require('socket.io')(http);

//Run when client connects
io.on('connection', () =>{
    console.log('a user is connected')
  //  socket.emit(); only to the user
  // socket.broadcast.emit() everyone but me
  // io.emit() everyone
})

//================= Create a DJ Session ==============
router.post("/session/create", checkAuth, async(req,res) => {

    try{
    
        const newSessionInfo = await SessionDB.createSession(req.user, req.body)
        const userAsDJWithSessionID = req.user
        res.status(201).send({userAsDJWithSessionID, newSessionInfo}) 
    }
    
    catch(e){
        res.status(500).send({error:e})
    }
})

//================= Get a Session Info With its ID as a parameter ==============
router.get("/session/session-id=:id", checkAuth, async(req,res) => {

    try{
        const sessionInfo = await Session.findById({ _id: req.params.id})
        if(!sessionInfo){
            return res.status(404).send()
        }
        res.send(sessionInfo)
    }
    catch(e){
        res.status(500).send({error:e})
    }
})

//================= Get All Created SessionIDs ==============
router.get("/session/all", checkAuth, async(req,res) => {

    try{
        const allSessionIDs = await Session.find( { }, { sessionName: 1 } )
        if(!allSessionIDs){
            return res.status(404).send()
        }
        res.send(allSessionIDs)
    }
    catch(e){
        res.status(500).send({error:e})
    }
})

//================= Request a Song, using socket.io for real time ==============
//TODO: Front-end gotta add some stuff
// app.post('/session/session-id=:id/request', (req, res) => {
//     check if a new song
//     else upvote/downvote
//     
//     song.save((err) =>{
//       if(err)
//         sendStatus(500);
//       io.emit('request', req.body);
//       res.sendStatus(200);
//     })
// })


//================= Request Song, or UpVote/DownVote ==============
router.post("/session/session-id=:id/request-song", checkAuth, async(req,res) => {
    //TODO: MAKE IT REAL TIME
    let sessionInfo = undefined
    try{
        sessionInfo = await Session.findById({ _id: req.params.id})
        
        var songuri = req.body.songInfo.songuri.toString()
        //key should be string
        if (sessionInfo.requestedSongs.get(songuri) !== undefined) {
            var vote = parseInt(req.body.vote)
            sessionInfo.requestedSongs.set(songuri, sessionInfo.requestedSongs.get(songuri) + vote)
        }
        else {
            sessionInfo.requestedSongs.set(songuri, 1)
        }
        await sessionInfo.save()
        res.send(sessionInfo)
    }
    catch(e){
        if(!sessionInfo){
            return res.status(404).send({error: "No session found with that sessionID"})
        }
        res.status(500).send({error:e})
    }
})

//================= Set the current song ==============
router.post("/session/session-id=:id/set-current-song", checkAuth, async(req,res) => {
    //TODO: MAKE IT REAL TIME
    let sessionInfo = undefined
    try{
        sessionInfo = await Session.findById({ _id: req.params.id})
        sessionInfo.currentSongInfo = req.body.songInfo
        await sessionInfo.save()
        res.send(sessionInfo)
    }
    catch(e){
        console.log(e)
        if(!sessionInfo){
            return res.status(404).send({error: "No session found with that sessionID"})
        }
        res.status(500).send({error:e})
    }
})

//================= Get Session History ==============
router.get("/session/session-id=:id/history", checkAuth, async(req,res) => {
    //TODO: MAKE IT REAL TIME
    let sessionInfo = undefined;
    try{
        sessionInfo = await Session.findById({ _id: req.params.id});
        if (!sessionInfo) {
            throw new Error();
        } else {
            const hist = await SessionDB.dumpHistory(sessionInfo);
            res.send(hist);
        }
    }
    catch(e){
        if(!sessionInfo){
            return res.status(404).send({error: "No session found with that sessionID"});
        }
        res.status(500).send({error:e});
    }
})

//================= Add Song to History ==============
router.post("/session/session-id=:id/history/add-song", checkAuth, async(req,res) => {
    let sessionInfo = undefined;
    const songInfo = req.body.songInfo;
    try{
        sessionInfo = await Session.findById({ _id: req.params.id});
        if (!sessionInfo) {
            throw new Error();
        } else if (songInfo.songuri === "" || songInfo.songName === "" || songInfo.artist == "") {
            return res.status(400).send("Incomplete song information");
        } else {
            const duplicate = await SessionDB.duplicateHistorySong(sessionInfo, songInfo);
            if (!duplicate) {
                const newSong = await SongDB.createSong(songInfo);
                sessionInfo.history.push(newSong);
                await sessionInfo.save();
            } 
            const hist = await SessionDB.dumpHistory(sessionInfo);
            res.send(hist);
        }
    }
    catch(e){
        if(!sessionInfo){
            return res.status(404).send({error: "No session found with that sessionID"});
        }
        res.status(500).send({error:e});
    }
})


module.exports = router;