const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
    conditionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Condition', required: true },
    riskLevel: { type: String, enum: ['low', 'medium', 'high'], required: true },
    recommendations: { type: [String], required: true },
    clinics: { type: [String], required: true },
}, { timestamps: true });

module.exports = mongoose.model('Recommendation', recommendationSchema);