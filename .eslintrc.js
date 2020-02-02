module.exports = {
  "env": {
    "commonjs": true,
    "es6": true,
    "node": true
  },
  settings: {
    polyfills: [
      'Promise'
    ]
  },
  overrides: [
    {
      files: ['test/**'],
      env: {
        mocha: true
      }
    },
    {
      files: ['*.md'],
      rules: {
        strict: 0,
        'no-console': 0,
        'node/no-missing-require': ['error', {allowModules: ['node-tesseract']}]
      }
    }
  ],
  "extends": ["ash-nazg/sauron", "plugin:node/recommended-script"],
  "globals": {
    "Atomics": "readonly",
    "SharedArrayBuffer": "readonly"
  },
  "parserOptions": {
    "ecmaVersion": 2018
  },
  "rules": {
    "import/no-commonjs": 0
  }
};
