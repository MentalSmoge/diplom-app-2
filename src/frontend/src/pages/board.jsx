import React, { useEffect, useState, useRef, useCallback } from "react";
import { Stage, Layer, Image, Rect, Transformer, Line } from "react-konva";
import { socket } from "../socket";
import { useParams, useNavigate } from "react-router-dom";
import { checkBoardAccess } from "../api/auth";
import EditableText from "../components/board_components/text";
import { RectangleElement } from "../components/board_components/rect";
import EdgeArrow from "../components/board_components/arrow";
import BrushElement from "../components/board_components/brush";
import TableElement from "../components/board_components/tableElement";
import { observer } from "mobx-react";
import { Document, Paragraph, ImageRun, Packer, HeadingLevel, AlignmentType } from "docx";
import * as utils_export from "../utils/utils_export"
import ContextMenu from '../components/contextMenu';
import "./Toolbar.css"
import ImageElement from "../components/board_components/imageElement";
import { Grouping } from "../components/board_components/grouping";
import { boardStore } from "../stores/boardStore";

const Board = observer(({ title }) => {
	const { boardId } = useParams(); // Получаем ID доски из URL
	const [selectedColor, setSelectedColor] = useState('#e55039');
	const [showTextExport, setShowTextExport] = useState(true);
	const [isSpacePressed, setIsSpacePressed] = useState(false);
	const [selectedTool, setSelectedTool] = useState(null);
	const [tempElement, setTempElement] = useState(null);
	const [drawing, setDrawing] = useState(false);
	const [startPos, setStartPos] = useState({ x: 0, y: 0 });
	const [numberBoardId, setNumberBoardId] = useState(Number(boardId))
	const [elements, setElements] = useState([]);
	const [selectedIds, setSelectedIds] = useState([]);
	const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
	const [showMenu, setShowMenu] = useState(false);
	const [selectedId, setSelectedId] = useState(null);
	const [selectionRectangle, setSelectionRectangle] = useState({
		visible: false,
		x1: 0,
		y1: 0,
		x2: 0,
		y2: 0,
	});
	const transformerRef = useRef();
	const rectRefs = useRef(new Map());
	const [isConnected, setIsConnected] = useState(false);
	const [isDraggingOver, setIsDraggingOver] = useState(false);
	const [showColorPicker, setShowColorPicker] = useState(false)
	const [showDelete, setShowDelete] = useState(false)
	const navigate = useNavigate();
	const [currentLine, setCurrentLine] = useState(null);

	useEffect(() => {
		const handleBoardState = (serverElements) => setElements(serverElements);
		const handleElementCreated = (element) => setElements(prev => [...prev, element]);
		const handleElementUpdated = (element) => setElements(prev => prev.map(el => el.id === element.id ? element : el));
		const handleElementDeleted = (elementId) => setElements(prev => prev.filter(el => el.id !== elementId));

		socket.on("board-state", handleBoardState);
		socket.on("element-created", handleElementCreated);
		socket.on("element-updated", handleElementUpdated);
		socket.on("element-deleted", handleElementDeleted);

		return () => {
			socket.off("board-state", handleBoardState);
			socket.off("element-created", handleElementCreated);
			socket.off("element-updated", handleElementUpdated);
			socket.off("element-deleted", handleElementDeleted);
		};
	}, []);
	useEffect(() => {
		const onConnect = () => {
			setIsConnected(true);
			socket.emit("join-board", boardId);
		};
		socket.on("connect", onConnect);
		const getAccessLevel = async () => {
			const isAuthenticated = await checkBoardAccess(numberBoardId);
			if (!isAuthenticated?.data) navigate('/login');
		};

		getAccessLevel();
		socket.connect();

		return () => {
			socket.emit("leave-board", numberBoardId);
			socket.disconnect();
		};
	}, [navigate, numberBoardId]); // Зависимости только от параметров маршрута
	useEffect(() => {
		if (!transformerRef.current) return;

		const nodes = selectedIds
			.map(id => rectRefs.current.get(id))
			.filter(node => node);

		transformerRef.current.nodes(nodes);
	}, [selectedIds]); // Срабатывает только при изменении selectedIds
	useEffect(() => {
		const handleWindowClick = () => setShowMenu(false);
		window.addEventListener('click', handleWindowClick);
		return () => window.removeEventListener('click', handleWindowClick);
	}, []);
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.code === 'Space') {
				setIsSpacePressed(true);
			}
			// Добавляем обработчик Esc
			if (e.key === 'Escape') {
				setSelectedTool(null);
			}
		};


		const handleKeyUp = (e) => {
			if (e.code === 'Space') {
				setIsSpacePressed(false);
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
		};
	}, []);

	const handleCreateElement = (element) => {
		socket.emit("element-create", { boardId, element });
	};

	const handleUpdateElement = (element) => {
		socket.emit("element-update", { boardId, element });
	};

	const handleDeleteElement = (elementId) => {
		socket.emit("element-delete", { boardId, elementId });
	};

	const handleDragStart = (e) => {
		// console.log(e.target)
		const id = e.target.id();
		setElements(
			elements.map((element) => {
				return {
					...element,
					isDragging: element.id === id,
				};
			})
		);
	};
	const handleDragEndArrow = (e, group, node) => {
		console.log(e.target, group, node)
		const id = group.id();
		const updatedElements = elements.map((element) => {
			if (element.id === id) {
				if (node === "start") {
					return {
						...element,
						x_start: e.target.x(),
						y_start: e.target.y(),
						isDragging: false,
					};
				}
				else {
					return {
						...element,
						x_end: e.target.x(),
						y_end: e.target.y(),
						isDragging: false,
					};
				}
			}
			return element;
		});
		setElements(updatedElements);

		const movedElement = updatedElements.find(
			(element) => element.id === id
		);
		if (movedElement) {
			handleUpdateElement(movedElement);
		}
	};

	const handleDragEnd = (e) => {
		const id = e.target.id();
		const updatedElements = elements.map((element) => {
			if (element.id === id) {
				return {
					...element,
					x: e.target.x(),
					y: e.target.y(),
					isDragging: false,
				};
			}
			return element;
		});
		setElements(updatedElements);

		const movedElement = updatedElements.find(
			(element) => element.id === id
		);
		if (movedElement) {
			handleUpdateElement(movedElement);
		}
	};
	const handleStageClick = (e) => {
		// If we are selecting with rect, do nothing
		if (selectionRectangle.visible) {
			return;
		}

		// If click on empty area - remove all selections
		if (e.target === e.target.getStage()) {
			setSelectedIds([]);
			return;
		}

		if (e.target.hasName('text')) { //TODO Hack for text node
			e.target = e.target.getAncestors()[0]
		}
		console.log(selectedIds)

		// Do nothing if clicked NOT on our rectangles
		if (!e.target.hasName('selectable')) {
			setSelectedIds([]);
			return;
		}

		const clickedId = e.target.id();

		// Do we pressed shift or ctrl?
		const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
		const isSelected = selectedIds.includes(clickedId);

		if (!metaPressed && !isSelected) {
			// If no key pressed and the node is not selected
			// select just one
			setSelectedIds([clickedId]);
		} else if (metaPressed && isSelected) {
			// If we pressed keys and node was selected
			// we need to remove it from selection
			setSelectedIds(selectedIds.filter(id => id !== clickedId));
		} else if (metaPressed && !isSelected) {
			// Add the node into selection
			setSelectedIds([...selectedIds, clickedId]);
		}
	};
	const handleTransformEnd = (e) => {
		// Find which rectangle(s) were transformed
		const nodes = transformerRef.current.nodes();

		const newRects = [...elements];

		// Update each transformed node
		nodes.forEach(node => {
			console.log("NODE", node)
			const id = node.id();
			const index = newRects.findIndex(r => r.id === id);

			if (index !== -1) {
				const scaleX = node.scaleX();
				const scaleY = node.scaleY();

				// Reset scale
				node.scaleX(1);
				node.scaleY(1);

				// Update the state with new values
				newRects[index] = {
					...newRects[index],
					x: node.x(),
					y: node.y(),
					width: Math.max(5, node.width() * scaleX),
					height: Math.max(node.height() * scaleY),
					rotation: node.rotation(),
					skewX: node.skewX(),
					skewY: node.skewY(),
				};
				handleUpdateElement(newRects[index])
			}
		});
	};
	const stageRef = useRef(null);
	const handleColorChange = useCallback((color) => {
		const updatedElements = elements.map(element => {
			if (element.id === selectedId) {
				const updatedElement = { ...element, fill: color.hex };
				handleUpdateElement(updatedElement);
				return updatedElement;
			}
			return element;
		});
		setElements(updatedElements);
	}, [elements, selectedId, handleUpdateElement]);
	const handleDelete = useCallback(() => {
		if (selectedId) handleDeleteElement(selectedId);
		setShowMenu(false);
		setSelectedIds([]);
	}, [selectedId, handleDeleteElement]);
	const getFormattedDateTime = () => {
		const now = new Date();

		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, '0'); // Месяцы 0-11
		const day = String(now.getDate()).padStart(2, '0');
		const hours = String(now.getHours()).padStart(2, '0');
		const minutes = String(now.getMinutes()).padStart(2, '0');
		const seconds = String(now.getSeconds()).padStart(2, '0');

		return `${day}-${month}-${String(year).slice(-2)}_${hours}-${minutes}-${seconds}`;
	};
	function timeout(delay) {
		return new Promise(res => setTimeout(res, delay));
	}
	const handleExport = async () => {
		setShowTextExport(false)
		await timeout(100);
		const stage = stageRef.current;
		stage.scale({ x: 1, y: 1 });

		// Получаем все элементы grouping
		const groupings = elements.filter(el => el.type === "grouping");

		// Находим группы элементов (исключая сами groupings)
		const groups = utils_export.findGroups(
			elements.filter(el => el.type !== "grouping"),
			groupings,
			50
		);
		console.log(groups)
		// return
		console.log(groups.filter(sas => sas.type === 'grouping'))
		// Собираем все элементы для документа
		const docChildren = [];
		for (const group of groups.filter(sas => sas.type === 'grouping')) {
			console.log(group)
			docChildren.push(
				new Paragraph({
					text: group.grouping.text,
					heading: HeadingLevel.HEADING_1,
					alignment: AlignmentType.CENTER,
				})
			);
			console.log(group.elements)
			for (const elem of group.elements) {
				console.log(elem)
				const hasText = elem.some(inv => inv.exportAsText);
				if (hasText) {
					for (const textElement of elem) {
						const lines = textElement.text.split('\n');
						for (const line of lines) {
							docChildren.push(
								new Paragraph({
									text: line,
									alignment: AlignmentType.LEFT,
								})
							);
						}
						// docChildren.push(new Paragraph({}));
					}
					continue;
				}

				// Получаем границы группы
				const dimensions = utils_export.getGroupBoundingBox(elem);
				console.log("dimensions", dimensions, elem)

				// Создаем изображение группы
				const image = await stageRef.current.toImage({
					pixelRatio: 2,
					x: dimensions.x + (stageRef.current?.attrs?.x ?? 0),
					y: dimensions.y + (stageRef.current?.attrs?.y ?? 0),
					width: dimensions.width,
					height: dimensions.height
				});

				const canvas = document.createElement('canvas');
				canvas.width = image.width;
				canvas.height = image.height;
				const ctx = canvas.getContext('2d');
				ctx.drawImage(image, 0, 0);

				const blob = await new Promise(resolve =>
					canvas.toBlob(resolve, 'image/png', 0.92)
				);

				const arrayBuffer = await blob.arrayBuffer();



				// Добавляем изображение
				docChildren.push(
					new Paragraph({
						children: [
							new ImageRun({
								type: 'png',
								data: arrayBuffer,
								transformation: {
									width: dimensions.width * 0.75,
									height: dimensions.height * 0.75,
								},
							})
						]
					})
				);
			}
		}
		const ungrouped = groups.filter(group => group.type === 'natural');
		console.log(ungrouped)
		if (ungrouped) {
			console.log("ungrouped")
			console.log(ungrouped)
			docChildren.push(
				new Paragraph({
					text: "Остальные",
					heading: HeadingLevel.HEADING_1,
					alignment: AlignmentType.CENTER,
				})
			);
			for (const group of ungrouped) {
				const hasText = group.elements.some(
					inv => inv.exportAsText
				);
				if (hasText) {
					for (const textElement of group.elements) {
						const lines = textElement.text.split('\n');
						for (const line of lines) {
							docChildren.push(
								new Paragraph({
									text: line,
									alignment: AlignmentType.LEFT,
								})
							);
						}
						// docChildren.push(new Paragraph({}));
					}
					continue;
				}
				const dimensions = utils_export.getGroupBoundingBox(group.elements);

				// Создаем изображение группы
				const image = await stageRef.current.toImage({
					pixelRatio: 2,
					x: dimensions.x + (stageRef.current?.attrs?.x ?? 0),
					y: dimensions.y + (stageRef.current?.attrs?.y ?? 0),
					width: dimensions.width,
					height: dimensions.height
				});

				const canvas = document.createElement('canvas');
				canvas.width = image.width;
				canvas.height = image.height;
				const ctx = canvas.getContext('2d');
				ctx.drawImage(image, 0, 0);

				const blob = await new Promise(resolve =>
					canvas.toBlob(resolve, 'image/png', 0.92)
				);

				const arrayBuffer = await blob.arrayBuffer();
				docChildren.push(
					new Paragraph({
						children: [
							new ImageRun({
								type: 'png',
								data: arrayBuffer,
								transformation: {
									width: dimensions.width * 0.75,
									height: dimensions.height * 0.75,
								},
							})
						]
					})
				);
			}
		}


		// Создаем документ только один раз в конце
		const doc = new Document({
			title: boardStore.currentTitle || "Document",
			styles: {
				default: {
					heading1: {
						run: {
							size: 32,
							bold: true,
							color: "000000",
							font: "Times New Roman",
						},
						paragraph: {
							spacing: {
								after: 120,
							},
						},
					},
					document: {
						paragraph: {
							spacing: {
								line: 360,
							},
						},
						run: {
							size: 32,
							font: "Times New Roman",
						},
					},


				},
			},
			sections: [{
				properties: {},
				children: docChildren
			}]
		});
		console.log(doc)
		// return
		// Экспортируем документ
		const docBlob = await Packer.toBlob(doc);
		const url = URL.createObjectURL(docBlob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `${boardStore.currentTitle || "Document"} ${getFormattedDateTime()}.docx`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
		setShowTextExport(true)
		// for (const group of groups) {
		// 	for (const elem of group.elements.flat()) {
		// 		elem.show()
		// 	}
		// }
	};
	const handleContextMenu = (e) => {
		console.log(e.target);
		e.evt.preventDefault();

		const stage = e.target.getStage();
		const containerRect = stage.container().getBoundingClientRect();
		const pointerPosition = stage.getPointerPosition();

		// Определяем, какие элементы будут показаны
		const showColorPicker = !e.target.hasName("image");
		const showDelete = e.target !== e.target.getStage();

		// Рассчитываем примерную высоту меню в зависимости от его содержимого
		const menuWidth = 250; // Ширина CirclePicker
		let menuHeight = 0;

		if (showColorPicker) {
			menuHeight += 320; // Высота CirclePicker + ChromePicker
		}
		if (showDelete) {
			menuHeight += 40; // Высота кнопки Delete
		}
		menuHeight += 20; // Добавляем отступы

		// Вычисляем позицию меню (начальная позиция)
		let x = containerRect.left + pointerPosition.x + 4;
		let y = containerRect.top + pointerPosition.y - 60;

		// Корректировка по горизонтали (если меню выходит за правый край)
		if (x + menuWidth > window.innerWidth) {
			x = window.innerWidth - menuWidth - 10; // 10px отступ от края
		}

		// Корректировка по вертикали
		if (y + menuHeight > window.innerHeight) {
			// Если не помещается снизу, показываем выше курсора
			y = containerRect.top + pointerPosition.y - menuHeight - 10;
		}
		if (y < 0) {
			// Если всё равно не помещается, прижимаем к верхнему краю
			y = 10;
		}

		// Устанавливаем состояние
		setMenuPosition({ x, y });
		setShowColorPicker(showColorPicker);
		setShowDelete(showDelete);
		setShowMenu(true);

		const targetId = e.target.hasName('selectable')
			? e.target?.id()
			: e.target?.getParent()?.id();
		setSelectedId(targetId);

		e.cancelBubble = true;
	};
	const handleMouseDown = (e) => {
		console.log(e.target)
		if (!selectedTool || (e.target !== e.target.getStage() && !e.target.hasName('ignore'))) return;
		if (isSpacePressed) return;

		if (selectedTool === 'eraser') {
			if (e.target === e.target.getStage()) return;

			const clickedElement = elements.find(el => el.id === e.target.id());
			if (clickedElement && clickedElement.type === 'brush') {
				handleDeleteElement(clickedElement.id);
			}
			return;
		}

		const stage = e.target.getStage();
		const pos = stage.getRelativePointerPosition();
		setStartPos(pos);
		setDrawing(true);

		// Для текста создаем элемент сразу
		if (selectedTool === 'text') {
			const newElement = {
				id: Date.now().toString(),
				boardId: numberBoardId,
				type: 'text',
				x: pos.x,
				y: pos.y,
				text: 'New Text',
				fill: selectedColor ?? '#000000',
				width: 100,
				height: 40,
				isDragging: false,
				onDragStart: handleDragStart,
				onDragEnd: handleDragEnd,
				exportAsText: true
			};
			handleCreateElement(newElement);
			setSelectedTool(null);
			setDrawing(false);
			return;
		}
		if (selectedTool === 'table') {
			const newElement = {
				id: Date.now().toString(),
				boardId: numberBoardId,
				type: 'table',
				x: pos.x,
				y: pos.y,
				data: {
					rows: 3,
					cols: 3,
					cells: Array(3).fill().map(() => Array(3).fill('')),
					colWidths: Array(3).fill(100),
					rowHeights: Array(3).fill(40)
				},
				isDragging: false,
			};
			handleCreateElement(newElement);
			setSelectedTool(null);
			return;
		}
		if (selectedTool === 'brush') {
			setTempElement({
				id: Date.now().toString(),
				type: 'brush',
				boardId: numberBoardId,
				points: [pos.x, pos.y],
				stroke: selectedColor.hex ?? selectedColor,
				strokeWidth: 5,
				isDragging: false,
			});
			return;
		}
		if (selectedTool === 'arrow') {
			setTempElement({
				id: Date.now().toString(),
				type: 'arrow',
				boardId: numberBoardId,
				x_start: pos.x,
				y_start: pos.y,
				x_end: pos.x,
				y_end: pos.y,
				fill: selectedColor.hex ?? selectedColor,
				isDragging: false,
				onDragStart: handleDragStart,
				onDragEnd: handleDragEnd,
			});
			return;
		}
		if (selectedTool === 'grouping') {
			const newElement = {
				id: Date.now().toString(),
				boardId: numberBoardId,
				type: 'grouping',
				x: pos.x,
				y: pos.y,
				width: 200,
				height: 100,
				text: 'Text',
				fill: '#ffffff',
				stroke: '#000000',
				isDragging: false,
				onDragStart: handleDragStart,
				onDragEnd: handleDragEnd,
			};
			handleCreateElement(newElement);
			setSelectedTool(null);
			return;
		}

		// Для других элементов создаем временный
		setTempElement({
			type: selectedTool,
			boardId: numberBoardId,
			x: pos.x,
			y: pos.y,
			width: 0,
			height: 0,
			isDragging: false,
			onDragStart: handleDragStart,
			onDragEnd: handleDragEnd,
			fill: selectedColor,
			stroke: '#2d3436',
		});
	};
	const handleMouseMove = (e) => {
		if (selectedTool === 'eraser') {
			// Если выбран ластик и мы перемещаем мышь с зажатой кнопкой
			if (e.evt.buttons !== 1) return; // Проверяем, что левая кнопка мыши нажата

			if (e.target === e.target.getStage()) return;

			const clickedElement = elements.find(el => el.id === e.target.id());
			if (clickedElement && clickedElement.type === 'brush') {
				handleDeleteElement(clickedElement.id);
			}
			return;
		}
		if (!drawing || !tempElement) return;

		const stage = e.target.getStage();
		const pos = stage.getRelativePointerPosition();
		const newWidth = pos.x - startPos.x;
		const newHeight = pos.y - startPos.y;

		if (selectedTool === 'brush') {
			setTempElement({
				...tempElement,
				points: [...tempElement.points, pos.x, pos.y],
			});
			return;
		}
		if (tempElement.type === 'arrow') {
			setTempElement({
				...tempElement,
				x_end: pos.x,
				y_end: pos.y,
				width: newWidth,
				height: newHeight,
			});
			console.log("SAS")
			return;
		}
		if (tempElement?.type === 'line') {
			setTempElement({
				...tempElement,
				points: [
					tempElement.points[0], // Начальная X
					tempElement.points[1], // Начальная Y
					pos.x, // Текущая X
					pos.y, // Текущая Y
				],
				width: newWidth,
				height: newHeight,
			});
			return;
		}
		else {
			setTempElement({
				...tempElement,
				width: pos.x - tempElement.x,
				height: pos.y - tempElement.y,
			});
		}
	};
	const handleMouseUp = () => {
		if (!drawing || !tempElement) return;
		console.log("handleMouseUp", tempElement)

		if (selectedTool === 'brush') {
			let minX = Infinity;
			let maxX = -Infinity;
			let minY = Infinity;
			let maxY = -Infinity;

			// Проходим по всем точкам и находим min/max
			for (let i = 0; i < tempElement.points.length; i += 2) {
				const x = tempElement.points[i];
				const y = tempElement.points[i + 1];

				if (x < minX) minX = x;
				if (x > maxX) maxX = x;
				if (y < minY) minY = y;
				if (y > maxY) maxY = y;
			}

			// Рассчитываем параметры
			const x = minX;
			const y = minY;
			const width = maxX - minX;
			const height = maxY - minY;

			if (tempElement.points.length > 2) {
				handleCreateElement({
					...tempElement,
					x: x,
					y: y,
					width: width,
					height: height
				});
			}
			setTempElement(null);
		}

		if (Math.abs(tempElement.width) > 5 && Math.abs(tempElement.height) > 5) {
			const newElement = {
				...tempElement,
				id: Date.now().toString(), // Генерируем новый ID
				isDragging: false,
			};
			handleCreateElement(newElement);

		}
		setDrawing(false);
		setTempElement(null);
		// setSelectedTool("");
	};
	const handleWheel = (e) => {
		e.evt.preventDefault();

		const stage = stageRef.current;
		const oldScale = stage.scaleX();
		const pointer = stage.getPointerPosition();

		const mousePointTo = {
			x: (pointer.x - stage.x()) / oldScale,
			y: (pointer.y - stage.y()) / oldScale,
		};

		// how to scale? Zoom in? Or zoom out?
		let direction = e.evt.deltaY > 0 ? -1 : 1;

		// when we zoom on trackpad, e.evt.ctrlKey is true
		// in that case lets revert direction
		if (e.evt.ctrlKey) {
			direction = -direction;
		}

		const scaleBy = 1.25;
		const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;

		stage.scale({ x: newScale, y: newScale });

		const newPos = {
			x: pointer.x - mousePointTo.x * newScale,
			y: pointer.y - mousePointTo.y * newScale,
		};
		stage.position(newPos);
	};
	const handleDragOver = useCallback((e) => {
		e.preventDefault();
		setIsDraggingOver(true);
	}, []);

	const handleDragLeave = useCallback((e) => {
		e.preventDefault();
		setIsDraggingOver(false);
	}, []);

	const handleDrop = useCallback(async (e) => {
		e.preventDefault();
		console.log("Dropping")
		setIsDraggingOver(false);

		const stage = stageRef.current;
		stage.setPointersPositions(e);
		const pos = stage.getPointerPosition();
		console.log("pos", pos)
		const files = e.dataTransfer.files;

		if (files.length === 0) return;
		console.log(files[0])

		const file = files[0];
		if (file.type.startsWith('text/plain')) {
			try {
				const fileContent = await file.text();
				const newElement = {
					id: `text-${Date.now()}`,
					boardId: numberBoardId,
					type: 'text',
					x: pos.x,
					y: pos.y,
					text: fileContent,
					width: 700,
					height: 40,
					fill: '#000000',
					isDragging: false,
					exportAsText: true
				};
				console.log("Created text element from file:", newElement);
				handleCreateElement(newElement);
			} catch (error) {
				console.error('Error reading text file:', error);
				alert('Failed to read text file');
			}
			return;
		};
		if (file.type.startsWith('image/')) {
			try {
				const formData = new FormData();
				formData.append('image', file);

				const response = await fetch('http://45.143.92.185:8080/upload', {
					method: 'POST',
					body: formData,
					credentials: 'include',
				});

				if (!response.ok) throw new Error('Upload failed');

				const { url, width, height } = await response.json();
				const maxDimension = 500; // Максимальный размер по любой из сторон
				let scaledWidth = width;
				let scaledHeight = height;
				if (width > height && width > maxDimension) {
					const scale = maxDimension / width;
					scaledWidth = maxDimension;
					scaledHeight = Math.round(height * scale);
				} else if (height > maxDimension) {
					const scale = maxDimension / height;
					scaledHeight = maxDimension;
					scaledWidth = Math.round(width * scale);
				}

				const newElement = {
					id: `img-${Date.now()}`,
					boardId: numberBoardId,
					type: 'image',
					x: pos.x,
					y: pos.y,
					width: scaledWidth,
					height: scaledHeight,
					imageUrl: url,
					isDragging: false,
				};
				console.log("pos", newElement.x, newElement.y)

				handleCreateElement(newElement);
			} catch (error) {
				console.error('Upload error:', error);
				alert('Failed to upload image');
			}
		}

	}, [numberBoardId, handleCreateElement]);
	return (
		<div
			onDragOver={handleDragOver}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
			style={{ position: 'relative' }}
		>
			<div className="toolbar">
				<button
					onClick={() => setSelectedTool('arrow')}
					style={{ background: selectedTool === 'arrow' ? '#ddd' : '#fff' }}
				>
					🢂 Arrow
				</button>
				<button
					onClick={() => setSelectedTool('text')}
					style={{ background: selectedTool === 'text' ? '#ddd' : '#fff' }}
				>
					T Text
				</button>
				<button
					onClick={() => setSelectedTool('rect')}
					style={{ background: selectedTool === 'rect' ? '#ddd' : '#fff' }}
				>
					▭ Rectangle
				</button>
				<button
					onClick={() => setSelectedTool('brush')}
					style={{ background: selectedTool === 'brush' ? '#ddd' : '#fff' }}
				>
					✏️ Brush
				</button>
				<button
					onClick={() => setSelectedTool('eraser')}
					style={{ background: selectedTool === 'eraser' ? '#ddd' : '#fff' }}
				>
					🧽 Eraser
				</button>
				<button
					onClick={() => setSelectedTool('table')}
					style={{ background: selectedTool === 'table' ? '#ddd' : '#fff' }}
				>
					🏷 Table
				</button>
				<button
					onClick={() => setSelectedTool('grouping')}
					style={{ background: selectedTool === 'grouping' ? '#ddd' : '#fff' }}
				>
					▭ Group
				</button>
				<button onClick={handleExport}>📤 Export</button>
			</div>
			{isDraggingOver && (
				<div style={{
					position: 'absolute',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					backgroundColor: 'rgba(0,255,0,0.2)',
					zIndex: 1000,
					pointerEvents: 'none'
				}} />
			)}
			<Stage
				width={window.innerWidth}
				height={window.innerHeight}
				draggable={isSpacePressed}
				onClick={handleStageClick}
				ref={stageRef}
				style={{
					cursor: isSpacePressed ? 'grab' : selectedTool ? 'crosshair' : 'default'
				}}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onContextMenu={handleContextMenu}
				onWheel={handleWheel}
			>
				<Layer>

					{showTextExport && elements.map((element) =>
						element.type === "grouping" ? (
							<Grouping
								key={element.id}
								element={element}
								onDragStart={handleDragStart}
								onDragEnd={handleDragEnd}
								rectRefs={rectRefs}
								onUpdateElement={handleUpdateElement}
							/>
						) :
							null
					)}
					{elements.map((element) =>
						element.type === "text" && (showTextExport || !element.exportAsText) ? (
							<EditableText key={element.id} element={element} onDragEnd={handleDragEnd} onDragStart={handleDragStart} rectRefs={rectRefs} transformerRef={transformerRef} onUpdateElement={handleUpdateElement} />
						) : element.type === "rect" ? (
							<RectangleElement key={element.id} element={element} onDragEnd={handleDragEnd} onDragStart={handleDragStart} rectRefs={rectRefs} />
						) : element.type === "arrow" ? (
							<EdgeArrow key={element.id} element={element} onDragEnd={handleDragEndArrow} onDragStart={handleDragStart} rectRefs={rectRefs} />
						) : element.type === "image" ? (
							<ImageElement key={element.id} element={element} onDragEnd={handleDragEnd} onDragStart={handleDragStart} rectRefs={rectRefs} />
						) : element.type === "line" ? (
							<LineElement key={element.id} element={element} onDragEnd={handleDragEnd} onDragStart={handleDragStart} rectRefs={rectRefs} />
						) : element.type === "brush" ? (
							<BrushElement key={element.id} element={element} onDragEnd={handleDragEnd} onDragStart={handleDragStart} rectRefs={rectRefs} />
						) : element.type === "table" ? (
							<TableElement
								key={element.id}
								element={element}
								onDragStart={handleDragStart}
								onDragEnd={handleDragEnd}
								rectRefs={rectRefs}
								onUpdateElement={handleUpdateElement}
								isSelected={selectedIds.includes(element.id)}
								onSelect={() => setSelectedIds([element.id])}
							/>
						) :
							null
					)}
					{drawing && tempElement && (
						tempElement.type === 'rect' ? (
							<Rect
								x={tempElement.x}
								y={tempElement.y}
								width={tempElement.width}
								height={tempElement.height}
								fill={tempElement.fill}
								stroke={tempElement.stroke}
								strokeWidth={2}
							/>
						) : tempElement.type === 'arrow' ? (
							<EdgeArrow
								element={{
									...tempElement,
									x_start: tempElement.x_start,
									y_start: tempElement.y_start,
									x_end: tempElement.x_end,
									y_end: tempElement.y_end,
								}}
								onDragEnd={() => { }}
								onDragStart={() => { }}
								rectRefs={{ current: new Map() }}
								onUpdateElement={() => { }}
							/>
						) : tempElement.type === 'brush' ? (
							<Line
								points={tempElement.points}
								stroke={tempElement.stroke}
								strokeWidth={tempElement.strokeWidth}
								tension={0.5}
								lineCap="round"
								lineJoin="round"
							/>
						) : null
					)}
					<Transformer
						ref={transformerRef}
						boundBoxFunc={(oldBox, newBox) => {
							// Limit resize
							if (newBox.width < 20 && newBox.height < 20) {
								return oldBox;
							}
							if (newBox.width < 20) {
								return { ...newBox, width: 20 };
							}
							if (newBox.height < 20) {
								return { ...newBox, height: 20 };
							}
							return newBox;
						}}
						onTransformEnd={handleTransformEnd}
					/>
				</Layer>
			</Stage>
			{/* Context Menu */}
			{showMenu && (
				<ContextMenu
					position={menuPosition}
					selectedColor={selectedColor}
					setSelectedColor={setSelectedColor}
					onColorChange={handleColorChange}
					onDelete={handleDelete}
					showColorPicker={showColorPicker}
					showDelete={showDelete}
					onClose={() => setShowMenu(false)}
					showExportToggle={selectedId && elements.find(el => el.id === selectedId)?.type === 'text'}
					exportAsText={selectedId ? elements.find(el => el.id === selectedId)?.exportAsText : false}
					onToggleExportAsText={() => {
						const updatedElements = elements.map(element => {
							if (element.id === selectedId) {
								const updatedElement = {
									...element,
									exportAsText: !element.exportAsText
								};
								handleUpdateElement(updatedElement);
								return updatedElement;
							}
							return element;
						});
						setElements(updatedElements);
					}}
				/>
			)}
		</div>
	);
})
export default Board