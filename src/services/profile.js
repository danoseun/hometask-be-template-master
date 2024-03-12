const Profile = require("../db/model/profile");
const { InsufficientFundsError } = require("../errors/job");

const { ProfileNotFoundError } = require("../errors/profile");

const { NullAmountError } = require("../errors/balance");

const { isNumeric } = require("../util/isNumeric");

const queryBestProfession = async (from, to) => {
  try {
    const queryResult = await Profile.getBestProfession(from, to);

    if (!queryResult || queryResult.length === 0) {
      return {
        status: 404,
        response: {
          message: "No results found",
        },
      };
    }

    return { status: 200, response: queryResult[0] };
  } catch (error) {
    return {
      status: 500,
      response: { message: error.message || "Internal server error" },
    };
  }
};

const queryBestClients = async (from, to, limit = 2) => {
  try {
    const queryResult = await Profile.getBestClients(from, to, limit);

    if (!queryResult || queryResult.length === 0) {
      return {
        status: 404,
        response: {
          message: "No results found",
        },
      };
    }

    return { status: 200, response: queryResult };
  } catch (error) {
    return {
      status: 500,
      response: { message: error.message || "Internal server error" },
    };
  }
};

const executeTransfer = async (
  fromId,
  receiverId,
  amount,
  transactionOption
) => {
  const from = await Profile.getById(fromId, transactionOption);
  const to = await Profile.getById(receiverId, transactionOption);

  if (!amount || !isNumeric(amount)) {
    throw new NullAmountError("Please specify a valid amount for this input");
  }

  if (!from || !to) {
    throw new ProfileNotFoundError("Profile not found");
  }

  if (from.balance < amount) {
    throw new InsufficientFundsError("Insufficient funds");
  }

  await from.sendPayment(amount, transactionOption);
  await to.receivePayment(amount, transactionOption);
};

module.exports = { queryBestProfession, queryBestClients, executeTransfer };
