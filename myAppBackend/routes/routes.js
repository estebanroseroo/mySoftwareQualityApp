const express = require('express');
const router = express.Router();
const Symptom = require('../models/Symptom');
const Condition = require('../models/Condition');

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

router.get('/user-input-collection', async (req, res) => {
    try {
        const entries = await Symptom.find();
        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/data-analysis', async (req, res) => {
    try {
        const { symptoms } = req.body;
        const conditions = await MedicalCondition.find({
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

module.exports = router;