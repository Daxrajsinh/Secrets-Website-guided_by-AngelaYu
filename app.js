require('dotenv').config()    //    KEEP THIS LINE AS EARLY AS POSSIBLE IN CODE.
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');
const encrypt = require("mongoose-encryption");

const app = express();

console.log(process.env.API_KEY);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/userDB");

const userSchema = new mongoose.Schema ({
    email : String,
    password : String
})

 // THIS SHOULD NOT BE HERE, EVEN IN THE FORM OF COMMENT BUT STILL KEEPING THIS INORDER TO UNDERSTAND LATER
 //.ENV FILE IS USED TO KEEP THIS SECRET CODE SAFE
// const secret = "This is our little secret string."
userSchema.plugin(encrypt, {secret: process.env.SECRET, encryptedFields: ["password"]}); //TO encrypt only password not username.

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
        password: req.body.password
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
    const password = req.body.password;

    User.findOne({email: username})
    .then((foundUser)=>{
        if(foundUser.password === password) {
            res.render("secrets");
        }
    })
    .catch((err)=>{
        console.log(err);
    })
})

app.listen(3000, function() {
  console.log("Server started on port 3000");
});