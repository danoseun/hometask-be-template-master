const { faker } = require("@faker-js/faker");
const { ProfileType } = require("../../src/constants/profile");

const generateProfile = (overrides = {}) => ({
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  profession: faker.company.name(),
  balance: faker.datatype.number({ min: 1, max: 1000 }),
  type: faker.datatype.boolean() ? ProfileType.CLIENT : ProfileType.CONTRACTOR,
  ...overrides,
});

module.exports = { generateProfile };
