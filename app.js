require('dotenv').config()    //    KEEP THIS LINE AS EARLY AS POSSIBLE IN CODE.
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
// const encrypt = require("mongoose-encryption");
const md5 = require("md5");
const session = require('express-session');

const app = express();

// console.log(process.env.API_KEY);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(session({
    secret: process.env.SESSION_SECRET || 'secret', // Use your own secret key or use a .env file
    resave: false,
    saveUninitialized: false
}));


mongoose.connect("mongodb://127.0.0.1:27017/userDB");

const userSchema = new mongoose.Schema ({
    email : String,
    password : String
})

 // THIS SHOULD NOT BE HERE, EVEN IN THE FORM OF COMMENT BUT STILL KEEPING THIS INORDER TO UNDERSTAND LATER
 //.ENV FILE IS USED TO KEEP THIS SECRET CODE SAFE
// const secret = "This is our little secret string."
// userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]}); //TO encrypt only password not username.

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res) {
    res.render("home");
})

app.get("/login", function(req, res) {
    res.render("login");
})

app.get("/register", function(req, res) {
    res.render("register");
})

app.post("/register", function(req, res) {
    const newUser = new User({
        email: req.body.username,
        password: md5(req.body.password)
    })

    newUser.save()
    .then(()=>{
        res.render("secrets")
    })
    .catch((err)=>{
        console.log(err);
    })
})

//Validating the user with email and password whether registered or not.
app.post("/login", function(req, res) {
    const username = req.body.username;
    const password = md5(req.body.password);

    User.findOne({email: username})
    .then((foundUser)=>{
        if(foundUser) {
            if(foundUser.password === password) {
                res.render("secrets");
            } else {
                res.render("login", { message: { field: 'password', text: 'Incorrect password' } });
            }
        } else {
            res.render("login", { message: { field: 'email', text: 'User not found' } });
        }
    })
    .catch((err)=>{
        console.log(err);
        res.render("login", { message: "An error occurred" });
    })
});

app.get("/submit", function(req, res) {
    res.render("submit");
})

app.post("/submit", function(req, res) {
    const submittedSecret = req.body.secret;
    const userId = req.session.userId; // Assuming you have stored the user's ID in the session

    User.findById(userId)
        .then((foundUser) => {
            if (foundUser) {
                foundUser.secret = submittedSecret; // Assign the submitted secret to the user's 'secret' field
                foundUser.save()
                    .then(() => {
                        res.redirect("/secrets"); // Redirect to the secrets page after successful submission
                    })
                    .catch((err) => {
                        console.log(err);
                        res.render("submit", { message: "An error occurred while submitting the secret" });
                    });
            } else {
                res.render("submit", { message: "User not found" });
            }
        })
        .catch((err) => {
            console.log(err);
            res.render("submit", { message: "An error occurred while submitting the secret" });
        });
});


app.get("/logout", function(req, res) {
    req.session.destroy(function(err) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/"); // Redirect to the home page after logout
        }
    });
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});