const { Notice } = require('../../models');

/**
 * Registers a new notice.
 *
 * This function handles notice registration by validating the provided title, description,
 * link and publishedDate and storing data in the database.
 *
 * @param {Object} req - The Express request object, containing the notice's data in `req.body`.
 * @param {Object} res - The Express response object, used to send the response.
 *
 * @returns {Promise<void>} Sends an HTTP response with the appropriate status code:
 * - 201: Successfully created the notice, returning the notice's ID.
 * - 500: Unexpected server error.
 */
const registerNotice = async (req, res) => {
  try {
    // Create a shallow copy of the notice's data from the request body.
    // This avoids mutating the original `req.body` directly.
    const payload = { ...req.body };

    // Create the new user in the database
    const notice_created = await Notice.create(payload);

    return res
      .status(201)
      .json(notice_created);
  } catch (error) {
    console.error('Unexpected Error: ', error);

    return res
      .status(500)
      .json({
        error: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
      });
  }
};

/**
 * Get a list of notices from an authenticated user
 *
 * @param {Object} req - The Express request object, containing the authenticated user payload
 * @param {Object} res - The Express response object, used to send the response. 
 *
 * @returns {Promise<void>} Sends an HTTP response with the appropriate status code:
 * - 200:  Notices successfuly returned
 * - 500: Unexpected server error.
 */
const fetchNotices = async (req, res) => {
  try {
    const notices = await Notice.find();

    return res
      .status(200)
      .json(notices || []);
  } catch (error) {
    console.error('Unexpected Error: ', error);

    return res
      .status(500)
      .json({
        error: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
      });
  }
}

/**
 * Get a notice that matches a provided id and that should belong to the authenticated user
 *
 * @param {Object} req - The Express request object, containing the noticeId on the params attribute and also the authenticated user payload
 * @param {Object} res - The Express response object, used to send the response.
 *
 * @returns {Promise<void>} Sends an HTTP response with the appropriate status code:
 * - 200:  Notices successfuly returned
 * - 404: When the notice is not found
 * - 500: Unexpected server error.
 */
const fetchNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.noticeId);

    if (!notice) {
      return res
        .status(404)
        .json({
          error: 'Edital não encontrado.'
        });
    }
  
    return res
      .status(200)
      .json(notice);
  } catch (error) {
    console.error('Unexpected Error: ', error);

    return res
      .status(500)
      .json({
        error: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
      });
  }
}

/**
 * Fully updates a notice that matches a provided id and that should belong to the authenticated user
 *
 * @param {Object} req - The Express request object, containing the noticeId on the params attribute, the body request payload containing the details and also the authenticated user payload
 * @param {Object} res - The Express response object, used to send the response.
 *
 * @returns {Promise<void>} Sends an HTTP response with the appropriate status code:
 * - 204:  Notices successfuly updated
 * - 404: When the notice is not found
 * - 500: Unexpected server error.
 */
const updateNotice = async (req, res) => {
  try {
    const id = req.params.noticeId;

    let notice = await Notice.findById(id);

    if (!notice) {
      return res
        .status(404)
        .json({
          error: 'Edital não encontrado.'
        });
    }

    const payload = req.body;
    payload.updatedAt = Date.now();

    await Notice.updateOne({ _id: id }, payload);

    return res
      .status(204)
      .send();

  } catch (error) {
    console.error('Unexpected Error: ', error);

    return res
      .status(500)
      .json({
        error: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
      });
  }
}

/**
 * Partially updates a notice that matches a provided id and that should belong to the authenticated user
 *
 * @param {Object} req - The Express request object, containing the noticeId on the params attribute, the body request payload containing the details and also the authenticated user payload
 * @param {Object} res - The Express response object, used to send the response.
 *
 * @returns {Promise<void>} Sends an HTTP response with the appropriate status code:
 * - 204:  Notices successfuly patched
 * - 404: When the notice is not found
 * - 500: Unexpected server error.
 */
const patchNotice = async (req, res) => {
  try {
    const id = req.params.noticeId;

    let notice = await Notice.findById(id);

    if (!notice) {
      return res
        .status(404)
        .json({
          error: 'Edital não encontrado.'
        });
    }

    const payload = req.body;
    payload.updatedAt = Date.now();

    await Notice.updateOne({ _id: id }, payload);

    return res
      .status(204)
      .send();

  } catch (error) {
    console.error('Unexpected Error: ', error);

    return res
      .status(500)
      .json({
        error: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
      });
  }
}

/**
 * Deletes a notice that matches a provided id and that should belong to the authenticated user
 *
 * @param {Object} req - The Express request object, containing the noticeId on the params attribute and also the authenticated user payload
 * @param {Object} res - The Express response object, used to send the response.
 *
 * @returns {Promise<void>} Sends an HTTP response with the appropriate status code:
 * - 204:  Notices successfuly deleted
 * - 404: When the notice is not found
 * - 500: Unexpected server error.
 */
const deleteNotice = async (req, res) => {
  try {
    const id = req.params.noticeId;

    let notice = await Notice.findById(id);

    if (!notice) {
      return res
        .status(404)
        .json({
          error: 'Edital não encontrado.'
        });
    }

    await Notice.deleteOne({ _id: id });

    return res
      .status(204)
      .send();

  } catch (error) {
    console.error('Unexpected Error: ', error);

    return res
      .status(500)
      .json({
        error: 'Ocorreu um erro inesperado. Tente novamente mais tarde.'
      });
  }
}

module.exports = {
  fetchNotice,
  patchNotice,
  deleteNotice,
  fetchNotices,
  updateNotice,
  registerNotice,
}