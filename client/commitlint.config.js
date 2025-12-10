module.exports = {
  extends: ['@commitlint/cli', '@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat', // new feature
        'fix', // bug fix
        'docs', // documentation only changes
        'style', // changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)
        'refactor', // code change that neither fixes a bug nor adds a feature
        'perf', // code change that improves performance
        'test', // adding missing tests or correcting existing tests
        'build', // changes that affect the build system or external dependencies (example scopes: gulp, broccoli, npm)
        'ci', // changes to our CI configuration files and scripts (example scopes: Travis, Circle, BrowserStack, SauceLabs)
        'chore', // other changes that don't modify src or test files (dependencies, build process, etc)
        'revert', // reverts a previous commit
        'wip', // work in progress
        'conf', // configuration files
      ],
    ],
    'subject-case': [2, 'always', 'sentence-case'],
  },
};
