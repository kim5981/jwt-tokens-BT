const router = require("express").Router();
const Users = require("./users-model.js");
const { restricted, only } = require("../auth/auth-middleware.js");

// for /api/users
router.get("/", restricted, (req, res, next) => {
  Users.find()
    .then(users => {
      res.json(users);
    })
    .catch(next);
});

// for /api/users/
router.get("/:user_id", restricted, only('admin'), (req, res, next) => {
  Users.findById(req.params.user_id)
    .then(user => {
      res.json(user);
    })
    .catch(next);
});

module.exports = router;
