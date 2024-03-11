const { faker } = require("@faker-js/faker");
const { ContractStatus } = require("../../src/constants/contract");

const generateContract = (overrides = {}) => ({
  terms: faker.lorem.lines(),
  status: faker.helpers.arrayElement([
    ContractStatus.NEW,
    ContractStatus.IN_PROGRESS,
    ContractStatus.TERMINATED,
  ]),
  ...overrides,
});

module.exports = { generateContract };
