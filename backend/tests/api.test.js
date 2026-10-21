process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret_for_ci';
process.env.NOTIFY_DELAY_MS = '0';

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

describe('API checks that need no database', () => {
  test('GET /tasks without a token returns 401', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toBe(401);
    expect(res.body.message).toMatch(/token/i);
  });

  test('unknown route returns a structured 404', async () => {
    const res = await request(app).get('/does-not-exist');
    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe('Not Found');
  });

  test('POST /auth/register with bad input returns 400', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ name: 'A', email: 'not-an-email', password: '123' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Validation Error');
  });

  test('POST /api/ai/generate-description without a token returns 401', async () => {
    const res = await request(app)
      .post('/api/ai/generate-description')
      .send({ title: 'Test Task' });
    expect(res.statusCode).toBe(401);
  });

  test('POST /api/ai/generate-description with missing title returns 400', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 'test_user_id', name: 'Test' }, process.env.JWT_SECRET);
    const res = await request(app)
      .post('/api/ai/generate-description')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: '' });
    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe('Validation Error');
  });

  test('POST /api/ai/generate-description handles missing API key with graceful fallback', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: 'test_user_id', name: 'Test' }, process.env.JWT_SECRET);
    const res = await request(app)
      .post('/api/ai/generate-description')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Plan database schema' });
    expect(res.statusCode).toBe(200);
    expect(res.body.fallback).toBe(true);
    expect(res.body.message).toMatch(/unavailable/i);
  });
});

// Runs only when TEST_MONGO_URI is set (CI sets it). Never point this at your real Atlas database:
// the test drops the database it connects to.
const describeWithDb = process.env.TEST_MONGO_URI ? describe : describe.skip;

describeWithDb('Full flow with MongoDB', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.TEST_MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  test('register -> login -> create task -> list tasks', async () => {
    const email = `ci_${Date.now()}@example.com`;

    const reg = await request(app).post('/auth/register').send({ name: 'CI User', email, password: 'secret123' });
    expect(reg.statusCode).toBe(201);

    const login = await request(app).post('/auth/login').send({ email, password: 'secret123' });
    expect(login.statusCode).toBe(200);
    const token = login.body.token;

    const created = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'Write CI test' });
    expect(created.statusCode).toBe(201);

    const list = await request(app).get('/tasks').set('Authorization', `Bearer ${token}`);
    expect(list.statusCode).toBe(200);
    expect(list.body).toHaveLength(1);
    expect(list.body[0].title).toBe('Write CI test');
  });
});
