import { Pool } from "pg";
import { User, UserRepository, UserDTO, toUserDTO } from "../domain/user";

export class PostgreSQLUserRepository implements UserRepository {
	constructor(private pool: InstanceType<typeof Pool>) { }

	async checkConnection(): Promise<void> {
		try {
			const res = await this.pool.query("SELECT NOW()");
			console.log("Database connected:", res.rows[0]);
		} catch (err) {
			console.error("Database connection error:", err);
		}
	}
	async addUser(user: User): Promise<void> {
		await this.pool.query(
			"INSERT INTO users(id, name, email) VALUES($1, $2, $3)",
			[user.id, user.name, user.email]
		);
	}
	async getUserById(id: string): Promise<UserDTO | null> {
		const result = await this.pool.query(
			"SELECT id, name, email FROM users WHERE id = $1",
			[id]
		);

		if (result.rows.length === 0) {
			return null;
		}

		const userData = result.rows[0];
		return toUserDTO(userData);
	}
	async getUserByIdAuth(id: string): Promise<User | null> {
		const result = await this.pool.query(
			"SELECT id, name, email FROM users WHERE id = $1",
			[id]
		);

		if (result.rows.length === 0) {
			return null;
		}

		const userData = result.rows[0];
		return new User(userData.id, userData.name, userData.email, userData.password);
	}
	async getUserByName(name: string): Promise<UserDTO | null> {
		const result = await this.pool.query(
			"SELECT id, name, email FROM users WHERE name = $1",
			[name]
		);

		if (result.rows.length === 0) {
			return null;
		}

		const userData = result.rows[0];
		return toUserDTO(userData);
	}
	async getUserByEmailAuth(name: string): Promise<User | null> {
		const result = await this.pool.query(
			"SELECT id, name, email FROM users WHERE email = $1",
			[name]
		);

		if (result.rows.length === 0) {
			return null;
		}

		const userData = result.rows[0];
		return new User(userData.id, userData.name, userData.email, userData.password);
	}
	async getUserByNameAuth(name: string): Promise<User | null> {
		const result = await this.pool.query(
			"SELECT id, name, email FROM users WHERE name = $1",
			[name]
		);

		if (result.rows.length === 0) {
			return null;
		}

		const userData = result.rows[0];
		return new User(userData.id, userData.name, userData.email, userData.password);
	}
	async getAllUsers(): Promise<UserDTO[]> {
		const result = await this.pool.query(
			'SELECT id, name, email FROM users'
		);

		return result.rows.map(row => toUserDTO(row));
	}
	// Обновление пользователя
	async updateUser(user: UserDTO): Promise<void> {
		await this.pool.query(
			"UPDATE users SET name = $1, email = $2 WHERE id = $3",
			[user.name, user.email, user.id]
		);
	}
	async updateUserAuth(user: User): Promise<void> {
		await this.pool.query(
			"UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4",
			[user.name, user.email, user.password, user.id]
		);
	}
	// Удаление пользователя
	async deleteUser(id: string): Promise<boolean> {
		const result = await this.pool.query(
			"DELETE FROM users WHERE id = $1",
			[id]
		);
		return result.rowCount! > 0;
	}
}
export function createPool(): InstanceType<typeof Pool> {
	return new Pool({
		user: process.env.DB_USER,
		host: process.env.DB_HOST || "user_db",
		database: process.env.DB_NAME,
		password: process.env.DB_PASSWORD,
		port: parseInt(process.env.DB_PORT!),
	});
}
