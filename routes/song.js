const express = require('express')
const passport = require('passport');
const Song = require('../models/Song');
const User = require('../models/User')
const router = express.Router()


// Api for creating own songs
router.post('/create', passport.authenticate('jwt', { session: false }), async (req, res) => {
  const { name, thumbnail, track } = req.body

  if (!name || !thumbnail || !track) {

    return res.status(301).json({ err: "Insufficient details to create song." })
  }
  const artist = req.user._id
  const songDetails = { name, thumbnail, track, artist }
  const createdSong = await Song.create(songDetails)
  return res.status(200).json(createdSong)
})


// Api for getting own songs
router.get('/get/mysongs', passport.authenticate("jwt", { session: false }), async (req, res) => {
  const songs = await Song.find({ artist: req.user._id }).populate("artist")
  res.status(200).json({ data: songs })
})

// Api for getting songs by any artist
router.get('/get/artist/:artistId', passport.authenticate("jwt", { session: false }), async (req, res) => {
  const { artistId } = req.params;
  const artist = await User.findOne({ _id: artistId })

  if (!artist) {
    res.status(301).json({ err: "Artist doesn't exist." })
  }

  const songs = await Song.find({ artist: artistId });
  res.status(200).json({ data: songs })
})

// Api for getting song by song name
router.get('/get/songname/:songName', passport.authenticate("jwt", { session: false }), async (req, res) => {
  const { songName } = req.params;

  const songs = await Song.find({ name: songName });
  res.status(200).json({ data: songs })
})

module.exports = router