require('dotenv').config();
const mongoose = require('mongoose');
const Condition = require('../models/Condition');

describe('Database', () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL);
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    test('Should retrieve a condition by name', async () => {
        const condition = await Condition.findOne({ name: "Flu" });
        expect(condition).toBeDefined();
        expect(condition.name).toBe("Flu");
    });
});