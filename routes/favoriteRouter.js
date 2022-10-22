const express = require("express");
const cors = require("./cors");
const authenticate = require("../authenticate");
const Favorite = require("../models/favorite");

const favoriteRouter = express.Router();

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.find({ user: req.user._id })
      .populate("favorite.user")
      .populate("favorite.campsites")
      .then((favorite) => {
        res.statusCode = 200;
        res.setHeader("Cotent-Type", "application/json");
        res.json(favorite);
      })
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    //find if this user has a favorite and populate the fields
    Favorite.findOne({ user: req.user._id })
      .populate("favorite.user")
      .populate("favorite.campsites")
      .then((favorite) => {
        //if the user doesnt have favorites create user
        if (!favorite) {
          Favorite.create({ user: req.user._id })
            .then((favorite) => {
              favorite.campsites.push(...req.body);
              favorite
                .save()
                .then((favorite) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(favorite);
                })
                .catch((err) => next(err));
            })
            .catch((err) => next(err));
        } else {
          req.body.forEach((campId) => {
            if (!favorite.campsites.includes(campId._id)) {
              favorite.campsites.push(campId);
            }
          });
          favorite
            .save()
            .then((favorite) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
            .catch((err) => next(err));
        }
      })
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })

  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({ user: req.user._id })
      .then((response) => {
        if (response) {
          res.statusCode = 200;
          res.setHeader("Content-type", "application/json");
          console.log(response);
          res.json(response);
        }
        res.setHeader("Content-Type", "text/plain");
        res.end("You don't have any favorites to delete");
      })
      .catch((err) => next(err));
  });

favoriteRouter
  .route("/:campsiteId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .populate("favorite.user")
      .populate("favorite.campsites")
      .then((favorite) => {
        if (!favorite) {
          Favorite.create({ user: req.user._id, campsites: [req.params.campsiteId] })
            .then((favorite) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
            .catch((err) => next(err));
        } else {
          if (!favorite.campsites.includes(req.params.campsiteId)) {
            favorite.campsites.push(req.params.campsiteId);
          } else {
            res.setHeader("Content-Type", "text/plain");
            res.end("The campsite is already in the list of favorites");
          }
          favorite
            .save()
            .then((favorite) => {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            })
            .catch((err) => next(err));
        }
      });
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("POST operation not supported on /favorites/:campsiteId");
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites/:campsiteId");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({ user: req.user._id })
      .populate("favorite.user")
      .populate("favorite.campsites")
      .then((favorite) => {
        const newCampsitesArr = favorite.campsites.filter((favCamp) => String(favCamp) !== req.params.campsiteId);
        favorite.campsites = newCampsitesArr;
        favorite
          .save()
          .then((favorite) => {
            console.log("SAVE", favorite);
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(favorite);
          })
          .catch((err) => next(err));
      });
  });
module.exports = favoriteRouter;
//campsite id : 6353fc0bfa50d7590f536111
