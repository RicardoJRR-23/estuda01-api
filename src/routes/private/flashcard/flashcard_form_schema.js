const Joi = require('joi');

/**
 * @description
 *  Schema to validate the request body when creating a flashcard
 *  based on the model in 'src/models/Flashcard/index.js'
 */

module.exports = Joi.object({
  question: Joi.string()
    .required()
    .messages({ 'any.required': '"Pergunta" é um campo obrigatório' }),
  subject: Joi.string(),
  answer: Joi.string()
    .required()
    .messages({ 'any.required': '"Resposta" é um campo obrigatório' }),
  userId: Joi.string().required()
})
  .required()
  .unknown(false)
  .error(errors => {
    for (const error of errors) {
      if (error.code === 'object.unknown') {
        const unknown_field = error.local.key;
        error.message = `O campo desconhecido "${unknown_field}" não é permitido.`;
      }
    }
    return errors;
  });
