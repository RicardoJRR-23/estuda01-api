const authenticationTokenUtil = require('../../utils/authenticationToken');

const AuthorizationMiddleware = async (req, res, next) => {
  try {
    const authorization = res.headers.authorization;

    if (!authorization) {
      return res
        .status(401)
        .json({
          error: ''
        });
    }
 

  } catch (error) {
    
  }
}

module.exports = AuthorizationMiddleware;