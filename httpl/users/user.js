const router = require("express").Router();
const middleware = require("../middleware");
const test = require("../../bl/test/test");

const handlers = [
  [   "/pwdgen",        "post",    0,    test.genNewHash        ],
  [   "/testpost",        "post",    0,    test.TestPost        ],
  [   "/testget",         "get",     0,    test.TestGet         ],
  [   "/testmat",         "get",     0,    test.TestMatch       ],
];

router.use(middleware.CheckSession);
middleware.RequestHandler(router, handlers);

module.exports = router;
