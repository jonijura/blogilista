const Blog = require('../models/blog')

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

module.exports = {
    initialBlogs, blogsInDb
}