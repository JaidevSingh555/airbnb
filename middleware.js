const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js");
const Listing = require('./models/listing');
const Review = require('./models/review');


module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.redirectUrl = req.originalUrl; //we cannot directly use redirectUrl because passport reset req.session on new entry therefor we use locals in middleware to save the redirect value just before the reset is triggered 
        req.flash("error", "You must be loggedIn!");
        return res.redirect("/login");
    }
    next()
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl  = req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if (!listing.owner.equals(res.locals.currUser.id)) {
        req.flash("error", "You dont't have permission");
        return res.redirect(`/listings/${id}`);
    }
    next();
};

module.exports.validateListing = async (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};

module.exports.validateReview = async (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error) {
        let errMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
};

module.exports.isReviewAuthor = async (req, res, next) => {
    let {id, reviewId} = req.params; // varaibles need to match the exact name of the path for params to function
    let review = await Review.findById(reviewId);
    if (!review.author.equals(res.locals.currUser.id)) {
        req.flash("error", "You dont't have permission to delete this review");
        return res.redirect(`/listings/${id}`);
    }
    next();
};
