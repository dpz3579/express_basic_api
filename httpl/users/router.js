const router = require("express").Router();
const user = require("./user");
const middleware = require("../middleware");

router.use("/user", user);

module.exports = router;
