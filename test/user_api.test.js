const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')


//delete all users before starting tests
beforeAll(async () => {
    await User.deleteMany({})
})

//test adding a user to the database
test('a valid user can be added', async () => {
    console.log('adding user')
    const newUser = {
        username: 'mattiTest',
        name: 'matti Mikkola',
        password: 'imabarbiegirl'
    }

    const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(1)
})

//test adding dublicate user to the database
test('a dublicate username cannot be added', async () => {
    const newUser = {
        username: 'mattiTest',
        name: 'matti Mirkola',
        password: 'imabarbiegirls'
    }

    const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)

    expect(response.body.error).toContain('expected `username` to be unique')
})

//test adding a user to the database with too short password
test('a user with too short password cannot be added', async () => {
    const newUser = {
        username: 'mattiTest2',
        name: 'matti Mäkinen',
        password: 'im'
    }

    const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(400)
        .expect('Content-Type', /application\/json/)
    expect(response.body.error).toContain('password too short')
})

afterAll(() => {
    mongoose.connection.close()
})