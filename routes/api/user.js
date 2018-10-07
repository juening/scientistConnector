const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const keys = require("../../config/keys");

const User = require("../../models/User");

//@route  get /api/users/register
//@desc   Register User
//@access public
router.post("/register", (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email already exitsts." });
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "100", //size
        r: "pg", //rating
        d: "mm" //default
      });

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar: avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) {
            throw err;
          }
          newUser.password = hash;
          newUser
            .save()
            .then(user => res.json(user))
            .catch(err => console.log(err));
        });
      });
    }
  });
});

//@route  get /api/users/login
//@desc   Login a user/ Return a token
//@access public
router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //find the user by email
  User.findOne({ email: email }).then(user => {
    if (!user) {
      return res.status(404).json({ email: "User not found" });
    }

    //check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        //user matched

        //create jwt payload
        const payload = { id: user.id, name: user.name, avatar: user.avatar };

        //sign token
        jwt.sign(payload, keys.secretKey, { expiresIn: 7200 }, (err, token) => {
          res.json({
            success: true,
            token: "Bearer " + token
          });
        });
      } else {
        return res.status(400).json({ password: "Pawword does not match!" });
      }
    });
  });
});

//@route  get /api/users/current
//@desc   return the current user
//@access Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.json({ name: req.user.name, id: req.user.id, email: req.user.email });
  }
);

//@route  get /api/users/test
//@desc   Tests post route
//@access Public
router.get("/test", (req, res) => {
  res.json({ msg: "Users works" });
});

module.exports = router;
