// const http = require("http");
import http from "http";
// const gfName = require("./Features")
// import gfName from "./Features.js";
// import { gfName2 } from "./Features.js";
// console.log(gfName2)
// console.log(gfName)
// import fs from "fs"
// import path from "path";
// console.log(path.extname("/home/random/indx.html"))
// const home = fs.readFileSync("./index.html")

// import { sum } from "./Features.js";

// const server = http.createServer((req,res) => {
//    if (req.url === "/") {
//     res.end(home)
//    }
//    if (req.url === "/about") {
//     res.end(`<h1>hello ${sum() }</h1>`)
//    }

// });

// server.listen(5000, () => {
//   console.log("server running");
// });

import express from "express";
import path from "path";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import Jwt from "jsonwebtoken";
import bcrypt from "bcrypt"
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(path.resolve(), "public")));
app.use(cookieParser());
mongoose
  .connect("mongodb://127.0.0.1:27017", {
    dbName: "backend",
  })
  .then((c) => console.log("dataBase Connected"))
  .catch((e) => console.log(e));
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
});
const User = mongoose.model("user", UserSchema);
app.set("view engine", "ejs");

const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;
  if (token) {
    const decode = Jwt.verify(token, "secrete");
    req.user = await User.findById(decode._id);
    next();
  } else {
    res.redirect("/login");
  }
};

app.get("/", isAuthenticated, (req, res) => {
  res.render("logout", { name: req.user.name });
});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ email });
  if (!user) return res.redirect("/register");

  const isMatch = await bcrypt.compare(password,user.password)
  if (!isMatch) {
    return res.render("login", { email, message: "incorrect password" });
  }
  const token = Jwt.sign({ _id: user._id }, "secrete");
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  let user = await User.findOne({ email });
  if (user) {
    return res.redirect("/login");
  }
  const hashPassword = await bcrypt.hash(password,10)

  user = await User.create({
    name,
    email,
    password:hashPassword,
  });
  const token = Jwt.sign({ _id: user._id }, "secrete");
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 1000),
  });
  res.redirect("/");
});
app.get("/logout", (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.redirect("/");
});

// app.get("/success",(req,res)=>{
// res.render("success")
// res.send("index")
// })
// app.post("/contect", async(req,res)=>{

// await Message.create({name : req.body.name , email : req.body.email})
//     res.redirect("/success")

// })

// app.get("/users",(req,res) =>{
// res.json({
//     users,
// })
// })
app.listen(5000, () => {
  console.log("server iS Working");
});
