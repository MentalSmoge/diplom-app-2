import { io } from "socket.io-client";

const port = 8082;
const URL = `http://45.143.92.185:${port}`;

export const socket = io(URL, {
	autoConnect: false, // Отключаем автоматическое подключение
	reconnectionAttempts: 5, // Количество попыток переподключения
	reconnectionDelay: 1000, // Задержка между попытками
});