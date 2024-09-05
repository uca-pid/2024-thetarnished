const request = require('supertest');
const app = require('../app');
const Subject = require('../models/subjectModel');

describe('Subject API', () => {

    afterAll(async () => {
        await Subject.destroy({
            where: {
                subjectname: 'Test'
            }
        });
    });

    it("Should get all subjects", async () => {
        const response = await request(app)
            .get('/subject/all-subjects');

        expect(response.status).toBe(200);
    });

    it("Should get subject by id", async () => {
        const response = await request(app)
            .get('/subject/1000884118929276929');
        expect(response.status).toBe(200);
    });

    it("Should create a subject", async () => {
        const response = await request(app)
            .post('/subject/create')
            .send({
                subjectname: "Test"
            });
        expect(response.status).toBe(200);
    });

    it("Should not create a subject if it already exists", async () => {
        const response = await request(app)
            .post('/subject/create')
            .send({
                subjectname: "Test"
            });
        expect(response.status).toBe(400);
    });

    it("Should get all subjects being dictated by teachers", async () => {
        const response = await request(app)
            .get('/subject/all-subjects-dictated');
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Subjects retrieved successfully");
    });
});