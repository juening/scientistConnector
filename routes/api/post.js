const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const passport = require("passport");

const validatePostInput = require("../../validation/post");

const Post = require("../../models/Post");

// @route GET api/posts
// @desc read all posts
// @access Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ nopostsfound: "No posts found." }));
});

// @route GET api/posts/:id
// @desc get a single post by id
// @access public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(post => res.json(post))
    .catch(err => res.status(404).json({ nopostfound: "No post found." }));
});

//@route POST api/posts
//@desc Crate Post
//@access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });

    newPost
      .save()
      .then(post => res.json(post))
      .catch(err => res.status(400).json(err));
  }
);

// @route delete api/posts/:id
// @desc delete a post
// @access private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findOneAndRemove({ user: req.user.id, _id: req.params.id })
      .then(post => {
        if (post) return res.status(200).json({ post });
        res.status(404).json({ nopostfound: "Post not found." });
      })
      .catch(err =>
        res.status(404).json({ nopostfound: "Post not found for this user." })
      );
  }
);

// @route POST api/posts/like/:id
// @Like post
// @access private
router.post(
  "/like/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        if (!post) res.status(400).json({ postnotfound: "Post not found." });
        if (
          post.likes.map(item => item.user.toString()).indexOf(req.user.id) < 0
        ) {
          post.likes.push({ user: req.user.id });
          post
            .save()
            .then(post => res.json(post))
            .catch(err => res.status(400).json(err));
        } else {
          return res
            .status(400)
            .json({ alreadylike: "User already liked this post." });
        }
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route POST /api/posts/unlike/:id
// @ dislike a posts that already liked
// @access private
router.post(
  "/unlike/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.id)
      .then(post => {
        //console.log(post);
        if (post) {
          const likesCopy = [...post.likes];
          post.likes = likesCopy.filter(
            item => item.user.toString() !== req.user.id
          );
          post
            .save()
            .then(post => res.json(post))
            .catch(err => res.status(400).json(err));
        } else {
          res
            .status(404)
            .json({ likenotfound: "Like not found for this user." });
        }
      })
      .catch(err => {
        return res.status(404).json({ postnotfound: "Post not found." });
      });
  }
);

// @route POST api/posts/comment/:id
// @add a comment to a post
// @access private
router.post(
  "/comment/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
      .then(post => {
        const newComment = {
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar,
          user: req.user.id
        };

        //add to the comments array
        post.comments.unshift(newComment);

        //save
        post
          .save()
          .then(comment => res.json(comment))
          .catch(err =>
            res.status(400).json({ commentnotsave: "Comment cannot be saved." })
          );
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route DELETE api/posts/comment/:post_id/:comment_id
// @delete a comment to a post
// @access private
router.delete(
  "/comment/:post_id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.post_id)
      .then(post => {
        //check if the comment exists
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.comment_id
          ).length > 0
        ) {
          const removeIndex = post.comments
            .map(item => item._id.toString())
            .indexOf(req.params.comment_id);

          //delete the comment
          post.comments.splice(removeIndex, 1);
          post
            .save()
            .then(post => res.json(post))
            .catch(err =>
              res
                .status(400)
                .json({ commentnotdelete: "Comments cannot be deleted." })
            );
        } else {
          // console.log("called ", removeIndex);
          return res
            .status(404)
            .json({ commentnotfound: "Comment not found." });
        }
      })
      .catch(err => res.status(404).json(err));
  }
);

//@route  get /api/posts/test
//@desc   Tests post route
//@access Public
router.get("/test", (req, res) => {
  res.json({ msg: "Posts works" });
});

module.exports = router;
