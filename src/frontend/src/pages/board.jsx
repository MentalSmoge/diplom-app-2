import React, { useEffect, useState, useRef } from "react";
import { Stage, Layer, Text, Rect, Transformer } from "react-konva";
import { socket } from "../socket";
import { useParams, useNavigate } from "react-router-dom";
import { checkBoardAccess } from "../api/auth";
import EditableText from "../components/board_components/text";


export function Board() {
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
			console.log("element-created:", element);
			setElements((prev) => [...prev, element]);
		};

		const handleElementUpdated = (element) => {
			console.log("element-updated:", element);
			setElements((prev) =>
				prev.map((el) => (el.id === element.id ? element : el))
			);
		};

		const handleElementDeleted = (elementId) => {
			console.log("element-deleted:", elementId);
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

	const deleteRectangle = (elementId) => {
		handleDeleteElement(elementId);
	};

	const paintRectangle = (element) => {
		const updatedElement = {
			id: element.id,
			boardId: boardId,
			type: "rect",
			x: element.x,
			y: element.y,
			width: 150,
			height: 150,
			fill: "blue",
			isDragging: false,
		};
		handleUpdateElement(updatedElement);
	};

	const printDebugElements = () => {
		socket.emit("debug-print-elements");
	};

	const handleDragStart = (e) => {
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
		console.log(selectedIds)
		if (selectionRectangle.visible) {
			return;
		}

		// If click on empty area - remove all selections
		if (e.target === e.target.getStage()) {
			setSelectedIds([]);
			return;
		}
		console.log(e.target.getName())

		// Do nothing if clicked NOT on our rectangles
		if (!e.target.hasName('selectable')) {
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
	return (
		<div>
			<div>Current Board: {boardId}</div>
			<button onClick={addRectangle}>Add Rectangle</button>
			<button onClick={() => deleteRectangle(elements[0]?.id)}>
				Delete Rectangle
			</button>
			<button
				onClick={() =>
					paintRectangle(
						elements[Math.floor(Math.random() * elements.length)]
					)
				}
			>
				Paint Rectangle
			</button>
			<button onClick={() => printDebugElements()}>
				Debug all Elements
			</button>
			<Stage width={window.innerWidth} height={window.innerHeight} draggable={true}
				onClick={handleStageClick}>
				<Layer>
					{elements.map((element) =>
						element.type === "text" ? (
							<Text key={element.id} {...element} />
						) : element.type === "rect" ? (
							<Rect
								key={element.id}
								id={element.id}
								x={element.x}
								y={element.y}
								fill={element.fill}
								height={element.height}
								width={element.width}
								draggable
								shadowColor="black"
								shadowBlur={10}
								shadowOpacity={0.6}
								shadowOffsetX={element.isDragging ? 10 : 5}
								shadowOffsetY={element.isDragging ? 10 : 5}
								scaleX={element.isDragging ? 1.2 : 1}
								scaleY={element.isDragging ? 1.2 : 1}
								onDragStart={handleDragStart}
								onDragEnd={handleDragEnd}
								name="selectable"
								ref={node => {
									if (node) {
										rectRefs.current.set(element.id, node);
									}
								}}
							/>
						) : null
					)}
					<Transformer
						ref={transformerRef}
						boundBoxFunc={(oldBox, newBox) => {
							// Limit resize
							if (newBox.width < 5 || newBox.height < 5) {
								return oldBox;
							}
							return newBox;
						}}
					/>
					<EditableText />
				</Layer>

			</Stage>
		</div>
	);
}
