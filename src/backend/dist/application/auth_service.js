"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class AuthService {
    constructor(userRepo) {
        this.userRepo = userRepo;
    }
    async login(email, password) {
        const user = await this.userRepo.getUserByEmailAuth(email);
        if (!user)
            throw new Error('User not found');
        const valid = await bcryptjs_1.default.compare(password, user.password);
        if (!valid)
            throw new Error('Invalid password');
        return this.generateToken(user);
    }
    generateToken(user) {
        return jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || "secret", { expiresIn: '1h' });
    }
}
exports.AuthService = AuthService;
