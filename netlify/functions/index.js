"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Adapted for Netlify: export a handler usable by Netlify Functions
const server_1 = require("./server");
const serverless_http_1 = __importDefault(require("serverless-http"));
const app = (0, server_1.createApp)();
module.exports = (0, serverless_http_1.default)(app);
// Export existing callable functions from previous index if present
// (keep compatibility) - nothing else for now
//# sourceMappingURL=index.js.map