const router = require("express").Router();
const { catchErrors } = require("../handles/errorHandlers");
const userController = require("../controllers/userController");


//When user register, Send a verification email
// router.post("/login", catchErrors(userController.login));
router.post("/register", catchErrors(userController.register));
router.post("/emailActivate", userController.activateAccount);

module.exports = router;