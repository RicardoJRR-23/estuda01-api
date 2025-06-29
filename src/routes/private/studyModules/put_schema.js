const Joi = require('joi');

module.exports = Joi.object({
  title: Joi
    .string()
    .required()
    .messages({
      'string.base': 'Campo "title" deve ser do tipo String.',
      'any.required': 'Campo "title" está em falta.'
    }),
  description: Joi
    .string()
    .required()
    .messages({
      'string.base': 'Campo "description" deve ser do tipo String.',
      'any.required': 'Campo "description" está em falta.'
    }),
  topics: Joi
  	.array()
  	.items(Joi
    	.object({
    		name: Joi
      		.string(),
    		content: Joi
      		.string(),
    	})
      .unknown(false)
    )
    .required()
  	.messages({
      'array.base': 'Campo "topics" deve ser do tipo Array/List.',
      'any.required': 'Campo "topics" está em falta.'
    })
  })
  .required()
  .unknown(false)
  .error((errors) => {
    for (const error of errors) {
      if (error.path[0] === 'topics' && typeof error.path[1] === 'number') {
        switch (error.code) {
          case 'string.base':
          	error.message = `No item topics[${error.path[1]}] o attributo "${error.path[2]}" deve ser do tipo String.`;
            break;
          case 'object.base':
          	error.message = `O item topics[${error.path[1]}] deve ser do tipo Object`;
            break;
          case 'object.unknown':
        		error.message = `No item topics[${error.path[1]}], o attributo desconhecido "${error.local.key}" não é permetido.`;
            break;
          default:
        }
      }  
      else if (error.code === 'object.unknown') {
        const unknown_field = error.local.key;
        error.message = `O campo desconhecido "${unknown_field}" não é permitido.`;
      }
     
    }
    return errors;
  })