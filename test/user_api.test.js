const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const helper = require('./test_helper')

let userIds = []
let tokens = []
beforeAll(async () => {
  await User.deleteMany({})
  const promiseArray = helper.initialUsers.map(user => {
    return api
      .post('/api/users')
      .send(user)
      .expect(201)
  })
  const responses = await Promise.all(promiseArray)
  userIds = responses.map(response => response.body.id)
  const loginPromises = helper.initialUsers.map(user => {
    return api
      .post('/api/login')
      .send({ username: user.username, password: user.password })
      .expect(200)
  })
  const responses2 = await Promise.all(loginPromises)
  tokens = responses2.map(response => response.body.token)
})
// beforeEach(async () => {
//     await User.deleteMany({})
//     const users = helper.initialUsers.map(user => new User(user))
//     const promiseArray = users.map(user => user.save())
//     await Promise.all(promiseArray)
// })

//test adding a user to the database
test('a valid user can be added', async () => {
    const newUser = {
        username: 'mattiTest2',
        name: 'matti Mikkola',
        password: 'imabarbiegirl2'
    }

    const response = await api
        .post('/api/users')
        .send(newUser)
        .expect(201)
        .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(helper.initialUsers.length+1)
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

//test login with valid username and password
test('a valid user can be logged in', async () => {
    const newLogin = {
        username: 'mattiTest',
        password: 'imabarbiegirl'
    }

    const response = await api
        .post('/api/login')
        .send(newLogin)
        .expect(200)
        .expect('Content-Type', /application\/json/)

        expect(response.body.token).toBeDefined()
})

//test login with invalid password
test('a user with invalid password cannot be logged in', async () => {
    const newLogin = {
        username: 'mattiTest',
        password: 'imabarbie'
    }

    const response = await api
        .post('/api/login')
        .send(newLogin)
        .expect(401)
        .expect('Content-Type', /application\/json/)

        expect(response.body.error).toContain('invalid username or password')
})


afterAll(() => {
    mongoose.connection.close()
})