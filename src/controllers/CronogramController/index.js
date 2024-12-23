const { Cronograma } = require('../../models');
/**
 * @description
 *  This function creates a cronogram
 *
 * @param {Object} req - The request object, containing the form data in `req.body`.
 * @param {Object} res - The response object, used to send the response.
 *
 * @returns response. status(code).json(body)
 *  code: 201
 *    body: {
 *      cronograma: cronograma <Cronograma>
 *    }
 *
 *  code: 500
 *    body: {
 *      error: "Erro ao criar cronograma. Erro interno do servidor"
 *    }
 *
 */

const createController = async (req, res) => {
  try {
    // Gets the cronogram data from the request body, which was validated by the middleware
    // see src/routes/private/cronogram/cronogram_form_schema.js
    const cronogram_data = req.body;

    // Creates cronogram
    const cronogram = await createService(cronogram_data);

    //Everything went well, it returns the created cronogram
    return res.status(201).json({
      cronograma: cronogram
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Erro ao criar cronograma. Erro interno do servidor'
    });
  }
};

module.exports = { createController };

// Services

async function createService(cronogram_data) {
  return Cronograma.create(cronogram_data);
}

//TODO Implement the other services for future controllers to make
/*
async function FindByIdService(cronograma_id) {
  return Cronograma.findById(cronograma_id);
}

async function FindAllService() {
  return Cronograma.find();
}

async function FindByUserIdService(user_id) {
  return Cronograma.find({ userId:user_id });
}

async function UpdateService(cronograma_id, cronogram_data) {
  return Cronograma.findByIdAndUpdate(cronograma_id, cronogram_data, {
    new: true
  });
}

async function DeleteService(cronograma_id) {
  return Cronograma.findByIdAndDelete(cronograma_id);
}
*/
