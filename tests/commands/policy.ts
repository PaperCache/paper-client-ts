import { expect } from "../chai";
import { client } from "../global";

describe("Policy", () => {
	it("Should set the cache's policy", async () => {
		const INITIAL_POLICY_ID = "lfu";
		const UPDATED_POLICY_ID = "lru";

		const initial = await client.policy(INITIAL_POLICY_ID);

		expect(initial.ok).to.equal(true);
		expect(await getCurrentPolicy()).to.equal(INITIAL_POLICY_ID);

		const updated = await client.policy(UPDATED_POLICY_ID);

		expect(updated.ok).to.equal(true);
		expect(await getCurrentPolicy()).to.equal(UPDATED_POLICY_ID);
	});
});

async function getCurrentPolicy(): Promise<string> {
	let response = await client.status();

	if (!response.ok) {
		throw new Error();
	}

	return response.data.policy;
}
