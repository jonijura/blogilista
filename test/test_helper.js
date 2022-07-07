const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: "Matt's car blog",
    author: "Matt Michaud",
    url: "https://www.mattmichaud.com/car-blog",
    likes: 32
  },
  {
    title: "Matt's dog blog",
    author: "Matt Michaud",
    url: "https://www.mattmichaud.com/dog-blog",
    likes: 42
  },
  {
    title: "Mike's cat blog",
    author: "Mike Macmillan",
    url: "https://www.mikemacmillan.com/cat-blog",
    likes: 12
  },
  {
    title: "Lisa's food blog",
    author: "Lisa Macmillan",
    url: "https://www.lisa.com/food-blog",
    likes: 32
  }
]

const initialUsers = [
  {
    username: 'mattiTest',
    name: 'matti Mikkola',
    password: 'imabarbiegirl'
  },
  {
    username: 'mikeTest',
    name: 'mike Macmillan',
    password: 'imabarbieboy'
  },
]

// const nonExistingId = async () => {
//   const note = new Note({ content: 'willremovethissoon', date: new Date() })
//   await note.save()
//   await note.remove()

//   return note._id.toString()
// }

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  initialBlogs, initialUsers, blogsInDb, usersInDb
}