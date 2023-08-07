const express = require("express");
const cors = require("cors");
const fs = require("fs");
const { mongoose, models } = require("mongoose");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const UserModel = require("./Schema/User");
const CredentialsModel = require("./Schema/Credentials");
const app = express();
const port=8080;
const MONGO_URL="mongodb+srv://kittusingh:kittusingh@formcluster.krqceuk.mongodb.net/";
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    credentials: true,
  })
);
const jwtSecretKey = "verySecretKey";
const generatePassword = async (password) => {
  const salt = await bcrypt.genSalt();
  return await bcrypt.hash(password, salt);
};
app.post("/register", async (req, res) => {
  await mongoose.connect(MONGO_URL);
  const name = req.body.name;
  const password = req.body.password;
  const email = req.body.email;
  try {
    if (email && password && name) {
      const CredentialsDoc = await CredentialsModel.create({
        email,
        password: await generatePassword(password),
      });
      if (CredentialsDoc) {
        const UserDoc = await UserModel.create({
          userId: CredentialsDoc.id,
          email,
          name,
        });
        return res.status(200).json({
          Credentials: {
            id: CredentialsDoc.id,
            email: CredentialsDoc.email,
            passowrd: CredentialsDoc.password,
          },
          User: {
            userId: UserDoc.userId,
            name: UserDoc.name,
            email: UserDoc.email,
          },
        });
      }
    }
  } catch (err) {
    console.log(err);
    return res.status(200).json("Server Error");
  }
});
maxAge = 24 * 60 * 60;
app.post("/login", async (req, res) => {
  console.log("received");
  await mongoose.connect(MONGO_URL);
  const email = req.body.email;
  const password = req.body.password;
  try {
    if (email && password) {
      const CredentialsDoc = await CredentialsModel.findOne({ email });
      console.log(`email found - ${email}`);
      if (CredentialsDoc) {
        const passwordOK = await bcrypt.compare(
          password,
          CredentialsDoc.password
        );
        if (passwordOK) {
          const UserDoc = await UserModel.findOne({ email });
          //console.log(UserDoc);
          jwtData = {
            email: CredentialsDoc.email,
            id: UserDoc.userId,
          };
          //console.log(jwtData);
          const token = jwt.sign(jwtData, jwtSecretKey);
          setToken = () => {
            res.cookie("token", token).json(UserDoc);
          };

          setToken();
          res.status(200);
          //console.log(token);
        }
        else{
            res.status(200).json("wrong password");
        }
      }
      else{
        res.status(200).json("wrong email");
      }
    }
  } catch(error) {
    console.log(error);
    res.status(400).json("Server Error");
  }
});

app.get("/checkuser", async (req, res) => {
    await mongoose.connect(MONGO_URL);
    const { token } = req.cookies;
    if (token) {
      tokenData = jwt.verify(token, jwtSecretKey);
      //console.log(tokenData.email)
      const tokenEmail = tokenData.email;
      //console.log(tokenEmail)
      const UserData = await UserModel.findOne({ email: tokenEmail });
      res.status(200).json(UserData);
    } else {
      res.json(null);
    }
  });
app.get("/profiledata", async (req, res) => {
    await mongoose.connect(MONGO_URL);
    const { token } = req.cookies;
    if (token) {
      tokenData = jwt.verify(token, jwtSecretKey);
      //console.log(tokenData.email)
      const tokenEmail = tokenData.email;
      //console.log(tokenEmail)
      const UserData = await UserModel.findOne({ email: tokenEmail });
      res.status(200).send(UserData);
    } else {
      res.json(null);
    }
  });

app.post("/logout", (req, res) => {
    res.cookie("token", "").json(true);
  });

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
  