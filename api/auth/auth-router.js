const router = require("express").Router();

const Users = require("../users/users-model")
const { checkUsernameExists, validateRoleName } = require('./auth-middleware');

const { JWT_SECRET } = require("../secrets"); // use this secret!
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

router.post("/register", validateRoleName, (req, res, next) => {
  /**
    [POST] /api/auth/register { "username": "anna", "password": "1234", "role_name": "angel" }

    response:
    status 201
    {
      "user"_id: 3,
      "username": "anna",
      "role_name": "angel"
    }
   */
    const { username, password } = req.body
    const { role_name } = req

    //* hash before adding
    const hash = bcrypt.hashSync(password, 8)
    Users.add({ username, password: hash, role_name })
    .then(newUser => {
      res.status(201).json({
        user: newUser.user,
        username: newUser.username,
        role_name: newUser.role_name
      })
    })
    .catch(next)
});


router.post("/login", checkUsernameExists, (req, res, next) => {
  /**
    [POST] /api/auth/login { "username": "sue", "password": "1234" }

    response:
    status 200
    {
      "message": "sue is back!",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ETC.ETC"
    }

    The token must expire in one day, and must provide the following information
    in its payload:

    {
      "subject"  : 1       // the user_id of the authenticated user
      "username" : "bob"   // the username of the authenticated user
      "role_name": "admin" // the role of the authenticated user
    }
   */
  next()

});

module.exports = router;
