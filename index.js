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
  req.headers.authorization =
    req.headers.authorization ||
    res.getHeader("authorization") ||
    req.query.token;
  next();
}

//auth middleware
function auth(req, res, next) {
  fs.readFile(config.token_path, (err, data) => {
    if (err) {
      return res.status(500).json("Server error");
    }
    const token = JSON.parse(data);
    if (!token.includes(req.headers.authorization)) {
      return res.status(401).json("Unauthorized");
    }
    next();
  });
}


function output(req, res) {
  res.json("Hello World!");
}
function create_token(req, res, next) {
  const token = crypto.randomBytes(16).toString("hex");

  fs.readFile(config.token_path, (err, data) => {
    if (err) {
      return res.status(500).json("Cannot read file");
    }
    let tokens;
    try {
      tokens = JSON.parse(data);
    } catch (e) {
      tokens = [];
    }
    if (tokens.includes(token)) {
      return res.status(500).json("Token already exists");
    }
    tokens.push(token);
    fs.writeFile(config.token_path, JSON.stringify(tokens), (err) => {
      if (err) {
        return res.status(500).json("Cannot write file");
      }
      //redirect to / with the token in headers
      res.setHeader("authorization", token);
      next();
    });
  });
}


const middlewares = [setHeaders, auth, output];

app.get("/", middlewares);

app.get("/get-token", config.middlewares, create_token, middlewares);
