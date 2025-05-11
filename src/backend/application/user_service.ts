import {
	UserRepository,
	CreateUserCommand,
	User,
	UpdateUserCommand,
	UserDTO,
	toUserDTO
} from "../domain/user";
import { IRedisClient } from "../infrastructure/redis_client_interface";
import { v4 as uuidv4 } from "uuid";

export class UserService {
	constructor(
		private userRepository: UserRepository,
		private redisClient: IRedisClient
	) { }

	// Создание пользователя
	async createUser(command: CreateUserCommand): Promise<UserDTO> {
		const user = new User(uuidv4(), command.name, command.email, command.password);
		await this.redisClient.del("users:all");
		await this.userRepository.addUser(user);
		return toUserDTO(user);
	}

	// Получение пользователя по ID
	async getUserById(userId: string): Promise<UserDTO | null> {
		// const cacheKey = `user:${userId}`;
		// const cachedUser = await this.redisClient.get(cacheKey);
		// if (cachedUser) {
		// 	console.log("Cached " + userId)
		// 	return JSON.parse(cachedUser);
		// }
		const user = await this.userRepository.getUserById(userId);
		if (!user) return null;

		// await this.redisClient.setEx(cacheKey, 300, JSON.stringify(user));
		return user;
	}

	async getUserByEmail(email: string): Promise<UserDTO | null> {
		// const cacheKey = `user:${email}`;
		// const cachedUser = await this.redisClient.get(cacheKey);
		// if (cachedUser) {
		// 	console.log("Cached " + email)
		// 	return JSON.parse(cachedUser);
		// }
		const user = await this.userRepository.getUserByEmailAuth(email);
		if (!user) return null;

		// await this.redisClient.setEx(cacheKey, 300, JSON.stringify(user));
		return user;
	}

	// Получение всех пользователей
	async getAllUsers(): Promise<UserDTO[]> {
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
	async updateUser(
		userId: string,
		command: UpdateUserCommand
	): Promise<UserDTO | null> {
		const user = await this.userRepository.getUserByIdAuth(userId);
		if (!user) {
			return null;
		}

		user.name = command.name;
		user.email = command.email;
		await this.userRepository.updateUserAuth(user);
		await this.redisClient.del(`user:${userId}`);
		await this.redisClient.del("users:all");

		return toUserDTO(user);
	}

	// Удаление пользователя
	async deleteUser(userId: string): Promise<boolean> {
		return this.userRepository.deleteUser(userId);
	}


}