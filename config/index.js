require("dotenv").config();

function ensureConfigInitialized(req, res, next) {
  if (!config.token_path) {
    return res.status(500).json("Token path not set");
  }
  next();
}

const config = {
  port: process.env.PORT || 3000,
  token_path: process.env.TOKEN_PATH,
  middlewares: [ensureConfigInitialized],
};

module.exports = config;
