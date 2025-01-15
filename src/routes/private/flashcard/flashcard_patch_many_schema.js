const Joi = require('joi');

/**
 * @description
 *  Schema to validate the request body when creating a flashcard
 *  based on the model in 'src/models/Flashcard/index.js'
 */

const flashcardSchema = Joi.object({
  question: Joi.string().optional().messages({
    'string.base': 'O campo "question" deve ser do tipo String.'
  }),
  subject: Joi.string().optional().allow(null, '').messages({
    'string.base': 'O campo "subject" deve ser do tipo String.'
  }),
  answer: Joi.string().optional().messages({
    'string.base': 'O campo "answer" deve ser do tipo String.'
  })
})
  .messages({
    'object.base':

      'Os campos obrigatórios são: question e answer; Opcional: subject.',
    'object.missing':
      'Pelo menos um dos campos "question", "answer" ou "subject" deve ser preenchido.'
  })
  .or('question', 'answer', 'subject')
  .unknown(false)
  .error(errors => {
    return errors.map(error => {
      const { path, code, local } = error;
      if (path.length > 1) {
        const [index, field] = path;
        if (field === 'question') {
          if (code === 'string.base') {
            error.message = `No item Flashcard[${index}], o campo "question" deve ser do tipo String.`;
          }
        }
        if (field === 'answer') {
          if (code === 'string.base') {
            error.message = `No item Flashcard[${index}], o campo "answer" deve ser do tipo String.`;
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
