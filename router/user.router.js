const router = require("express").Router();
const {
  demo,
  register,
  login,
  getCurrentUser,
  getAllUsers,
} = require("../controller/user.controller");

router.route("/demo").get(demo);
router.route("/register").post(register);
router.route("/login").post(login);
router.route("/me").get(getCurrentUser);
router.route("/all").get(getAllUsers);

module.exports = router;
