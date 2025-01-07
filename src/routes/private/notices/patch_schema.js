const Joi = require('joi');

module.exports = Joi.object({
  title: Joi
    .string()
    .messages({
      'string.base': 'Campo "title" deve ser do tipo String.',
    }),
  description: Joi
    .string()
    .messages({
      'string.base': 'Campo "description" deve ser do tipo String.',
    }),
  datePublished: Joi
    .string()
    .isoDate()
    .messages({
      'string.base': 'Campo "datePublished" deve ser do tipo String.',
      'string.isoDate': 'O valor do campo "datePublished" deve estar no formato AAA-MM-DD'
    }),
  link: Joi
    .string()
    .uri()
    .messages({
      'string.base': 'Campo "link" deve ser do tipo String.',
      'string.uri': 'Campo "link" deve ser um link válido.',
    })
})
.required()
.or('title', 'description', 'datePublished', 'link')
.messages({
  'object.missing': 'Pelo menos um dos campos "title", "description", "datePublished" ou "link" deve ser providenciado.'
})
.unknown(false)
.error((errors) => {
  for (const error of errors) {
    if (error.code === 'object.unknown') {
      const unknown_field = error.local.key;
      error.message = `O campo desconhecido "${unknown_field}" não é permitido.`;
    }
  }
  return errors;
})