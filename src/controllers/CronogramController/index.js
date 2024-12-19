const Cronograma = require('../../models/Cronogram');
const {
  requiredDataValidationHandler,
  userIdValidationHandler
} = require('./validationHandler');
/**
 * This function creates a cronogram
 *
 * @param {*} req
 * @param {*} res
 *
 * @returns response. status(code).json(body)
 * code: 201
 * body: {
 *  cronograma: cronograma <Cronograma>
 * }
 *
 * code: 400
 * body: {
 *  error: "Os seguintes campos estão ausentes ou inválidos: [title, startDate, endDate]"
 * }
 *
 * code: 422
 * body: {
 *  error: "UserId inválido."
 * }
 *
 * code: 500
 * body: {
 *  error: "Erro ao criar cronograma. Erro interno do servidor"
 * }
 *
 */

const createController = async (req, res) => {
  try {
    const cronogramData = req.body;

    // Required fields validation
    const { title, startDate, endDate, userId } = cronogramData;
    const requiredFields = {
      title,
      startDate,
      endDate
    };

    // Required data validation
    const dataValidation = requiredDataValidationHandler(requiredFields);
    if (dataValidation.error) {
      return res.status(400).json({
        error: 'Erro de validação:' + dataValidation.error
      });
    }

    // UserId Validation
    const userIdValidation = userIdValidationHandler(userId);
    if (userIdValidation.error) {
      return res.status(422).json({
        error: 'Erro de validação: UserId inválido.'
      });
    }

    // Creates cronogram
    const cronogram = await createService(cronogramData);

    return res.status(201).json({
      cronograma: cronogram
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ error: 'Erro ao criar cronograma. Erro interno do servidor' });
  }
};

module.exports = { createController };

// Services

async function createService(cronogramData) {
  return Cronograma.create(cronogramData);
}
/*
async function FindByIdService(cronogramaId) {
  return Cronograma.findById(cronogramaId);
}

async function FindAllService() {
  return Cronograma.find();
}

async function FindByUserIdService(userId) {
  return Cronograma.find({ userId });
}

async function UpdateService(cronogramaId, cronogramData) {
  return Cronograma.findByIdAndUpdate(cronogramaId, cronogramData, {
    new: true
  });
}

async function DeleteService(cronogramaId) {
  return Cronograma.findByIdAndDelete(cronogramaId);
}
*/
