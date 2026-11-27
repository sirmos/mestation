const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

const AMOUNT = 10_000_000n; // 10 test USDC (6 decimals)

async function setup() {
  const [owner, customer, provider, stranger] = await ethers.getSigners();
  const usdc = await ethers.deployContract("MockUSDC");
  await usdc.waitForDeployment();
  const market = await ethers.deployContract("ElyMarketV2", [
    await usdc.getAddress(),
    owner.address,
    50,
  ]);
  await market.waitForDeployment();
  const registry = await ethers.deployContract("ReputationRegistry", [
    await market.getAddress(),
  ]);
  await registry.waitForDeployment();

  await usdc.connect(customer).faucet();
  await usdc.connect(customer).approve(await market.getAddress(), AMOUNT * 20n);
  return { owner, customer, provider, stranger, usdc, market, registry };
}

// Creates a deal. When finish is true, the provider delivers and the
// customer releases the money, so the deal ends as Released.
async function newDeal(ctx, finish = true) {
  const { market, customer, provider } = ctx;
  const id = await market.nextDealId();
  const deadline = BigInt(await time.latest()) + 3600n;
  await market
    .connect(customer)
    .createDeal(provider.address, AMOUNT, "Logo design", deadline, 60n);
  if (finish) {
    await market.connect(provider).markDelivered(id);
    await market.connect(customer).release(id);
  }
  return id;
}

describe("ReputationRegistry", function () {
  it("lets the customer review a released deal", async function () {
    const ctx = await setup();
    const { registry, customer, provider } = ctx;
    const id = await newDeal(ctx);

    await expect(registry.connect(customer).postReview(id, 5, "Great work"))
      .to.emit(registry, "ReviewPosted")
      .withArgs(id, provider.address, customer.address, 5, "Great work");

    expect(await registry.reviewed(id)).to.equal(true);
    expect(await registry.reviewCount(provider.address)).to.equal(1n);
    const review = await registry.getReview(id);
    expect(review.rating).to.equal(5n);
    expect(review.comment).to.equal("Great work");
  });

  it("does not allow a review before the deal is finished", async function () {
    const ctx = await setup();
    const { registry, market, customer, provider } = ctx;
    const id = await newDeal(ctx, false);

    await expect(
      registry.connect(customer).postReview(id, 5, "Too early")
    ).to.be.revertedWith("Deal not finished");

    await market.connect(provider).markDelivered(id);
    await expect(
      registry.connect(customer).postReview(id, 5, "Still too early")
    ).to.be.revertedWith("Deal not finished");
  });

  it("lets only the customer of the deal review it", async function () {
    const ctx = await setup();
    const { registry, provider, stranger } = ctx;
    const id = await newDeal(ctx);

    await expect(
      registry.connect(provider).postReview(id, 5, "Self review")
    ).to.be.revertedWith("Not the customer");
    await expect(
      registry.connect(stranger).postReview(id, 1, "Drive-by")
    ).to.be.revertedWith("Not the customer");
    await expect(
      registry.connect(stranger).postReview(999, 1, "No such deal")
    ).to.be.revertedWith("Not the customer");
  });

  it("allows only one review per deal", async function () {
    const ctx = await setup();
    const { registry, customer } = ctx;
    const id = await newDeal(ctx);

    await registry.connect(customer).postReview(id, 4, "Good");
    await expect(
      registry.connect(customer).postReview(id, 1, "Changed my mind")
    ).to.be.revertedWith("Already reviewed");
  });

  it("rejects ratings outside 1 to 5 and long comments", async function () {
    const ctx = await setup();
    const { registry, customer } = ctx;
    const id = await newDeal(ctx);

    await expect(
      registry.connect(customer).postReview(id, 0, "")
    ).to.be.revertedWith("Rating 1 to 5");
    await expect(
      registry.connect(customer).postReview(id, 6, "")
    ).to.be.revertedWith("Rating 1 to 5");
    await expect(
      registry.connect(customer).postReview(id, 5, "x".repeat(281))
    ).to.be.revertedWith("Comment too long");
  });

  it("allows a review after a dispute is resolved", async function () {
    const ctx = await setup();
    const { registry, market, owner, customer, provider } = ctx;
    const id = await newDeal(ctx, false);

    await market.connect(provider).markDelivered(id);
    await market.connect(customer).openDispute(id, "Not as agreed");
    await market.connect(owner).resolve(id, 5000, "Split in half");

    await registry.connect(customer).postReview(id, 3, "Half done");
    expect(await registry.ratingSum(provider.address)).to.equal(3n);
  });

  it("calculates the average rating", async function () {
    const ctx = await setup();
    const { registry, customer, provider } = ctx;
    const first = await newDeal(ctx);
    const second = await newDeal(ctx);

    await registry.connect(customer).postReview(first, 5, "");
    await registry.connect(customer).postReview(second, 4, "");

    expect(await registry.reviewCount(provider.address)).to.equal(2n);
    expect(await registry.ratingSum(provider.address)).to.equal(9n);
    expect(await registry.averageRatingX100(provider.address)).to.equal(450n);
  });

  it("requires a verified reviewer when an identity gate is set", async function () {
    const ctx = await setup();
    const { registry, customer } = ctx;
    const gate = await ethers.deployContract("MockIdentityGate");
    await gate.waitForDeployment();
    const id = await newDeal(ctx);

    await registry.setIdentityGate(await gate.getAddress());
    await expect(
      registry.connect(customer).postReview(id, 5, "Nice")
    ).to.be.revertedWith("Not verified");

    await gate.setVerified(customer.address, true);
    await registry.connect(customer).postReview(id, 5, "Nice");
    expect(await registry.reviewed(id)).to.equal(true);
  });

  it("ignores deals below the minimum amount", async function () {
    const ctx = await setup();
    const { registry, customer } = ctx;
    const id = await newDeal(ctx);

    await registry.setMinDealAmount(AMOUNT + 1n);
    await expect(
      registry.connect(customer).postReview(id, 5, "Small deal")
    ).to.be.revertedWith("Deal too small");
  });

  it("lets only the owner change settings", async function () {
    const { registry, stranger } = await setup();
    await expect(
      registry.connect(stranger).setMinDealAmount(1n)
    ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
    await expect(
      registry.connect(stranger).setIdentityGate(ethers.ZeroAddress)
    ).to.be.revertedWithCustomError(registry, "OwnableUnauthorizedAccount");
  });
});