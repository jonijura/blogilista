const blogsRouter = require("express").Router();
const jwt = require("jsonwebtoken");
const { isArguments } = require("lodash");
const Blog = require("../models/blog");
const User = require("../models/user");

blogsRouter.get("/", async (request, response) => {
  const blogs = await Blog.find({}).populate("user", { username: 1, name: 1 });
  response.json(blogs);
});

blogsRouter.post("/", async (request, response) => {
  const body = request.body;
  if (!request.token)
    return response.status(401).json({ error: "token missing" });
  decodeToken = jwt.verify(request.token, process.env.SECRET);
  const user = await User.findById(request.body.userId);
  if (decodeToken.id !== user._id.toString())
    return response.status(401).json({
      error: `Token Id ${
        decodeToken.id
      }and userId ${user._id.toString()} do not match??`,
    });

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id,
  });
  const savedBlog = await blog.save();
  user.blogs = user.blogs.concat(savedBlog._id);
  await user.save();
  response.status(201).json(savedBlog);
});

blogsRouter.delete("/:id", async (request, response) => {
  if (!request.token)
    return response.status(401).json({ error: "token missing" });
  decodeToken = jwt.verify(request.token, process.env.SECRET);
  const blog = await Blog.findById(request.params.id);
  if (!blog) response.status(204).end();
  if (decodeToken.id !== blog.user.toString())
    return response.status(401).json({
      error: `Token user Id ${
        decodeToken.id
      } and blog owner id ${blog.user.toString()} do not match`,
    });

  await Blog.findByIdAndRemove(request.params.id);
  response.status(204).end();
});

blogsRouter.put("/:id", async (request, response) => {
  const blog = {
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes,
    user: request.body.user,
  };
  const editedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, {
    new: true,
  });
  response.status(200).json(editedBlog);
});

module.exports = blogsRouter;
