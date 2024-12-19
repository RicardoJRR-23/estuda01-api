const Joi = require('joi');

/**
 * requiredDataValidationHandler
 *
 * Description:
 *    This function validates the required fields, written by the user,
 *    for the creation of a new cronogram
 *
 * @param {*} requiredFields
 * @returns:
 *  - true: if the data is valid
 *  - error: if the data is invalid
 */

function requiredDataValidationHandler(requiredFields) {
  //Preparing Validation Schema

  const schema = Joi.object({
    title: Joi.string()
      .required()
      .messages({ 'any.required': '"nome" é um campo obrigatório' }),
    startDate: Joi.date().iso().required().messages({
      'date.base': '"data" deve ser uma data válida',
      'date.iso': '"data" deve estar no formato ISO 8601',
      'any.required': '"data" é um campo obrigatório'
    }),
    endDate: Joi.date().iso().required().messages({
      'date.base': '"data" deve ser uma data válida',
      'date.iso': '"data" deve estar no formato ISO 8601',
      'any.required': '"data" é um campo obrigatório'
    })
  });

  const { error } = schema.validate(requiredFields); //Validation

  if (error) {
    return { error: error.details };
  }

  return true;
}

/**
 * userIdValidationHandler
 *
 * Description:
 *   This function validates the userId field, received from the user MongoDB File,
 *
 * @param {*} userId
 * @returns:
 * - true: if the data is valid
 * - error: if the data is invalid
 */

function userIdValidationHandler(userId) {
  //Preparing Validation Schema
  const element = Joi.string().length(24).required(); //For this case, the userId must be a string with 24 characters as it is a MongoDB ObjectId

  const { error } = element.validate(userId);
  if (error) {
    return { error: error.details };
  }

  return true;
}

module.exports = { requiredDataValidationHandler, userIdValidationHandler };
