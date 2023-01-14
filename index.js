const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const config = require("./config");
const fs = require("fs");

const crypto = require("crypto");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(config.port, () => {
  console.clear();

  console.log(`Server listening on port http://localhost:${config.port}`);
});

//set headers
function setHeaders(req, res, next) {
  req.headers.authorization = req.headers.authorization || req.query.token;
  next();
}

//auth middleware
function auth(req, res, next) {
  fs.readFile("./auth/token.json", (err, data) => {
    if (err) {
      return res.status(500).json("Server error");
    }
    const token = JSON.parse(data);
    if (!token.includes(req.headers.authorization)) {
      console.log(req.headers.authorization);
      return res.status(401).json("Unauthorized");
    }

    next();
  });
}

app.get("/", [setHeaders, auth], (req, res) => {
  res.json("Hello World!");
});

app.get("/get-token", (req, res) => {
    const token = crypto.randomBytes(16).toString("hex");
    storeToken(token, res);
});
function storeToken(token, res) {
    fs.readFile("./auth/token.json", (err, data) => {
      if (err) {
        return res.status(500).json("Server error");
      }
      const tokens = JSON.parse(data);
      if (tokens.includes(token)) {
        return res.status(500).json("Server error");
      }
      tokens.push(token);
      fs.writeFile("./auth/token.json", JSON.stringify(tokens), (err) => {
        if (err) {
          return res.status(500).json("Server error");
        }
        res.redirect(`/?token=${token}`);
      });
    });
    
}

