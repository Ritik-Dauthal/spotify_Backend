const express = require('express')
const router = express.Router()
const User = require('../models/User')
const { getToken } = require('../Utils/helpers')
const bcrypt = require('bcrypt')


router.post('/register', async (req, res) => {
  const { firstName, lastName, username, email, password, year, month, day } = req.body

  if (!firstName || !lastName || !username || !email || !password || !year || !month || !day) {

    return res.status(301).json({ err: "Insufficient details to create user." })
  }

  const userEMail = await User.findOne({ email: email })
  if (userEMail) {
    return res.status(403).json({ err: "Already exist" })
  }
  const userName = await User.findOne({ username: username })
  if (userName) {
    return res.status(403).json({ err: "Username already exist" })
  }

  const hashedPassword = await bcrypt.hash(password, 10)
  const newUserdata = { email, password: hashedPassword, firstName, lastName, username, year, month, day }
  const newUser = await User.create(newUserdata)

  const token = await getToken(email, newUser)
  const userToReturn = { ...newUser.toJSON(), token }
  delete userToReturn.password
  return res.status(200).json(userToReturn)
})

router.post('/login', async (req, res) => {
  const { value, password, } = req.body
  const user = await User.findOne({ $or: [{ email: value }, { username: value }] });
  if (!user) {
    return res.status(403).json({ err: "Invalid credentials!" })
  }
  try {
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(403).json({ err: "Invalid Password!" });
    }

    const token = await getToken(user.email, user);
    const userToReturn = { ...user.toJSON(), token };
    delete userToReturn.password;
    return res.status(200).json(userToReturn);
  } catch (error) {
    return res.status(500).json({ err: "Internal server error" });
  }
})


module.exports = router