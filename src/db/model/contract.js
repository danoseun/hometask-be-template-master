const { Op, Model, ...Sequelize } = require("sequelize");

const { ContractStatus } = require("../../constants/contract");
const sequelize = require("../config");

class Contract extends Model {
  static findById(id, options = {}) {
    return Contract.findOne({ where: { id }, ...options });
  }

  static getNonTerminatedContracts(filter) {
    const nonTerminatedContractsFilter = { ...filter };

    if (filter) {
      nonTerminatedContractsFilter.where = {
        ...filter.where,
        status: { [Op.ne]: ContractStatus.TERMINATED },
      };
    } else {
      nonTerminatedContractsFilter.where = {
        status: { [Op.ne]: ContractStatus.TERMINATED },
      };
    }

    return Contract.findAll(nonTerminatedContractsFilter);
  }

  isContractor(profile) {
    return this.ContractorId === profile.id;
  }

  isClient(profile) {
    return this.ClientId === profile.id;
  }
}

Contract.init(
  {
    terms: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    status: {
      type: Sequelize.ENUM("new", "in_progress", "terminated"),
    },
  },
  {
    sequelize,
    modelName: "Contract",
  }
);

module.exports = Contract;
