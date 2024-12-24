const mongoose = require('mongoose');

/**
 * @example:
 *    title: My Chronogram
 *    description: This is a description of my chronogram.
 *    startDate: 2023-06-01
 *    endDate: 2023-06-30
 *    tasks:
 *      - name: Task 1
 *        completed: false
 *      - name: Task 2
 *        completed: true
 *    userId: 6762d8434bdca716d901ee84
 */

const ChronogramSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    tasks: [{ name: String, completed: Boolean }],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Chronogram', ChronogramSchema);
