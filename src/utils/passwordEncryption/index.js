const bcrypt = require('bcrypt');

/**
 * Function to encrypt (hash) a password.
 *
 * @async
 * @function encrypt
 * @param {string} password - The plaintext password to be encrypted.
 * @returns {Promise<string>} Returns a string representing the hashed password.
 * @throws {Error} Throws an error if there is a problem during encryption.
 */
const encrypt = async (password) => {
  try {
    return await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS));
  } catch (error) {
    throw new Error(`Erro ao criptografar a senha: ${error.message}`);
  }
};

/**
 * Function to compare a plaintext password with a hashed password.
 *
 * @async
 * @function compare
 * @param {string} password - The plaintext password to be compared.
 * @param {string} hashed_password - The hashed password used for comparison.
 * @returns {Promise<boolean>} Returns `true` if the passwords match; otherwise, returns `false`.
 * @throws {Error} Throws an error if there is a problem during comparison.
 */
const compare = async (password, hashed_password) => {
  try {
    return await bcrypt.compare(password, hashed_password);
  } catch (error) {
    throw new Error(`Erro ao comparar a senha: ${error.message}`);
  }
};

module.exports = {
  encrypt,
  compare,
};
