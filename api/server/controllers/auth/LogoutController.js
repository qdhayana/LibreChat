const cookies = require('cookie');
const querystring = require('querystring');
const { logoutUser } = require('~/server/services/AuthService');
const { logger } = require('~/config');

const logoutController = async (req, res) => {
  const refreshToken = req.headers.cookie ? cookies.parse(req.headers.cookie).refreshToken : null;
  try {
    const logout = await logoutUser(req.user._id, refreshToken);
    const { status } = logout;
    res.clearCookie('refreshToken');
    const returnTo = process.env.DOMAIN_SERVER + '/login';
    const logoutURL = new URL(process.env.OPENID_LOGOUT_URL);
    logoutURL.search = querystring.stringify({
      client_id: process.env.OPENID_CLIENT_ID,
      returnTo: returnTo,
    });
    return res.status(status).send({ logoutURL: logoutURL.toString() });
  } catch (err) {
    logger.error('[logoutController]', err);
    return res.status(500).json({ message: err.message });
  }
};

module.exports = {
  logoutController,
};
