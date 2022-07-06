const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body;

  if (!username || !password) {
    return response.status(400).json({ error: 'Missing username or password' });
  }
  if (password.length < 3) {
    return response.status(400).json({ error: 'password too short' });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
})

//get all users
usersRouter.get('/', async (request, response) => {
  const users = await User.find({}).populate('blogs', { title: 1, author: 1, url: 1});
  console.log('users', users)
  response.json(users);
})

module.exports = usersRouter;