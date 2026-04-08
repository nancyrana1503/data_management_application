const bcrypt = require("bcrypt");

module.exports = (User) => {
  const router = require("express").Router();

  router.get("/", (req, res) => {
    res.redirect("/login");
  });

  router.get("/register", (req, res) => {
    res.render("register");
  });

  router.post("/register", async (req, res) => {
    try {
      const { username, email, password } = req.body;

      if (!username || !email || !password) {
        return res.send("All fields required");
      }

      const exists = await User.findOne({
        $or: [{ email }, { username }]
      });

      if (exists) return res.send("User already exists");

      const hash = await bcrypt.hash(password, 10);

      await User.create({ username, email, password: hash });

      res.redirect("/login");

    } catch (err) {
      res.send("Registration error");
    }
  });

  router.get("/login", (req, res) => {
    res.render("login");
  });

  router.post("/login", async (req, res) => {
    const user = await User.findOne({ email: req.body.email });

    if (!user) return res.send("User not found");

    const valid = await bcrypt.compare(req.body.password, user.password);

    if (!valid) return res.send("Wrong password");

    req.session.user = {
      id: user._id,
      email: user.email,
      username: user.username
    };

    res.redirect("/dashboard");
  });

  router.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect("/login");
  });

  return router;
};