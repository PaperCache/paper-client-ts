"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class PaperClient {
    constructor() {
    }
    async ping() {
        return '';
    }
    async connect(host, port) {
        return new PaperClient();
    }
}
exports.default = PaperClient;
