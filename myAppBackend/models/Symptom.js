const mongoose = require('mongoose');

const symptomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    sex: { type: String, required: true },
    symptoms: { type: [String], required: true },
}, { timestamps: true });

module.exports = mongoose.model('Symptom', symptomSchema);