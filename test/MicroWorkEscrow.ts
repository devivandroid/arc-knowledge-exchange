import { expect } from "chai";
import hre from "hardhat";

const { ethers } = hre;

describe("WorkEscrow", function () {
  const amount = 250_000000n;
  const metadataURI = "ipfs://task-metadata";
  const deliveryHash = ethers.id("delivery-v1");
  const deliveryURI = "ipfs://delivery-v1";

  async function deployFixture() {
    const [owner, client, freelancer, stranger] = await ethers.getSigners();

    const mockUsdc = await ethers.deployContract("MockUSDC");
    const escrow = await ethers.deployContract("WorkEscrow", [
      await mockUsdc.getAddress(),
      owner.address
    ]);

    await mockUsdc.mint(client.address, 1_000_000000n);

    return { owner, client, freelancer, stranger, mockUsdc, escrow };
  }

  async function createTaskFixture() {
    const fixture = await deployFixture();
    await fixture.escrow.connect(fixture.client).createTask(amount, metadataURI);

    return fixture;
  }

  async function fundedTaskFixture() {
    const fixture = await createTaskFixture();
    await fixture.mockUsdc
      .connect(fixture.client)
      .approve(await fixture.escrow.getAddress(), amount);
    await fixture.escrow.connect(fixture.client).fundTask(0);

    return fixture;
  }

  async function assignedTaskFixture() {
    const fixture = await fundedTaskFixture();
    await fixture.escrow.connect(fixture.client).assignFreelancer(0, fixture.freelancer.address);

    return fixture;
  }

  async function submittedTaskFixture() {
    const fixture = await assignedTaskFixture();
    await fixture.escrow.connect(fixture.freelancer).submitWork(0, deliveryHash, deliveryURI);

    return fixture;
  }

  it("creates a task", async function () {
    const { escrow, client } = await deployFixture();

    await expect(escrow.connect(client).createTask(amount, metadataURI))
      .to.emit(escrow, "TaskCreated")
      .withArgs(0, client.address, amount, metadataURI);

    const task = await escrow.getTask(0);
    expect(task.id).to.equal(0);
    expect(task.client).to.equal(client.address);
    expect(task.amount).to.equal(amount);
    expect(task.status).to.equal(0);
    expect(task.metadataURI).to.equal(metadataURI);
    expect(await escrow.getTaskCount()).to.equal(1);
  });

  it("rejects zero amount tasks", async function () {
    const { escrow, client } = await deployFixture();

    await expect(escrow.connect(client).createTask(0, metadataURI)).to.be.revertedWithCustomError(
      escrow,
      "InvalidAmount"
    );
  });

  it("funds a task with mock USDC", async function () {
    const { escrow, mockUsdc, client } = await createTaskFixture();

    await mockUsdc.connect(client).approve(await escrow.getAddress(), amount);

    await expect(escrow.connect(client).fundTask(0))
      .to.emit(escrow, "TaskFunded")
      .withArgs(0, client.address, amount);

    const task = await escrow.getTask(0);
    expect(task.status).to.equal(1);
    expect(await mockUsdc.balanceOf(await escrow.getAddress())).to.equal(amount);
  });

  it("assigns a freelancer", async function () {
    const { escrow, client, freelancer } = await fundedTaskFixture();

    await expect(escrow.connect(client).assignFreelancer(0, freelancer.address))
      .to.emit(escrow, "FreelancerAssigned")
      .withArgs(0, freelancer.address);

    const task = await escrow.getTask(0);
    expect(task.freelancer).to.equal(freelancer.address);
    expect(task.status).to.equal(2);
  });

  it("allows a freelancer to apply for a funded task", async function () {
    const { escrow, freelancer } = await fundedTaskFixture();

    await expect(escrow.connect(freelancer).applyForTask(0))
      .to.emit(escrow, "FreelancerApplied")
      .withArgs(0, freelancer.address);

    expect(await escrow.hasApplied(0, freelancer.address)).to.equal(true);
    expect(await escrow.getApplicants(0)).to.deep.equal([freelancer.address]);
  });

  it("rejects duplicate applications and client self-application", async function () {
    const { escrow, client, freelancer } = await fundedTaskFixture();

    await expect(escrow.connect(client).applyForTask(0)).to.be.revertedWithCustomError(
      escrow,
      "InvalidFreelancer"
    );

    await escrow.connect(freelancer).applyForTask(0);
    await expect(escrow.connect(freelancer).applyForTask(0)).to.be.revertedWithCustomError(
      escrow,
      "AlreadyApplied"
    );
  });

  it("submits work", async function () {
    const { escrow, freelancer } = await assignedTaskFixture();

    await expect(escrow.connect(freelancer).submitWork(0, deliveryHash, deliveryURI))
      .to.emit(escrow, "WorkSubmitted")
      .withArgs(0, freelancer.address, deliveryHash, deliveryURI);

    const task = await escrow.getTask(0);
    expect(task.deliveryHash).to.equal(deliveryHash);
    expect(task.deliveryURI).to.equal(deliveryURI);
    expect(task.status).to.equal(3);
  });

  it("rejects invalid delivery payloads", async function () {
    const { escrow, freelancer } = await assignedTaskFixture();

    await expect(
      escrow.connect(freelancer).submitWork(0, ethers.ZeroHash, deliveryURI)
    ).to.be.revertedWithCustomError(escrow, "InvalidDeliveryHash");

    await expect(
      escrow.connect(freelancer).submitWork(0, deliveryHash, "")
    ).to.be.revertedWithCustomError(escrow, "InvalidDeliveryURI");
  });

  it("approves and releases payment", async function () {
    const { escrow, mockUsdc, client, freelancer } = await submittedTaskFixture();

    await expect(escrow.connect(client).approveAndRelease(0))
      .to.emit(escrow, "PaymentReleased")
      .withArgs(0, client.address, freelancer.address, amount);

    const task = await escrow.getTask(0);
    expect(task.status).to.equal(4);
    expect(await mockUsdc.balanceOf(freelancer.address)).to.equal(amount);
    expect(await mockUsdc.balanceOf(await escrow.getAddress())).to.equal(0);
  });

  it("cancels before funding", async function () {
    const { escrow, client } = await createTaskFixture();

    await expect(escrow.connect(client).cancelTask(0))
      .to.emit(escrow, "TaskCancelled")
      .withArgs(0, client.address, 0);

    const task = await escrow.getTask(0);
    expect(task.status).to.equal(5);
  });

  it("cancels after funding but before assignment and refunds the client", async function () {
    const { escrow, mockUsdc, client } = await fundedTaskFixture();
    const balanceBefore = await mockUsdc.balanceOf(client.address);

    await expect(escrow.connect(client).cancelTask(0))
      .to.emit(escrow, "TaskCancelled")
      .withArgs(0, client.address, amount);

    expect(await mockUsdc.balanceOf(client.address)).to.equal(balanceBefore + amount);
    expect(await mockUsdc.balanceOf(await escrow.getAddress())).to.equal(0);
  });

  it("rejects unauthorized actions", async function () {
    const { escrow, mockUsdc, client, stranger } = await createTaskFixture();

    await expect(escrow.connect(stranger).fundTask(0)).to.be.revertedWithCustomError(
      escrow,
      "Unauthorized"
    );

    await mockUsdc.connect(client).approve(await escrow.getAddress(), amount);
    await escrow.connect(client).fundTask(0);

    await expect(
      escrow.connect(stranger).assignFreelancer(0, stranger.address)
    ).to.be.revertedWithCustomError(escrow, "Unauthorized");
  });

  it("rejects invalid status transitions", async function () {
    const { escrow, client, freelancer } = await createTaskFixture();

    await expect(
      escrow.connect(client).assignFreelancer(0, freelancer.address)
    ).to.be.revertedWithCustomError(escrow, "InvalidTaskStatus");

    await expect(escrow.connect(client).approveAndRelease(0)).to.be.revertedWithCustomError(
      escrow,
      "InvalidTaskStatus"
    );
  });

  it("prevents cancelling after submission or release", async function () {
    const { escrow, client } = await submittedTaskFixture();

    await expect(escrow.connect(client).cancelTask(0)).to.be.revertedWithCustomError(
      escrow,
      "InvalidTaskStatus"
    );

    await escrow.connect(client).approveAndRelease(0);

    await expect(escrow.connect(client).cancelTask(0)).to.be.revertedWithCustomError(
      escrow,
      "InvalidTaskStatus"
    );
  });

  it("supports pause and unpause behavior", async function () {
    const { escrow, owner, client } = await deployFixture();

    await escrow.connect(owner).pause();
    await expect(
      escrow.connect(client).createTask(amount, metadataURI)
    ).to.be.revertedWithCustomError(escrow, "EnforcedPause");

    await escrow.connect(owner).unpause();
    await expect(escrow.connect(client).createTask(amount, metadataURI)).to.emit(
      escrow,
      "TaskCreated"
    );
  });
});
