const express = require('express')
const mongoose = require('mongoose')
const User = require('./models/User')
const authroutes = require('./routes/auth')
const userroutes = require('./routes/user')
const songroutes = require('./routes/song')
const playlistroutes = require('./routes/playlist')
require('dotenv').config()
const app = express()
const JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
const passport = require('passport')
const cors = require("cors");
const Port = process.env.PORT || 3001;

const corsOptions = {
    origin: ["https://espotify-rust.vercel.app/", "http://localhost:3000/"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json())



let opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = 'secretKey';
passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
    User.findOne({ _id: jwt_payload.identifier }, function (err, user) {
        if (err) {
            return done(err, false);
        }
        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    });
}))

const uri = "mongodb+srv://ritikdauthal12345:" + process.env.Mongo_Password + "@mycluster.nykqyhm.mongodb.net/?retryWrites=true&w=majority";

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true, }).then((i) => { console.log("connected") })


app.get('/', (req, res) => {
    res.send("Hello World")
})
app.use('/auth', authroutes)
app.use('/song', songroutes)
app.use('/playlist', playlistroutes)
app.use('/user', userroutes)


app.listen(Port, () => {
    console.log(`app listening on port ${Port}`)
})

