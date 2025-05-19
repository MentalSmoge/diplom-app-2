"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_1 = require("../domain/user");
const uuid_1 = require("uuid");
class UserService {
    constructor(userRepository, redisClient) {
        this.userRepository = userRepository;
        this.redisClient = redisClient;
    }
    // Создание пользователя
    async createUser(command) {
        const user = new user_1.User((0, uuid_1.v4)(), command.name, command.email, command.password);
        await this.redisClient.del("users:all");
        await this.userRepository.addUser(user);
        return (0, user_1.toUserDTO)(user);
    }
    // Получение пользователя по ID
    async getUserById(userId) {
        // const cacheKey = `user:${userId}`;
        // const cachedUser = await this.redisClient.get(cacheKey);
        // if (cachedUser) {
        // 	console.log("Cached " + userId)
        // 	return JSON.parse(cachedUser);
        // }
        const user = await this.userRepository.getUserById(userId);
        if (!user)
            return null;
        // await this.redisClient.setEx(cacheKey, 300, JSON.stringify(user));
        return user;
    }
    async getUserByEmail(email) {
        // const cacheKey = `user:${email}`;
        // const cachedUser = await this.redisClient.get(cacheKey);
        // if (cachedUser) {
        // 	console.log("Cached " + email)
        // 	return JSON.parse(cachedUser);
        // }
        const user = await this.userRepository.getUserByEmailAuth(email);
        if (!user)
            return null;
        // await this.redisClient.setEx(cacheKey, 300, JSON.stringify(user));
        return user;
    }
    // Получение всех пользователей
    async getAllUsers() {
        // const cacheKey = "users:all";
        // const cachedUsers = await this.redisClient.get(cacheKey);
        // if (cachedUsers) {
        // 	console.log("Cached " + cachedUsers)
        // 	return JSON.parse(cachedUsers);
        // }
        const users = await this.userRepository.getAllUsers();
        // await this.redisClient.setEx(cacheKey, 300, JSON.stringify(users.map(user => user)));
        return users.map(user => user);
    }
    // Обновление пользователя
    async updateUser(userId, command) {
        const user = await this.userRepository.getUserByIdAuth(userId);
        if (!user) {
            return null;
        }
        user.name = command.name;
        user.email = command.email;
        await this.userRepository.updateUserAuth(user);
        await this.redisClient.del(`user:${userId}`);
        await this.redisClient.del("users:all");
        return (0, user_1.toUserDTO)(user);
    }
    // Удаление пользователя
    async deleteUser(userId) {
        return this.userRepository.deleteUser(userId);
    }
}
exports.UserService = UserService;
