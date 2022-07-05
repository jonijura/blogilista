var _ = require('lodash');

const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favouriteBlog = (blogs) => {
    if (blogs.length === 0) return { title: "", author: "", likes: 0 }
    let mostLiked = blogs[0]
    blogs.forEach(blog => {
        if (blog.likes > mostLiked.likes) mostLiked = blog;
    })
    return (
        {
            title: mostLiked.title,
            author: mostLiked.author,
            likes: mostLiked.likes
        }
    )
}

const mostBlogs = (blogs) => {
    const name = (value) => value.author
    const ob = _.countBy(blogs, name)
    let ans = {author:"", blogs: 0}
    for (const key in ob) {
        if(ob[key]>ans.blogs){
            ans = {author: key, blogs: ob[key]}
        }
    }
    return ans
}

const mostLikes = (blogs) => {
    const name = (value) => value.author
    const ob = _.groupBy(blogs, name)
    let ans = {author:"", likes: 0}
    for (const key in ob) {
        const aa = ob[key].reduce((sum, ele) => sum+ele.likes, 0)
        if(aa>ans.likes){
            ans = {author: key, likes: aa}
        }
    }
    return ans
}

module.exports = {
    dummy, totalLikes, favouriteBlog, mostBlogs, mostLikes
}