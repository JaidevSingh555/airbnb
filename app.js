if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
// console.log(process.env.ATLASDB_URL);

const express = require("express");
const app = express();
 
const path = require("path");
app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));

const methodOverride = require("method-override");
app.use(methodOverride("_method"));

app.use(express.static(path.join(__dirname, "/public")));

const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);
 
const mongoose = require("mongoose");
// const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
const dbUrl = process.env.ATLASDB_URL;

const ExpressError = require("./utils/ExpressError.js");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");


main()
    .then(() => { 
        console.log("connected to db");
    })
    .catch((err) => {
        console.log(err);
    });
    
async function main() {
    await mongoose.connect(dbUrl);
}

const store = MongoStore.create({   //fn to define mongoose_session attributes
    mongoUrl: dbUrl,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter: 24* 3600,
});

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {   //fn to define session attributes
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7*24*60*60*1000,
        httpOnly: true,
    }
}
//route page
// app.get("/", (req,res) => {
//     res.send("hii i there");
// });
app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize()); //initialize passport as middleware
app.use(passport.session()); //keep record of the session login in moving from one page to another
passport.use(new LocalStrategy(User.authenticate())); //authentication in login and signup

passport.serializeUser(User.serializeUser()); //take in data for starting session.
passport.deserializeUser(User.deserializeUser()); //takes out data from db to close session.

app.use((req, res, next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;//notable to understand, special property of passport
    next();
});

//routes
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

//ExpressError
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found!"));
});

//Error middleware
app.use((err, req, res, next)=>{
    let { statusCode = 500, message = "someting went wrong!"} = err;
    res.status(statusCode).render("error.ejs",{message});
});

//Server connection
app.listen("3000",()=>{
    console.log("server is listening post 3000");
  });

