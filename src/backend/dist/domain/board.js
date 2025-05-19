"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBoardCommand = exports.CreateBoardCommand = exports.Board = void 0;
class Board {
    constructor(id, title, project_id) {
        this.id = id;
        this.title = title;
        this.project_id = project_id;
    }
}
exports.Board = Board;
class CreateBoardCommand {
    constructor(title, project_id, user_id) {
        this.title = title;
        this.project_id = project_id;
        this.user_id = user_id;
    }
}
exports.CreateBoardCommand = CreateBoardCommand;
class UpdateBoardCommand {
    constructor(id, title) {
        this.id = id;
        this.title = title;
    }
}
exports.UpdateBoardCommand = UpdateBoardCommand;
