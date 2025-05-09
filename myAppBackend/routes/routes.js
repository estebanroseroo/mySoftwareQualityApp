const express = require('express');
const router = express.Router();
const Symptom = require('../models/Symptom');
const Condition = require('../models/Condition');
const Recommendation = require('../models/Recommendation');

router.post('/user-input-collection', async (req, res) => {
    try {
        const { name, age, sex, symptoms } = req.body;
        const entry = new Symptom({ name, age, sex, symptoms });
        await entry.save();
        res.status(201).json(entry);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete('/user-input-collection/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSymptom = await Symptom.findByIdAndDelete(id);
        if (!deletedSymptom) {
            return res.status(404).json({ message: 'Symptom entry not found.' });
        }
        res.status(200).json({ message: 'Symptom deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/user-input-collection', async (req, res) => {
    try {
        const entries = await Symptom.find();
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/add-condition', async (req, res) => {
    try {
        const { name, symptoms } = req.body;
        if (!name || !symptoms || symptoms.length === 0) {
            return res.status(400).json({ message: 'Please provide both name and symptoms.' });
        }
        const condition = new Condition({ name, symptoms });
        await condition.save();
        res.status(201).json(condition);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/data-analysis', async (req, res) => {
    try {
        const { symptoms } = req.body;
        const conditions = await Condition.find({
            symptoms: { $in: symptoms }
        });
        if (conditions.length === 0) {
            return res.status(404).json({ message: 'No matching medical conditions found.' });
        }
        res.status(200).json({ conditions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/risk-based-recommendations', async (req, res) => {
    try {
        const { conditionId, age, sex, symptoms } = req.body;
        const condition = await Condition.findById(conditionId);
        if (!condition) {
            return res.status(404).json({ message: 'Condition not found.' });
        }
        let riskLevel = 'low';
        if ((age > 65 && sex === 'Man') || (age > 70 && sex === 'Woman') || symptoms.length > 5) {
            riskLevel = 'high';
        } else if ((age > 45 && sex === 'Man') || (age > 50 && sex === 'Woman') || symptoms.length > 3) {
            riskLevel = 'medium';
        }
        const existingRecommendation = await Recommendation.findOne({ conditionId, riskLevel });
        if (existingRecommendation) {
            return res.status(200).json({ recommendation: existingRecommendation });
        }
        let recommendations = [];
        let clinics = ["Clinic Kitchener - 28 Westmount St", "Clinic Waterloo - 395 King St"];
        if (riskLevel === 'high') {
            recommendations = [
                "Immediate visit to the nearest hospital",
                "Monitor your symptoms and get tested as soon as possible",
                "Seek emergency medical assistance if symptoms worsen"
            ];
        } else if (riskLevel === 'medium') {
            recommendations = [
                "Visit a clinic for further consultation",
                "Rest and monitor symptoms",
                "Seek medical attention if symptoms persist for more than 48 hours"
            ];
        } else {
            recommendations = [
                "Stay hydrated and rest",
                "Monitor symptoms and consult a doctor if symptoms worsen",
                "Maintain a healthy lifestyle"
            ];
            clinics = [];
        }
        const recommendation = new Recommendation({
            conditionId,
            riskLevel,
            recommendations,
            clinics,
        });
        await recommendation.save();
        res.status(200).json({ recommendation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/continuous-learning', async (req, res) => {
    try {
        const { conditionId, userId, helpful, comment } = req.body;
        const condition = await Condition.findById(conditionId);
        if (!condition) {
            return res.status(404).json({ message: 'Condition not found' });
        }
        condition.feedback.push({ userId, helpful, comment });
        await condition.save();
        res.status(200).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;