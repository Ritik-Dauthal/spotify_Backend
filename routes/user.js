const express = require('express')
const passport = require('passport');
const User = require('../models/User')
const router = express.Router()


router.put('/updateDetails', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const { firstName, lastName } = req.body;

        const user = await User.findOne(req.user._id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (firstName) {
            user.firstName = firstName;
        }

        if (lastName) {
            user.lastName = lastName;
        }

        await user.save();

        const updatedUser = user

        return res.status(200).json({ success: true, message: "User details updated successfully", user: updatedUser });
    } catch (error) {
        return res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router
