import React, { useEffect, useState, useRef } from "react";
import { Stage, Layer, Text, Rect, Transformer } from "react-konva";
import { socket } from "../socket";
import { useParams, useNavigate } from "react-router-dom";
import { checkBoardAccess } from "../api/auth";
import EditableText from "../components/board_components/text";
import { RectangleElement } from "../components/board_components/rect";
import EdgeArrow from "../components/board_components/arrow";
import { observer } from "mobx-react";
import { Document, Paragraph, ImageRun, Packer, HeadingLevel } from "docx";
import * as utils_export from "../utils/utils_export"


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


		return () => {
			// Отписываемся от всех событий при размонтировании
		};
	}

	const effectRan = useRef(false)
	useEffect(() => {
		console.log("Connecting")
		console.log(isConnected)
		const onConnect = () => {
			setIsConnected(true);
			socket.emit("join-board", boardId);
			console.log("emitting")
		};
		const onDisconnect = () => {
			console.log("disconnecting")
			setIsConnected(false);
		};
		socket.on("connect", onConnect);
		socket.on("disconnect", onDisconnect);
		// if (!isConnected) {
		// 	console.log("wait im not connected", socket)
		// 	socket.connect();
		// }
		if (socket.disconnected) {
			socket.connect();
			console.log("wait im not connected", socket)
		}
		const handleBoardState = (serverElements) => {
			console.log("board stating", serverElements)
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
		// if (effectRan.current === true) { return }
		// connectToBoard()
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
			console.log("all good, connecting", isAuthenticated.data)
			// connectToBoard(isAuthenticated.data)
		};
		getAccessLevel();
		return () => {
			effectRan.current = true;
			console.log("Disconnecting socket...");
			socket.off("connect", onConnect);
			socket.off("disconnect", onDisconnect);
			socket.off("board-state", handleBoardState);
			socket.off("element-created", handleElementCreated);
			socket.off("element-updated", handleElementUpdated);
			socket.off("element-deleted", handleElementDeleted);
			socket.emit("leave-board", boardId);
			socket.disconnect(); // Отключаем сокет
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

	const handleExport = async () => {
		const groups = utils_export.findGroups(elements, 50);
		const imageRuns = [];
		for (const element of groups) {
			const dimensions = utils_export.getGroupBoundingBox(element)
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
			console.log(arrayBuffer)
			imageRuns.push(
				new ImageRun({
					type: 'png',
					data: arrayBuffer,
					transformation: {
						width: dimensions.width * 0.75,
						height: dimensions.height * 0.75,
					},
				})
			);
		};
		const doc = new Document({
			sections: [{
				properties: {},
				children: imageRuns.map(imageRun =>
					new Paragraph({ children: [imageRun] })
				)
			}]
		});
		const docBlob = await Packer.toBlob(doc);
		const url = URL.createObjectURL(docBlob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'konva-export.docx';
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

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
				Export to document
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
				</Layer>
			</Stage>
		</div>
	);
})
export default Board