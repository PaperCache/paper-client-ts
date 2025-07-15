import { expect } from "../chai";
import { client } from "../global";

describe("Stats", () => {
	it("Should get the cache's status", async () => {
		let response = await client.status();

		expect(response.ok).to.equal(true);
		if (!response.ok) return;

		expect(response.data).to.have.all.keys(
			"pid",

			"maxSize",
			"usedSize",
			"numObjects",

			"rss",
			"hwm",

			"totalGets",
			"totalSets",
			"totalDels",

			"missRatio",

			"policies",
			"policy",
			"isAutoPolicy",

			"uptime"
		);
	});
});
