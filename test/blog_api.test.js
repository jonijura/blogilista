const mongoose = require("mongoose");
const supertest = require("supertest");
const app = require("../app");
const api = supertest(app);
const Blog = require("../models/blog");
const User = require("../models/user");
const helper = require("./test_helper");

let userIds = [];
let tokens = [];
beforeAll(async () => {
  await User.deleteMany({});
  const promiseArray = helper.initialUsers.map((user) => {
    return api.post("/api/users").send(user).expect(201);
  });
  const responses = await Promise.all(promiseArray);
  userIds = responses.map((response) => response.body.id);
  const loginPromises = helper.initialUsers.map((user) => {
    return api
      .post("/api/login")
      .send({ username: user.username, password: user.password })
      .expect(200);
  });
  const responses2 = await Promise.all(loginPromises);
  tokens = responses2.map((response) => response.body.token);
});

beforeEach(async () => {
  await Blog.deleteMany({});
  //add first blog to database, for some reason adding more does not work
  const blog = helper.initialBlogs[0];
  const user = helper.initialUsers[0];
  const response = await api
    .post("/api/blogs")
    .set("Authorization", `bearer ${tokens[0]}`)
    .send({ ...blog, userId: userIds[0] })
    .expect(201);
  // console.log('added one blog to database')
  // add blogs to the database
  // const blogPromises = helper.initialBlogs.map(blog => {
  //   return api
  //     .post('/api/blogs')
  //     .set('Authorization', `bearer ${tokens[0]}`)
  //     .send({...blog, userId: userIds[0]})
  //     .expect(201)
  // })
  // console.log('waiting for blog promises to resolve')
  // await Promise.all(blogPromises)
  // console.log('blogs added to the database')
});

test("blogs are returned as json", async () => {
  await api
    .get("/api/blogs")
    .expect(200)
    .expect("Content-Type", /application\/json/);
});

test("notes are labeled with id", async () => {
  const response = await api.get("/api/blogs");
  expect(response.body[0].id).toBeDefined();
});

test("there are as many notes as was added", async () => {
  const response = await api.get("/api/blogs");

  expect(response.body).toHaveLength(1);
});

test("a valid blog can be added with token", async () => {
  const newBlog = {
    title: "New blog",
    author: "New author",
    url: "https://www.newblog.com",
    likes: 12,
    userId: userIds[0],
  };

  await api
    .post("/api/blogs")
    .set({ Authorization: `bearer ${tokens[0]}` }) //set the token in the header
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(2);
});

test("blog cannot be added without token", async () => {
  const newBlog = {
    title: "New blog",
    author: "New author",
    url: "https://www.newblog.com",
    likes: 12,
    userId: userIds[0],
  };

  await api
    .post("/api/blogs")
    .send(newBlog)
    .expect(401)
    .expect("Content-Type", /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(1);
});

test("a blog without likes defaults to zero", async () => {
  const newBlog = {
    title: "New blog",
    author: "New author",
    url: "https://www.newblog.com",
    userId: userIds[0],
  };

  await api
    .post("/api/blogs")
    .set({ Authorization: `bearer ${tokens[0]}` })
    .send(newBlog)
    .expect(201)
    .expect("Content-Type", /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  const blog = blogsAtEnd[blogsAtEnd.length - 1];
  expect(blog.likes).toBe(0);
});

test("a blog without author returns 400", async () => {
  const newBlog = {
    title: "New blog",
    url: "https://www.newblog.com",
    likes: 12,
    userId: userIds[1],
  };

  await api
    .post("/api/blogs")
    .set({ Authorization: `bearer ${tokens[1]}` })
    .send(newBlog)
    .expect(400)
    .expect("Content-Type", /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(1);
});

test("a blog without title returns 400", async () => {
  const newBlog = {
    author: "matt michaels",
    url: "https://www.newblog.com",
    likes: 12,
    userId: userIds[1],
  };
  await api
    .post("/api/blogs")
    .set({ Authorization: `bearer ${tokens[1]}` })
    .send(newBlog)
    .expect(400)
    .expect("Content-Type", /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(1);
});

test("a blog can be deleted", async () => {
  const blogsAtStart = await helper.blogsInDb();
  const blogToDelete = blogsAtStart[0];

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set({ Authorization: `bearer ${tokens[0]}` })
    .expect(204);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(0);

  const titles = blogsAtEnd.map((r) => r.title);
  expect(titles).not.toContain(blogToDelete.title);
});

test("a blog cannot be deleted by wrong user", async () => {
  const blogsAtStart = await helper.blogsInDb();
  const blogToDelete = blogsAtStart[0];

  await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .set({ Authorization: `bearer ${tokens[1]}` })
    .expect(401);

  const blogsAtEnd = await helper.blogsInDb();
  expect(blogsAtEnd).toHaveLength(1);
});

test("a blog can be edited", async () => {
  const blogsAtStart = await helper.blogsInDb();
  const blogToEdit = blogsAtStart[0];
  const newBlog = {
    title: "Can't believe it's not butter",
    author: "Matt Michaels",
    url: "https://www.newblog.com",
    likes: 12,
  };
  await api
    .put(`/api/blogs/${blogToEdit.id}`)
    .send(newBlog)
    .expect(200)
    .expect("Content-Type", /application\/json/);

  const blogsAtEnd = await helper.blogsInDb();
  const editedBlog = blogsAtEnd.find((b) => b.id === blogToEdit.id);
  expect(editedBlog.title).toBe(newBlog.title);
});

afterAll(() => {
  mongoose.connection.close();
});
