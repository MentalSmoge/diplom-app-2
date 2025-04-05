export class User {
	constructor(public id: string, public name: string, public email: string, public password: string) { }
}

export interface UserDTO {
	id: string;
	name: string;
	email: string;
}
// Преобразование User в UserDTO
export function toUserDTO(user: User): UserDTO {
	return {
		id: user.id,
		name: user.name,
		email: user.email,
	};
}
export interface UserRepository {
	checkConnection(): Promise<void>;
	addUser(user: User): Promise<void>;
	getUserById(id: string): Promise<UserDTO | null>;
	getUserByIdAuth(id: string): Promise<User | null>;
	getUserByName(name: string): Promise<UserDTO | null>;
	getUserByNameAuth(name: string): Promise<User | null>;
	getUserByEmail(name: string): Promise<UserDTO | null>;
	getUserByEmailAuth(name: string): Promise<User | null>;
	getAllUsers(): Promise<UserDTO[]>;
	updateUser(UserDTO: User): Promise<void>;
	updateUserAuth(user: User): Promise<void>;
	deleteUser(id: string): Promise<boolean>;
}
export class CreateUserCommand {
	constructor(public name: string, public email: string, public password: string) { }
}

export class UpdateUserCommand {
	constructor(public name: string, public email: string) { }
}
export class UserCreatedEvent {
	constructor(public user: User) { }
}
