//jshint esversion:6
const mongoose = require("mongoose"); //backend for mongodb
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
var sid = "AC4818444fcf353850ab8b0f6edcfa90cb";
var auth_token = "dab241de09613f87491b8da2f1c7a14a";
var phone = "+16626667521";
const client = require("twilio")(sid, auth_token);
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const sms = require("fast-two-sms");
const { forEach } = require("lodash");
const {
  VerificationCheckInstance,
} = require("twilio/lib/rest/verify/v2/service/verificationCheck");

require("dotenv").config();

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  age: Number,
  address: String,
  state: String,
  username: String,
  password: String,
});

const User = mongoose.model("User", userSchema);

app.set("view engine", "ejs");
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/hackathonDB");

app.get("/", function (req, res) {
  User.find({}, function (err, doc) {
    console.log(doc);
  });

  res.render("login");
});

app.get("/registration", function (req, res) {
  res.render("registration");
});

app.get("/home", function (req, res) {
  res.render("home");
});

app.get("/messaging", function (req, res) {
  res.render("messaging");
});

app.post("/", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;
  console.log(req.body);
  User.findOne({ username: username }, function (err, foundUser) {
    if (err) {
      console.log(err);
    } else {
      if (foundUser) {
        console.log(foundUser);
        if (foundUser.password === password) {
          res.render("messaging");
        }
      }
    }
  });
});

app.post("/messaging", async function (req, res) {
  const number = req.body.phone;
  const message = req.body.message;
  const send_all = req.body.sendAllCheck;
  console.log(req.body);
  if (send_all === "on") {
    User.find({}, function (err, docs) {
      docs.forEach(function (doc) {
        client.messages
          .create({
            body: message,
            from: phone,
            to: "+91" + doc.phone,
          })
          .then((message) => console.log(message.sid));
      });
    });
  } else {
    client.messages
      .create({
        body: message,
        from: phone,
        to: number,
      })
      .then((message) => console.log(message.sid));
  }

  res.render("messaging");
});

app.post("/registration", function (req, res) {
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const address = req.body.address;
  const state = req.body.state;

  const user = new User({
    name: name,
    email: email,
    username: username,
    phone: req.body.number[1],
    age: req.body.number[0],
    address: address,
    state: state,
    password: password,
  });

  user.save(function (err) {
    if (!err) {
      res.render("login");
    }
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = "3000";
}

app.listen(port, function () {
  console.log("Server has started sucessfully");
});
