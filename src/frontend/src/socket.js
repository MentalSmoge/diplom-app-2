import { io } from "socket.io-client";

const port = 8080;
const URL = `http://localhost:${port}`;

export const socket = io(URL, {
	autoConnect: false, // Отключаем автоматическое подключение
	reconnectionAttempts: 5, // Количество попыток переподключения
	reconnectionDelay: 1000, // Задержка между попытками
});