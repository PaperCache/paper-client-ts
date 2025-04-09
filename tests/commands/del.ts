import { expect } from "../chai";
import { client } from "../global";

describe("Del", () => {
	it("Should return ok for a key which exists", async () => {
		await client.set("key", "value");
		const response = await client.del("key");

		expect(response.ok).to.equal(true);
	});

	it("Should return not ok for a key which does not exist", async () => {
		const response = await client.del("key");
		expect(response.ok).to.equal(false);
	});
});
