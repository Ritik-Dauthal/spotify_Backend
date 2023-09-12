const express = require('express')
const passport = require('passport');
const Playlist = require('../models/Playlist');
const User = require('../models/User');
const Song = require('../models/Song');
const router = express.Router()

// Api for creating a new playlist
router.post('/create', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const currentUser = req.user
    const { name, thumbnail, songs } = req.body

    if (!name || !thumbnail || !songs) {
        return res.status(301).json({ err: "Insufficient data" })
    }
    const playlistData = { name, thumbnail, songs, owner: currentUser._id, colloaborators: [] }

    const playlist = await Playlist.create(playlistData)
    return res.status(200).json(playlist)
})

// Api to get playlist by id
router.get('/get/playlist/:playlistId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const playlistId = req.params.playlistId

    const playlist = await Playlist.findOne({ _id: playlistId })
    if (!playlist) {
        res.status(301).json({ err: "Invalid Id" })
    }
    return res.status(200).json(playlist)
})


// Api to get my playlist
router.get(
    "/get/me",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        const artistId = req.user._id;

        const playlists = await Playlist.find({ owner: artistId }).populate(
            "owner"
        );
        return res.status(200).json({ data: playlists });
    }
);

//  Api to get a playlist of artist by id
router.get('/get/artist/:artistId', passport.authenticate('jwt', { session: false }), async (req, res) => {
    const artistId = req.params.artistId

    const artist = await User.findOne({ _id: artistId })
    if (!artist) {
        return res.status(304).json({ err: "Invalid Artist ID" })
    }

    const playlists = await Playlist.find({ owner: artistId })
    return res.status(200).json({ success: true, playlists })
})

// Api to add songs in my playlist
router.post(
    "/add/song",
    passport.authenticate("jwt", { session: false }),
    async (req, res) => {
        const currentUser = req.user;
        const { playlistId, songId } = req.body;
        // Step 0: Get the playlist if valid
        const playlist = await Playlist.findOne({ _id: playlistId });
        if (!playlist) {
            return res.status(304).json({ err: "Playlist does not exist" });
        }

        // Step 1: Check if currentUser owns the playlist or is a collaborator
        if (
            !playlist.owner.equals(currentUser._id) &&
            !playlist.collaborators.includes(currentUser._id)
        ) {
            return res.status(400).json({ err: "Not allowed" });
        }
        // Step 2: Check if the song is a valid song
        const song = await Song.findOne({ _id: songId });
        if (!song) {
            return res.status(304).json({ err: "Song does not exist" });
        }

        // Step 3: We can now simply add the song to the playlist
        playlist.songs.push(songId);
        await playlist.save();

        return res.status(200).json(playlist);
    }
);

module.exports = router