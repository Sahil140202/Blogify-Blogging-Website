const { Router } = require("express");
const multer = require("multer");
const path = require("path");

const Blog = require("../models/blog");
const Comment = require("../models/comment");

const router = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve(`./public/uploads/`));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });



// Add Blog Form Route
router.get("/add-new", (req, res) => {
  return res.render("addBlog", {
    user: req.user,
  });
});

//Add Blog Route
router.post("/", upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;
  const blog = await Blog.create({
    body,
    title,
    createdBy: req.user._id,
    coverImageURL: `/uploads/${req.file.filename}`,
  });
  return res.redirect(`/blog/${blog._id}`);
});

//View Blog Route
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id).populate("createdBy");
    const comments = await Comment.find({ blogId: req.params.id }).populate(
      "createdBy"
    );
    
    return res.render("blog", {
      user: req.user,
      blog,
      comments,
      
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.delete("/:id", async (req, res) => {
  try {
      const blog = await Blog.findById(req.params.id);
      
      // Check if the user is the owner of the blog
      if (!blog.createdBy.equals(req.user._id)) {
          return res.status(403).send("You are not authorized to delete this blog");
      }
      
      // Delete the blog
      await Blog.findByIdAndDelete(req.params.id);
      
      // Redirect to the home page or a suitable location
      return res.redirect("/");
  } catch (error) {
      console.error("Error deleting blog:", error);
      res.status(500).send("Internal Server Error");
  }
});

router.post("/comment/:blogId", async (req, res) => {
  await Comment.create({
    content: req.body.content,
    blogId: req.params.blogId,
    createdBy: req.user._id,
  });
  return res.redirect(`/blog/${req.params.blogId}`);
});

module.exports = router;
