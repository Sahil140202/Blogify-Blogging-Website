const {Router} = require("express");
const User = require("../models/user");
const router = Router();


router.get("/", async (req, res) => {
    const allBlogs = await Blog.find({});
    
    res.render("home", {
        user: req.user, // Passing req.user as a local variable
        blogs: allBlogs,
        isOwner: blog.createdBy.equals(req.user._id), // Determine if user is owner
    });
});


router.get("/signin", (req,res) => {
    return res.render("signin", { user: req.user });
})

router.get("/signup", (req,res) => {
    return res.render("signup", { user: req.user })
})

router.post("/signin", async (req,res) => {
    const {email, password} = req.body;
    try {
    const token = await User.matchPasswordAndGenerateToken(email, password);

    console.log("token",token);
    return res.cookie('token',token).redirect("/");
        
    } catch (error) {
        return res.render('signin', {
            error: "Incorrect Email or Password"
        });
    }
})

router.post("/signup", async (req,res) => {
    const {fullName, email, password} = req.body;
    await User.create({
        fullName,
        email,
        password
    })
    return res.redirect("/")
})

router.get("/logout", (req,res) => {
    res.clearCookie("token").redirect("/");
});

module.exports = router;