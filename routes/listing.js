const express = require("express");
const router = express();

const wrapAsync = require("../utils/wrapAsync.js");

const Listing = require('../models/listing.js');

const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");

const listingController = require("../controllers/listings.js");

const multer  = require('multer');
const{storage} = require("../cloudConfig.js");
const upload = multer({storage});

//New route
router.get("/new", isLoggedIn, listingController.renderNewForm); //we move it up above all because the bellow id route will treat the new address as id and search in db

router
    .route("/")
    //Index route
    .get(wrapAsync(listingController.index))
    // create route
    .post(isLoggedIn, upload.single("listing[image]"), wrapAsync(listingController.createListing));
    // .post(upload.single("listing[image][url]"), (req, res) => {
    //     res.send(req.file);
    // }); 

router
    .route("/:id")
    //Show route
    .get(wrapAsync(listingController.showListing))
    //Update route
    .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))
    //Delete route
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing)); 

//Edit route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;