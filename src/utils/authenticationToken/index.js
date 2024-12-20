const jwt = require('jsonwebtoken');

/**
 * Error thrown when a provided JWT is malformed.
 */
class InvalidTokenError extends Error {
  constructor() {
    super('The token provided is Invalid.');
  }
}

/**
 * Error thrown when a provided JWT is expired.
 */
class ExpiredTokenError extends Error {
  constructor() {
    super('The token provided has expired.')
  }
}

/**
 * Generates a JWT with the given payload.
 * @param {Object} payload - The payload to encode into the JWT.
 * @returns {string} - The signed JWT.
 */
const generate = (payload) => {
  return jwt.sign(
    payload,
    process.env.ACCESS_TOKEN_SECRET,
    { 
      expiresIn: process.env.ACCESS_TOKEN_TIME_EXPIRATION
    }
  );
};

/**
 * Verifies a JWT and decodes its payload.
 * @param {string} token - The JWT to verify.
 * @throws {InvalidTokenError} - If the token is invalid.
 * @returns {Object} - The decoded payload from the verified JWT.
 */
const verify = (token) => {
  let payload;
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
    if (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new ExpiredTokenError();
      }
      else if (err instanceof jwt.JsonWebTokenError) {
        throw new InvalidTokenError();
      }
      
      throw err;
    }

    payload = data;
  });

  return payload;
};

module.exports = {
  verify,
  generate,
  errors: {
    InvalidTokenError,
    ExpiredTokenError
  }
};
