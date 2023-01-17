module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  snapshotSerializers: ['jest-serializer-vue'],
  collectCoverage: true,
  coverageDirectory: 'tests/coverage',
};
