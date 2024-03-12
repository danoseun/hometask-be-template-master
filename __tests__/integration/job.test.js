const { Job, Contract, Profile } = require("../../src/db");
const { generateJob } = require("../factory/job");
const { generateProfile } = require("../factory/profile");
const { generateContract } = require("../factory/contract");
const { makePayment } = require("../../src/services/job");

describe("job service", () => {
  let clientWithFunds;
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

    clientWithFunds = await Profile.create(
      generateProfile({ type: "client", balance: 1000 })
    );
    clientWithoutFunds = await Profile.create(
      generateProfile({ type: "client", balance: 10 })
    );
    firstContractor = await Profile.create(
      generateProfile({ type: "contractor" })
    );
    secondContractor = await Profile.create(
      generateProfile({ type: "contractor" })
    );
    aContract = await Contract.create(
      generateContract({
        ClientId: clientWithFunds.id,
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

  describe("make payment", () => {
    describe("when profile is not client", () => {
      it("return an error when client is trying to make payment for a job not theirs", async () => {
        const { response } = await makePayment(aJobToPay.id, firstContractor);

        expect(response.error).toBe("Profile is not client");
      });
    });

    describe("when profile is not client of the job", () => {
      it("should return an error when client is trying to pay for ajob not theirs", async () => {
        const { response } = await makePayment(
          aJobToPay.id,
          clientWithoutFunds
        );

        expect(response.error).toBe("Profile is not job client");
      });
    });

    describe("when job is paid", () => {
      it("should return an error when job is already paid for", async () => {
        const { response } = await makePayment(aPaidJob.id, clientWithFunds);

        expect(response.error).toBe("Job already paid");
      });
    });

    describe("when client have not enough funds", () => {
      it("should return an error for insufficient funds", async () => {
        const { response } = await makePayment(
          aJobInDebt.id,
          clientWithoutFunds
        );

        expect(response.error).toBe("Insufficient funds");
      });

      it("should ascertain that client balance not changed", async () => {
        await makePayment(aJobInDebt.id, clientWithoutFunds);

        const client = await Profile.findByPk(clientWithoutFunds.id);

        expect(client.balance).toBe(clientWithoutFunds.balance);
      });

      it("should ascertain that contractor balance not changed", async () => {
        await makePayment(aJobInDebt.id, clientWithoutFunds);

        const contractor = await Profile.findByPk(secondContractor.id);

        expect(contractor.balance).toBe(secondContractor.balance);
      });

      it("should return false when job is not paid", async () => {
        await makePayment(aJobInDebt.id, clientWithoutFunds);

        const job = await Job.findByPk(aJobInDebt.id);

        expect(job.paid).toBe(false);
      });
    });

    describe("when payment is succesful", () => {
      beforeEach(async () => {
        aJobToPay = await Job.create(
          generateJob(aContract.id, { paid: false, price: 100 })
        );
      });

      it("should a status of 201 when successful payment is made for a job", async () => {
        const { status } = await makePayment(aJobToPay.id, clientWithFunds);

        expect(status).toEqual(201);
      });

      it("should ascertain that client balance changed", async () => {
        const balanceBefore = (await Profile.findByPk(clientWithFunds.id))
          .balance;

        const response = await makePayment(aJobToPay.id, clientWithFunds);

        const client = await Profile.findByPk(clientWithFunds.id);

        expect(client.balance).toBe(balanceBefore - aJobToPay.price);
      });

      it("should ascertain that contractor balance changed", async () => {
        const balanceBefore = (await Profile.findByPk(firstContractor.id))
          .balance;

        await makePayment(aJobToPay.id, clientWithFunds);

        const contractor = await Profile.findByPk(firstContractor.id);

        expect(contractor.balance).toBe(balanceBefore + aJobToPay.price);
      });

      it("should return boolean when job is paid", async () => {
        await makePayment(aJobToPay.id, clientWithFunds);

        const job = await Job.findByPk(aJobToPay.id);

        expect(job.paid).toBe(true);
      });
    });
  });
});
