"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var helmet_1 = __importDefault(require("helmet"));
var config_env_1 = require("./config.env");
function setupSecurityPolicy(app) {
    // Sets various HTTP headers to help protect your app.
    app.use((0, helmet_1.default)());
    // Sets the X-XSS-Protection header to "1; mode=block".
    app.use(helmet_1.default.xssFilter());
    // Sets the Referrer-Policy header to "same-origin".
    app.use(helmet_1.default.referrerPolicy({ policy: 'same-origin' }));
    // Sets the Content-Security-Policy header to help prevent XSS attacks.
    app.use(helmet_1.default.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "http://localhost:".concat(config_env_1.SERVER_PORT, "/js"),
                "".concat(config_env_1.SERVER_URL, "/js"),
            ],
            frameSrc: ["'self'", config_env_1.SERVER_URL],
            styleSrc: [
                "'self'",
                "".concat(config_env_1.SERVER_URL, "/css"),
                "http://localhost:".concat(config_env_1.SERVER_PORT, "/css"),
            ],
            imgSrc: [
                "'self'",
                'data:',
                config_env_1.SERVER_URL,
                "http://localhost:".concat(config_env_1.SERVER_PORT),
            ],
        },
    }));
    app.enableCors({
        origin: [config_env_1.SERVER_URL], // Add your React dev server URL here
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP Methods
        allowedHeaders: 'Content-Type, Accept', // Allowed HTTP Headers
        credentials: true, // This is important for cookies, sessions, or basic auth
    });
}
exports.default = setupSecurityPolicy;
