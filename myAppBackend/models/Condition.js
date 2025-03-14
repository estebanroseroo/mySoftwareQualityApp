const mongoose = require('mongoose');

const conditionSchema = new mongoose.Schema({
    name: { type: String, required: true },
    symptoms: { type: [String], required: true },
    feedback: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            helpful: { type: Boolean },
            comment: { type: String }
        }
    ],
}, { timestamps: true });

module.exports = mongoose.model('Condition', conditionSchema);