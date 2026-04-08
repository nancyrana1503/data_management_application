const auth = require("../middleware/auth");

module.exports = (Task) => {
  const router = require("express").Router();

  router.get("/dashboard", auth, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { userId: req.session.user.id }
    });

    res.render("dashboard", { user: req.session.user, tasks });

  } catch (err) {
    console.log("Dashboard error:", err);
    res.send("Error loading dashboard");
  }
});

  router.get("/tasks", auth, async (req, res) => {
  try {
    const tasks = await Task.findAll({
      where: { userId: req.session.user.id },
    });

    res.render("tasks", { tasks });

  } catch (err) {
    console.log("Tasks error:", err);
    res.send("Error loading tasks");
  }
});

  router.get("/tasks/add", auth, (req, res) => {
    res.render("addTask");
  });

  router.post("/tasks/add", auth, async (req, res) => {
    await Task.create({
      ...req.body,
      userId: req.session.user.id
    });

    res.redirect("/tasks");
  });

  router.get("/tasks/edit/:id", auth, async (req, res) => {
    const task = await Task.findByPk(req.params.id);
    res.render("editTask", { task });
  });

  router.post("/tasks/edit/:id", auth, async (req, res) => {
  try {
    const { title, description, dueDate, status } = req.body;

    await Task.update(
      {
        title,
        description,
        dueDate: dueDate || null,
        status
      },
      {
        where: { id: req.params.id }
      }
    );

    res.redirect("/tasks");

  } catch (err) {
    console.log(err);
    res.send("Error updating task");
  }

  });

  router.post("/tasks/delete/:id", auth, async (req, res) => {
    await Task.destroy({
      where: { id: req.params.id }
    });

    res.redirect("/tasks");
  });

  router.post("/tasks/status/:id", auth, async (req, res) => {
    const task = await Task.findByPk(req.params.id);

    await task.update({
      status: task.status === "pending" ? "completed" : "pending"
    });

    res.redirect("/tasks");
  });

  return router;
};