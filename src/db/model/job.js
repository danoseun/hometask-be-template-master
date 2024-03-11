const { Op, Model, ...Sequelize } = require("sequelize");

const Contract = require("./contract");
const sequelize = require("../config");

class Job extends Model {
  static getById(id, options = {}) {
    return Job.findOne({ where: { id }, include: [Contract], ...options });
  }

  static unpaidJobs(filter) {
    const unpaidJobs = { ...filter };

    if (filter) {
      unpaidJobs.where = { ...filter.where, paid: { [Op.or]: [null, false] } };
    } else {
      unpaidJobs.where = { paid: { [Op.or]: [null, false] } };
    }

    return Job.findAll(unpaidJobs);
  }

  static async getClientDebt(ClientId, options = {}) {
    return Job.sum("price", {
      where: { paid: { [Op.or]: [false, null] } },
      include: {
        model: Contract,
        where: { ClientId },
      },
      ...options,
    });
  }

  async pay(transactionOption) {
    return this.update(
      {
        paid: true,
        paymentDate: new Date(),
      },
      { transaction: transactionOption.transaction }
    );
  }
}

Job.init(
  {
    description: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    price: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: false,
    },
    paid: {
      type: Sequelize.BOOLEAN,
      default: false,
    },
    paymentDate: {
      type: Sequelize.DATE,
    },
  },
  {
    sequelize,
    modelName: "Job",
  }
);

module.exports = Job;
