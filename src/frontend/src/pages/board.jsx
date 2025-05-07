import React, { useEffect, useState, useRef } from "react";
import { Stage, Layer, Text, Rect, Transformer } from "react-konva";
import { socket } from "../socket";
import { useParams, useNavigate } from "react-router-dom";
import { checkBoardAccess } from "../api/auth";
import EditableText from "../components/board_components/text";
import { RectangleElement } from "../components/board_components/rect";
import EdgeArrow from "../components/board_components/arrow";
import { observer } from "mobx-react";


const Board = observer(() => {
	const { boardId } = useParams(); // Получаем ID доски из URL
	const [elements, setElements] = useState([]);
	const [selectedIds, setSelectedIds] = useState([]);
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
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();
	const connectToBoard = () => {
		const onConnect = () => {
			setIsConnected(true);
			socket.emit("join-board", boardId);
		};
		const onDisconnect = () => {
			setIsConnected(false);
		};
		socket.on("connect", onConnect);
		socket.on("disconnect", onDisconnect);
		if (!isConnected) {
			socket.connect();
		}

		const handleBoardState = (serverElements) => {
			setElements(serverElements);
		};

		const handleElementCreated = (element) => {
			setElements((prev) => [...prev, element]);
		};

		const handleElementUpdated = (element) => {
			setElements((prev) =>
				prev.map((el) => (el.id === element.id ? element : el))
			);
		};

		const handleElementDeleted = (elementId) => {
			setElements((prev) => prev.filter((el) => el.id !== elementId));
		};

		socket.on("board-state", handleBoardState);
		socket.on("element-created", handleElementCreated);
		socket.on("element-updated", handleElementUpdated);
		socket.on("element-deleted", handleElementDeleted);

		return () => {
			// Отписываемся от всех событий при размонтировании
			socket.off("connect", onConnect);
			socket.off("disconnect", onDisconnect);
			socket.off("board-state", handleBoardState);
			socket.off("element-created", handleElementCreated);
			socket.off("element-updated", handleElementUpdated);
			socket.off("element-deleted", handleElementDeleted);
			socket.emit("leave-board", boardId);
		};
	}

	const effectRan = useRef(false)
	useEffect(() => {
		if (selectedIds.length && transformerRef.current) {
			// Get the nodes from the refs Map
			const nodes = selectedIds
				.map(id => rectRefs.current.get(id))
				.filter(node => node);
			// console.log(elements)
			transformerRef.current.nodes(nodes);
		} else if (transformerRef.current) {
			// Clear selection
			transformerRef.current.nodes([]);
		}
		if (effectRan.current === true) { return }
		// Проверяем аутентификацию при загрузке компонента
		const getAccessLevel = async () => {
			const isAuthenticated = await checkBoardAccess(parseInt(boardId));
			if (isAuthenticated === null) {
				navigate('/login');
				return;
			}
			if (isAuthenticated.data === 0) {
				navigate('/login');
				return;
			}
			connectToBoard(isAuthenticated.data)
		};
		getAccessLevel();
		return () => {
			effectRan.current = true;
		};


	}, [boardId, navigate, selectedIds]);

	const handleCreateElement = (element) => {
		console.log(isConnected)
		console.log(element)
		socket.emit("element-create", { boardId, element });
	};

	const handleUpdateElement = (element) => {
		socket.emit("element-update", { boardId, element });
	};

	const handleDeleteElement = (elementId) => {
		socket.emit("element-delete", { boardId, elementId });
	};

	const addRectangle = () => {
		const newElement = {
			id: Date.now().toString(),
			boardId: boardId,
			type: "rect",
			x: 100,
			y: 100,
			width: 100,
			height: 100,
			fill: "red",
			isDragging: false,
			onDragStart: handleDragStart,
			onDragEnd: handleDragEnd,
		};
		handleCreateElement(newElement);
	};
	const addText = () => {
		const newElement = {
			id: Date.now().toString(),
			boardId: boardId,
			type: "text",
			text: "Enter text...",
			x: 100,
			y: 100,
			width: 100,
			height: 100,
			isDragging: false,
			onDragStart: handleDragStart,
			onDragEnd: handleDragEnd,
		};
		handleCreateElement(newElement);
	};
	const addArrow = () => {
		const newElement = {
			id: Date.now().toString(),
			boardId: boardId,
			type: "arrow",
			x_start: 100,
			y_start: 100,
			x_end: 200,
			y_end: 200,
			isDragging: false,
			onDragStart: handleDragStart,
			onDragEnd: handleDragEnd,
		};
		handleCreateElement(newElement);
	};


	const deleteRectangle = (elementId) => {
		if (elementId) handleDeleteElement(elementId);
	};

	const printDebugElements = () => {
		socket.emit("debug-print-elements");
	};

	const handleDragStart = (e) => {
		console.log(e.target)
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
	function getGroupBoundingBox(group) {
		if (group.length === 0) return null;

		// Находим минимальные и максимальные X и Y
		let minX = Infinity;
		let minY = Infinity;
		let maxX = -Infinity;
		let maxY = -Infinity;

		group.forEach(obj => {
			let x, y, width, height;

			// Определяем bounding box в зависимости от типа объекта
			if (obj.type === "rect") {
				x = obj.x;
				y = obj.y;
				width = obj.width;
				height = obj.height;
			} else if (obj.type === "arrow") {
				x = Math.min(obj.x_start, obj.x_end);
				y = Math.min(obj.y_start, obj.y_end);
				width = Math.abs(obj.x_end - obj.x_start);
				height = Math.abs(obj.y_end - obj.y_start);
			} else if (obj.type === "text") {
				x = obj.x;
				y = obj.y;
				width = obj.width;
				height = obj.height;
			}
			// Добавьте другие типы объектов при необходимости

			// Обновляем min/max значения
			minX = Math.min(minX, x);
			minY = Math.min(minY, y);
			maxX = Math.max(maxX, x + width);
			maxY = Math.max(maxY, y + height);
		});

		// Возвращаем общий bounding box
		return {
			x: minX,
			y: minY,
			width: maxX - minX,
			height: maxY - minY,
		};
	}
	const handleExport = () => {
		console.log(stageRef)
		const groups = findGroups(elements, 50); // threshold = 5

		console.log(groups[0]);
		console.log(groups[0].map(({ id }) => ({ id })));
		// export_transformerRef.current.nodes(groups[0].map(obj => obj.id))
		// console.log(export_transformerRef.current, "SASSSS")
		// console.log(export_transformerRef.current.nodes(), "SASSSS")
		groups.forEach(element => {
			// console.log(element.map(({ id }) => ({ id })))
			// export_transformerRef.current.nodes(element.map(({ id }) => ({ id })))
			// console.log(export_transformerRef.current, "SASSSS")
			const dimensions = getGroupBoundingBox(element)
			console.log(dimensions)
			const dataURL = stageRef.current.toDataURL({
				pixelRatio: 2,
				x: dimensions.x + (stageRef.current?.attrs?.x ?? 0), y: dimensions.y + (stageRef.current?.attrs?.y ?? 0), width: dimensions.width, height: dimensions.height
			});
			console.log(stageRef.current)
			console.log({
				pixelRatio: 2,
				x: dimensions.x + stageRef.current.attrs.x, y: dimensions.y + stageRef.current.attrs.y, width: dimensions.width, height: dimensions.height
			})

			const link = document.createElement('a');
			link.download = 'stage.png';
			link.href = dataURL;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		});

	};
	function getBoundingBox(obj) {
		if (obj.type === "arrow") {
			return {
				x: Math.min(obj.x_start, obj.x_end),
				y: Math.min(obj.y_start, obj.y_end),
				width: Math.abs(obj.x_end - obj.x_start),
				height: Math.abs(obj.y_end - obj.y_start),
			};
		}
		return {
			x: obj.x,
			y: obj.y,
			width: obj.width,
			height: obj.height,
		};
	}
	function doRectanglesOverlap(rect1, rect2, threshold = 0) {
		const box1 = getBoundingBox(rect1);
		const box2 = getBoundingBox(rect2);

		if (!box1 || !box2) return false;

		return (
			box1.x < box2.x + box2.width + threshold &&
			box1.x + box1.width + threshold > box2.x &&
			box1.y < box2.y + box2.height + threshold &&
			box1.y + box1.height + threshold > box2.y
		);
	}
	function findGroups(objects, threshold = 0) {
		const groups = [];
		const visited = new Set();

		for (const obj of objects) {
			if (visited.has(obj.id)) continue;

			const queue = [obj];
			const currentGroup = [];

			while (queue.length > 0) {
				const current = queue.shift();
				if (visited.has(current.id)) continue;

				visited.add(current.id);
				currentGroup.push(current);

				// Ищем соседей
				for (const other of objects) {
					if (
						other.id !== current.id &&
						!visited.has(other.id) &&
						doRectanglesOverlap(current, other, threshold)
					) {
						queue.push(other);
					}
				}
			}

			if (currentGroup.length > 0) {
				groups.push(currentGroup);
			}
		}

		return groups;
	}
	return (
		<div>
			<div>Current Board: {boardId}</div>
			<button onClick={addArrow}>Add Arrow</button>
			<button onClick={addText}>Add Text</button>
			<button onClick={addRectangle}>Add Rectangle</button>
			<button onClick={() => deleteRectangle(elements[0]?.id)}>
				Delete Rectangle
			</button>
			<button onClick={handleExport} style={{ marginBottom: '10px' }}>
				Save as High Quality Image
			</button>
			<button onClick={() => printDebugElements()}>
				Debug all Elements
			</button>
			<Stage width={window.innerWidth} height={window.innerHeight} draggable={true}
				onClick={handleStageClick} ref={stageRef}>
				<Layer>
					{elements.map((element) =>
						element.type === "text" ? (
							<EditableText key={element.id} element={element} onDragEnd={handleDragEnd} onDragStart={handleDragStart} rectRefs={rectRefs} transformerRef={transformerRef} onUpdateElement={handleUpdateElement} />
						) : element.type === "rect" ? (
							<RectangleElement key={element.id} element={element} onDragEnd={handleDragEnd} onDragStart={handleDragStart} rectRefs={rectRefs} />
						) : element.type === "arrow" ? (
							<EdgeArrow key={element.id} element={element} onDragEnd={handleDragEndArrow} onDragStart={handleDragStart} rectRefs={rectRefs} />
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
					{/* <EditableText /> */}
				</Layer>

			</Stage>
		</div>
	);
})
export default Board