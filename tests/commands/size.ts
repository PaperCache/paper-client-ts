import { expect } from "../chai";
import { client } from "../global";

describe("Size", () => {
	it("Should return size for a key which exists", async () => {
		await client.set("key", "value");
		let response = await client.size("key");

		expect(response.ok).to.equal(true);
		if (response.ok) expect(response.data).to.be.greaterThan(0);
	});

	it("Should return not ok for a key which does not exist", async () => {
		let response = await client.size("key");

		expect(response.ok).to.equal(false);
	});
});
