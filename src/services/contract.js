const Contract = require("../db/model/contract");

const getContractOfProfileById = async (id, profile) => {
  const contract = await Contract.findById(id);

  if (!contract)
    return { status: 404, response: { error: "Contract not found" } };

  if (!contract.isContractor(profile) && !contract.isClient(profile))
    return {
      status: 403,
      response: { error: "You are unauthorized to carry out this request" },
    };

  return { status: 200, response: { result: contract } };
};

const getNonTerminatedContractByProfile = async (profile) => {
  const clientContract = Contract.getNonTerminatedContracts({
    where: { ClientId: profile.id },
  });
  const contractorContract = Contract.getNonTerminatedContracts({
    where: { ContractorId: profile.id },
  });

  const contracts = await Promise.all([clientContract, contractorContract]);

  return { status: 200, response: { result: contracts.flat() } };
};

module.exports = {
  getContractOfProfileById,
  getNonTerminatedContractByProfile,
};
