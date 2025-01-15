const Joi = require('joi');

/**
 * @description
 *  Schema to validate the request body when creating a flashcard
 *  based on the model in 'src/models/Flashcard/index.js'
 */

const flashcardSchema = Joi.object({
  question: Joi.string().required().messages({
    'any.required': 'O campo "question" é obrigatório.',
    'string.base': 'O campo "question" deve ser do tipo String.',
    'string.required': 'O campo "question" deve ser do tipo String.'
  }),
  subject: Joi.string().optional().messages({
    'string.base': 'O campo "subject" deve ser do tipo String.'
  }),
  answer: Joi.string().required().messages({
    'any.required': 'O campo "answer" é obrigatório.',
    'string.required': 'O campo "answer" é obrigatório.',
    'string.base': 'O campo "answer" deve ser do tipo String.'
  })
})
  .messages({
    'object.base':
      'Os campos obrigatórios são: question e answer; Opcional: subject.'
  })
  .unknown(false)
  .error(errors => {
    return errors.map(error => {
      const { path, code, local } = error;
      if (path.length > 1) {
        const [index, field] = path;
        if (field === 'question') {
          if (code === 'string.base') {
            error.message = `No item Flashcard[${index}], o campo "question" deve ser do tipo String.`;
          } else if (code === 'any.required') {
            error.message = `No item Flashcard[${index}], o campo "question" é obrigatório.`;
          }
        }
        if (field === 'answer') {
          if (code === 'string.base') {
            error.message = `No item Flashcard[${index}], o campo "answer" deve ser do tipo String.`;
          } else if (code === 'any.required') {
            error.message = `No item Flashcard[${index}], o campo "answer" é obrigatório.`;
          }
        } else if (code === 'object.unknown') {
          const unknown_field = local.key;
          error.message = `No item Flashcard[${index}], o campo desconhecido "${unknown_field}" não é permitido.`;
        }
        if (field === 'subject') {
          if (code === 'string.base') {
            error.message = `No item Flashcard[${index}], o campo "subject" deve ser do tipo String.`;
          }
        } else if (code === 'object.unknown') {
          const unknown_field = local.key;
          error.message = `No item Flashcard[${index}], o campo desconhecido "${unknown_field}" não é permitido.`;
        }
      }

      return error;
    });
  });

const flashcardSchemas = Joi.array()
  .required()
  .min(2)
  .messages({
    'array.base': 'A entrada deve ser um array de objetos.',
    'array.min': 'O array deve conter pelo menos dois itens.'
  })
  .items(flashcardSchema);

module.exports = Joi.alternatives()
  .try(flashcardSchema, flashcardSchemas)
  .error(errors => {
    const message = errors[0].local.message;
    errors[0].message = message;

    return errors;
  });
