import { expect } from "./chai";
import { PaperClient } from "./../lib/paper-client";

describe("Reconnect", () => {
	let client: PaperClient;

	it("Should reconnect client on disconnect", async () => {
		client = await PaperClient.connect("paper://127.0.0.1:3145");
		await client.auth("auth_token");

		const preDisconnect = await client.status();
		expect(preDisconnect.ok).to.equal(true);

		client.disconnect();

		const postDisconnect = await client.status();
		expect(postDisconnect.ok).to.equal(true);
	}).timeout(5000);

	after(() => {
		client.disconnect();
	});
});
