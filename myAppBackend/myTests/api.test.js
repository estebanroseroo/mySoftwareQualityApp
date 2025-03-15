require('dotenv').config();
const request = require('supertest');
const express = require('express');
const connectDB = require('../config/db');
const routes = require('../routes/routes');

const app = express();
app.use(express.json());
app.use('/api/myApp', routes);

const PORT = 5001;
let server;

beforeAll(async () => {
    await connectDB();
    server = app.listen(PORT);
});

afterAll(async () => {
    await server.close();
});

describe('POST /api/myApp/user-input-collection', () => {
    it('should create a new symptom entry', async () => {
        const response = await request(app)
            .post('/api/myApp/user-input-collection')
            .send({
                name: "John Doe",
                age: 30,
                sex: "Male",
                symptoms: ["fever", "cough"]
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('_id');
        expect(response.body.name).toBe("John Doe");
    });
});

describe('GET /api/myApp/user-input-collection', () => {
    it('should return an array of symptom entries', async () => {
        const response = await request(app).get('/api/myApp/user-input-collection');
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
    });
});

describe('POST /api/myApp/add-condition', () => {
    it('should add a new medical condition', async () => {
        const response = await request(app)
            .post('/api/myApp/add-condition')
            .send({
                name: "Flu",
                symptoms: ["fever", "cough", "sore throat"]
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('_id');
        expect(response.body.name).toBe("Flu");
    });
});

describe('POST /api/myApp/data-analysis', () => {
    it('should return matching medical conditions based on symptoms', async () => {
        const response = await request(app)
            .post('/api/myApp/data-analysis')
            .send({
                symptoms: ["fever", "cough"]
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('conditions');
        expect(Array.isArray(response.body.conditions)).toBe(true);
    });
});

describe('POST /api/myApp/risk-based-recommendations', () => {
    it('should return recommendations based on condition, age, and symptoms', async () => {
        const conditionResponse = await request(app)
            .post('/api/myApp/add-condition')
            .send({ name: "Cold", symptoms: ["runny nose", "sneezing"] });

        const conditionId = conditionResponse.body._id;

        const response = await request(app)
            .post('/api/myApp/risk-based-recommendations')
            .send({
                conditionId,
                age: 65,
                symptoms: ["runny nose", "sneezing"]
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('recommendation');
        expect(response.body.recommendation.riskLevel).toBe('high');
    });
});
