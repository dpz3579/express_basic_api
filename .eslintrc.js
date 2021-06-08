module.exports = {
  "env": {
    "commonjs": true,
    "es2021": true,
    "node": true,
  },
  "globals": {
    "APICONFIG": "readonly",
    "MONGOCONFIG": "readonly",
    "MONGOUSERS": "readonly"
  },
  "extends": "eslint:recommended",
  "parserOptions": {
    "ecmaVersion": 12
  },
  "rules": {
    "indent": [
      "error",
      2
    ],
    "linebreak-style": [
      "error",
      "unix"
    ],
    "quotes": [
      "warn",
      "double"
    ],
    "semi": [
      "warn",
      "always"
    ],
    "no-console": "error"
  }
};
