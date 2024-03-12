const { Job, Contract, Profile } = require("../../src/db");
const { generateJob } = require("../factory/job");
const { generateProfile } = require("../factory/profile");
const { generateContract } = require("../factory/contract");
const { makeDeposit } = require("../../src/services/balance");

describe("balance service", () => {
  let clientWithoutDebt;
  let clientWithDebt;
  let clientWithoutFunds;
  let firstContractor;
  let secondContractor;
  let aContract;
  let anotherContract;
  let aJobToPay;
  let aJobInDebt;
  let aPaidJob;

  beforeAll(async () => {
    await Profile.sync({ force: true });
    await Contract.sync({ force: true });
    await Job.sync({ force: true });

    clientWithoutDebt = await Profile.create(
      generateProfile({ type: "client", balance: 1000 })
    );
    clientWithDebt = await Profile.create(
      generateProfile({ type: "client", balance: 1000 })
    );
    clientWithoutFunds = await Profile.create(
      generateProfile({ type: "client", balance: 10 })
    );
    firstContractor = await Profile.create(
      generateProfile({ type: "contractor", balance: 1000 })
    );
    secondContractor = await Profile.create(
      generateProfile({ type: "contractor", balance: 1000 })
    );
    aContract = await Contract.create(
      generateContract({
        ClientId: clientWithDebt.id,
        ContractorId: firstContractor.id,
      })
    );
    anotherContract = await Contract.create(
      generateContract({
        ClientId: clientWithoutFunds.id,
        ContractorId: secondContractor.id,
      })
    );
    aJobToPay = await Job.create(
      generateJob(aContract.id, { paid: false, price: 100 })
    );
    aJobInDebt = await Job.create(
      generateJob(anotherContract.id, { paid: false, price: 1000 })
    );
    aPaidJob = await Job.create(
      generateJob(aContract.id, { paid: true, price: 100 })
    );
  });

  describe("make deposit", () => {
    describe("when profile have not debt", () => {
      it("should return an error when amount exceeds deposit threshold", async () => {
        const { response } = await makeDeposit(
          clientWithoutDebt,
          firstContractor.id,
          100
        );

        expect(response.error).toBe("Amount is bigger than debt ratio");
      });
    });

    describe("when deposit more than debt ratio", () => {
      it("should return an error when amount exceeds deposit threshold", async () => {
        const { response } = await makeDeposit(
          clientWithDebt,
          firstContractor.id,
          10000
        );

        expect(response.error).toBe("Amount is bigger than debt ratio");
      });
    });

    describe("when amount to be deposited is empty or null", () => {
      it("should return an error when amount to be deposited is not valid input", async () => {
        const { status, response } = await makeDeposit(
          clientWithDebt,
          firstContractor.id,
          'qwer'
        );

        expect(status).toBe(400)
        expect(response.error).toEqual("Please specify a valid amount for this input");
      });

      it("should return an error when amount to be deposited is another invalid input", async () => {
        const { status, response } = await makeDeposit(
          clientWithDebt,
          firstContractor.id,
          '20a'
        );
        
        expect(status).toBe(400)
        expect(response.error).toEqual("Please specify a valid amount for this input");
      });

      it("should return an error when amount to be deposited is empty", async () => {
        const { status, response } = await makeDeposit(
          clientWithDebt,
          firstContractor.id,
          ''
        );

        expect(status).toBe(400);
        expect(response.error).toBe("Please specify a valid amount for this input");
      });
    });

    describe("when profile have not enough funds", () => {
      it("should return error an error when funds are insufficient", async () => {
        const { response } = await makeDeposit(
          firstContractor,
          secondContractor.id,
          100000
        );

        expect(response.error).toBe("Insufficient funds");
      });

      it("should ascertain that the balance did not change", async () => {
        const { response } = await makeDeposit(
          firstContractor,
          secondContractor.id,
          100000
        );

        const client = await Profile.findByPk(firstContractor.id);

        expect(client.balance).toBe(firstContractor.balance);
      });

      it("should ascertain that the to balance did not change", async () => {
        const { response } = await makeDeposit(
          firstContractor,
          secondContractor.id,
          100000
        );

        const contractor = await Profile.findByPk(secondContractor.id);

        expect(contractor.balance).toBe(secondContractor.balance);
      });
    });

    describe("when client deposit is succesfull", () => {
      const depositAmount = 10;
      it("it should return status as 201 when there's a succesful deposit", async () => {
        const { status } = await makeDeposit(
          clientWithDebt,
          secondContractor.id,
          depositAmount
        );

        expect(status).toBe(201);
      });

      it("should ascertain the from balance changed", async () => {
        const balanceBefore = (await Profile.findByPk(clientWithDebt.id))
          .balance;
        const { response } = await makeDeposit(
          clientWithDebt,
          secondContractor.id,
          depositAmount
        );

        const client = await Profile.findByPk(clientWithDebt.id);

        expect(client.balance).toBe(balanceBefore - depositAmount);
      });

      it("should ascertain that the to balance changed", async () => {
        const balanceBefore = (await Profile.findByPk(secondContractor.id))
          .balance;
        const { response } = await makeDeposit(
          clientWithDebt,
          secondContractor.id,
          depositAmount
        );

        const contractor = await Profile.findByPk(secondContractor.id);

        expect(contractor.balance).toBe(balanceBefore + depositAmount);
      });
    });
  });
});
