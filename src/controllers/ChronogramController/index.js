const { Chronogram } = require('../../models');
/**
 * @description
 *  This function creates a chronogram
 *
 * @param {Object} req - The request object, containing the form data in `req.body`.
 * @param {Object} res - The response object, used to send the response.
 *
 * @returns response. status(code).json(body)
 *  code: 201
 *    body: {
 *      chronograma: chronograma <Chronograma>
 *    }
 *
 *  code: 500
 *    body: {
 *      error: "Erro ao criar chronogram. Erro interno do servidor"
 *    }
 *
 */

const createController = async (req, res) => {
  try {
    // Gets the chronogram data from the request body, which was validated by the middleware
    // see src/routes/private/chronogram/chronogram_form_schema.js
    const chronogram_data = {...req.body, userId: req.user.id};

    // Creates chronogram
    const chronogram = await createService(chronogram_data);

    //Everything went well, it returns the created chronogram
    return res.status(201).json(chronogram);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Erro ao criar cronograma. Erro interno do servidor'
    });
  }
};

module.exports = { createController };

// Services

async function createService(chronogram_data) {
  return Chronogram.create(chronogram_data);
}

//TODO Implement the other services for future controllers to make
/*
async function FindByIdService(chronograma_id) {
  return Chronogram.findById(chronograma_id);
}

async function FindAllService() {
  return Chronogram.find();
}

async function FindByUserIdService(user_id) {
  return Chronogram.find({ userId:user_id });
}

async function UpdateService(chronograma_id, chronogram_data) {
  return Chronogram.findByIdAndUpdate(chronograma_id, chronogram_data, {
    new: true
  });
}

async function DeleteService(chronograma_id) {
  return Chronogram.findByIdAndDelete(chronograma_id);
}
*/
