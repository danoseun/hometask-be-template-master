const {
  queryBestClients,
  queryBestProfession,
} = require("../services/profile");

const getBestProfession = async (req, res) => {
  try {
    const { start, end } = req.query;

    const since = new Date(Number(start));
    const to = new Date(Number(end));

    const { status, response } = await queryBestProfession(since, to);
    res.status(status).json(response);
  } catch (error) {
    return {
      status: 500,
      response: { message: error.message || "Internal server error" },
    };
  }
};

const getBestClients = async (req, res) => {
  const { start, end, limit } = req.query;

  try {
    const from = new Date(start);
    const to = new Date(end);
    // Check if fromDate is greater than toDate and they are not the same date
    if (from.getTime() > to.getTime() || from.getTime() === to.getTime()) {
      return "Invalid date range: fromDate must be less than toDate and they must not be the same date.";
    }

    const { status, response } = await queryBestClients(from, to, limit);
    res.status(status).json(response);
  } catch (error) {
    return {
      status: 500,
      response: { message: error.message || "Internal server error" },
    };
  }
};

module.exports = { getBestClients, getBestProfession };
