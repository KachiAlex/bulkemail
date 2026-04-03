"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const admin = __importStar(require("firebase-admin"));
const auth_1 = require("./utils/auth");
const campaigns_1 = __importDefault(require("./routes/campaigns"));
function createApp() {
    if (!admin.apps.length) {
        const raw = process.env.FIREBASE_SERVICE_ACCOUNT || process.env.FIREBASE_SERVICE_ACCOUNT_B64 || '';
        if (raw) {
            let sa = null;
            try {
                sa = JSON.parse(raw);
            }
            catch (_) {
                // try base64 decode fallback
                try {
                    const decoded = Buffer.from(raw, 'base64').toString('utf8');
                    sa = JSON.parse(decoded);
                }
                catch (err) {
                    // eslint-disable-next-line no-console
                    console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT (raw and base64) - falling back to default admin.initializeApp()', err);
                }
            }
            if (sa) {
                const appOptions = { credential: admin.credential.cert(sa) };
                if (process.env.FIREBASE_DATABASE_URL)
                    appOptions.databaseURL = process.env.FIREBASE_DATABASE_URL;
                if (process.env.FIREBASE_STORAGE_BUCKET)
                    appOptions.storageBucket = process.env.FIREBASE_STORAGE_BUCKET;
                admin.initializeApp(appOptions);
            }
            else {
                admin.initializeApp();
            }
        }
        else {
            admin.initializeApp();
        }
    }
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({ origin: true }));
    app.use(body_parser_1.default.json({ limit: '1mb' }));
    // Auth middleware attaches uid to req.user.uid
    app.use(async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization || req.headers.Authorization;
            if (authHeader && String(authHeader).startsWith('Bearer ')) {
                const token = String(authHeader).split('Bearer ')[1];
                const decoded = await (0, auth_1.verifyIdToken)(token);
                req.user = { uid: decoded.uid, email: decoded.email };
            }
        }
        catch (err) {
            // ignore - endpoints can reject if unauthenticated
        }
        next();
    });
    app.use('/api/campaigns', campaigns_1.default);
    // Basic health
    app.get('/health', (req, res) => { res.json({ status: 'ok' }); });
    return app;
}
//# sourceMappingURL=server.js.map