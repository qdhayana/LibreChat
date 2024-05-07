const cookies = require('cookie');
const querystring = require("querystring");
const { logoutUser } = require('~/server/services/AuthService');
const { logger } = require('~/config');

const logoutController = async (req, res) => {
  const refreshToken = req.headers.cookie ? cookies.parse(req.headers.cookie).refreshToken : null;
  try {
    const logout = await logoutUser(req.user._id, refreshToken);
    const { status, message } = logout;
    res.clearCookie('refreshToken');

    const returnTo = req.protocol + "://" + req.hostname + "/login";
    const logoutURL = new URL(process.env.OPENID_LOGOUT_URL);
    const searchString = querystring.stringify({
      client_id: process.env.OPENID_CLIENT_ID,
      returnTo: returnTo
    });
    logoutURL.search = searchString;
    return res.status(status).send({ message, logoutURL });
  } catch (err) {
    logger.error('[logoutController]', err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  logoutController,
};
