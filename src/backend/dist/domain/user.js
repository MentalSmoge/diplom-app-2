"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserCreatedEvent = exports.UpdateUserCommand = exports.CreateUserCommand = exports.User = void 0;
exports.toUserDTO = toUserDTO;
class User {
    constructor(id, name, email, password) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.password = password;
    }
}
exports.User = User;
// Преобразование User в UserDTO
function toUserDTO(user) {
    return {
        id: user.id,
        name: user.name,
        email: user.email,
    };
}
class CreateUserCommand {
    constructor(name, email, password) {
        this.name = name;
        this.email = email;
        this.password = password;
    }
}
exports.CreateUserCommand = CreateUserCommand;
class UpdateUserCommand {
    constructor(name, email) {
        this.name = name;
        this.email = email;
    }
}
exports.UpdateUserCommand = UpdateUserCommand;
class UserCreatedEvent {
    constructor(user) {
        this.user = user;
    }
}
exports.UserCreatedEvent = UserCreatedEvent;
