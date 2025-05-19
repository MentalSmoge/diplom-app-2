"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = authenticateJWT;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authenticateJWT(req, res, next) {
    const token = req.cookies.jwt;
    try {
        const verified = jsonwebtoken_1.default.verify(token, "secret");
        req.user = verified;
        next();
    }
    catch (err) {
        res.status(403).json({ error: err });
    }
}
