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
import "./Toolbar.css"

const Board = observer(() => {
	const { boardId } = useParams(); // Получаем ID доски из URL
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
	const navigate = useNavigate();

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
	// useEffect(() => {
	// 	// if (effectRan.current === true) { return }
	// 	console.log("Connecting")
	// 	console.log(isConnected)
	// 	// const handleWindowClick = () => {
	// 	// 	setShowMenu(false);
	// 	// };
	// 	// window.addEventListener('click', handleWindowClick);
	// 	const onConnect = () => {
	// 		setIsConnected(true);
	// 		socket.emit("join-board", boardId);
	// 		console.log("emitting")
	// 	};
	// 	const onDisconnect = () => {
	// 		console.log("disconnecting")
	// 		setIsConnected(false);
	// 	};
	// 	socket.on("connect", onConnect);
	// 	socket.on("disconnect", onDisconnect);
	// 	// if (!isConnected) {
	// 	// 	console.log("wait im not connected", socket)
	// 	// 	socket.connect();
	// 	// }
	// 	if (socket.disconnected) {
	// 		socket.connect();
	// 		console.log("wait im not connected", socket)
	// 	}
	// 	const handleBoardState = (serverElements) => {
	// 		console.log("board stating", serverElements)
	// 		setElements(serverElements);
	// 	};

	// 	const handleElementCreated = (element) => {
	// 		console.log("handleElementCreated")
	// 		setElements((prev) => [...prev, element]);
	// 	};

	// 	const handleElementUpdated = (element) => {
	// 		console.log("Изменился")
	// 		setElements((prev) =>
	// 			prev.map((el) => (el.id === element.id ? element : el))
	// 		);
	// 	};

	// 	const handleElementDeleted = (elementId) => {
	// 		setElements((prev) => prev.filter((el) => el.id !== elementId));
	// 	};

	// 	socket.on("board-state", handleBoardState);
	// 	socket.on("element-created", handleElementCreated);
	// 	socket.on("element-updated", handleElementUpdated);
	// 	socket.on("element-deleted", handleElementDeleted);
	// 	if (selectedIds.length && transformerRef.current) {
	// 		// Get the nodes from the refs Map
	// 		const nodes = selectedIds
	// 			.map(id => rectRefs.current.get(id))
	// 			.filter(node => node);
	// 		// console.log(elements)
	// 		transformerRef.current.nodes(nodes);
	// 	} else if (transformerRef.current) {
	// 		// Clear selection
	// 		transformerRef.current.nodes([]);
	// 	}
	// 	// connectToBoard()
	// 	// Проверяем аутентификацию при загрузке компонента
	// 	const getAccessLevel = async () => {
	// 		const isAuthenticated = await checkBoardAccess(numberBoardId);
	// 		if (isAuthenticated === null) {
	// 			navigate('/login');
	// 			return;
	// 		}
	// 		if (isAuthenticated.data === 0) {
	// 			navigate('/login');
	// 			return;
	// 		}
	// 		console.log("all good, connecting", isAuthenticated.data)
	// 		// connectToBoard(isAuthenticated.data)
	// 	};
	// 	getAccessLevel();
	// 	return () => {
	// 		effectRan.current = true;
	// 		console.log("Disconnecting socket...");
	// 		socket.off("connect", onConnect);
	// 		socket.off("disconnect", onDisconnect);
	// 		socket.off("board-state", handleBoardState);
	// 		socket.off("element-created", handleElementCreated);
	// 		socket.off("element-updated", handleElementUpdated);
	// 		socket.off("element-deleted", handleElementDeleted);
	// 		socket.emit("leave-board", numberBoardId);
	// 		window.removeEventListener('click', handleWindowClick);
	// 		socket.disconnect(); // Отключаем сокет
	// 	};
	// }, [boardId, navigate, selectedIds]);

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
			boardId: numberBoardId,
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
			boardId: numberBoardId,
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
			boardId: numberBoardId,
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

	const handleDelete = () => {
		if (selectedId) handleDeleteElement(selectedId);
		setShowMenu(false);

		setSelectedIds([]);
	};
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
	const handleContextMenu = (e) => {
		e.evt.preventDefault();
		if (e.target === e.target.getStage()) {
			return;
		}

		const stage = e.target.getStage();
		const containerRect = stage.container().getBoundingClientRect();
		const pointerPosition = stage.getPointerPosition();

		setMenuPosition({
			x: containerRect.left + pointerPosition.x + 4,
			y: containerRect.top + pointerPosition.y + 4
		});

		setShowMenu(true);
		setSelectedId(e.target.id());
		e.cancelBubble = true;
	};
	const handleMouseDown = (e) => {
		if (!selectedTool || e.target !== e.target.getStage()) return;

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
				width: 100,
				height: 40,
				isDragging: false,
				onDragStart: handleDragStart,
				onDragEnd: handleDragEnd,
			};
			handleCreateElement(newElement);
			setSelectedTool(null);
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
				isDragging: false,
				onDragStart: handleDragStart,
				onDragEnd: handleDragEnd,
			});
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
			fill: '#e55039', // Цвет по умолчанию
			stroke: '#2d3436',
		});
	};
	const handleMouseMove = (e) => {
		if (!drawing || !tempElement) return;

		const stage = e.target.getStage();
		const pos = stage.getRelativePointerPosition();
		const newWidth = pos.x - startPos.x;
		const newHeight = pos.y - startPos.y;

		if (tempElement.type === 'arrow') {
			setTempElement({
				...tempElement,
				x_end: pos.x,
				y_end: pos.y,
				width: newWidth,
				height: newHeight,
			});
		} else {
			setTempElement({
				...tempElement,
				width: pos.x - tempElement.x,
				height: pos.y - tempElement.y,
			});
		}
	};
	const handleMouseUp = () => {
		if (!drawing || !tempElement) return;
		console.log(tempElement)

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
		setSelectedTool("");
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
	return (
		<div>
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
				<button onClick={handleExport}>📤 Export</button>
			</div>
			{/* <div>Current Board: {boardId}</div> */}
			{/* <button onClick={addArrow}>Add Arrow</button>
			<button onClick={addText}>Add Text</button>
			<button onClick={addRectangle}>Add Rectangle</button>
			<button onClick={() => deleteRectangle(elements[0]?.id)}>
				Delete Rectangle
			</button>
			<button onClick={handleExport} style={{ marginBottom: '10px' }}>
				Export to document
			</button> */}
			<Stage
				width={window.innerWidth}
				height={window.innerHeight}
				draggable={true}
				onClick={handleStageClick}
				ref={stageRef}
				style={{ cursor: selectedTool ? 'crosshair' : 'default' }}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onContextMenu={handleContextMenu}
				onWheel={handleWheel}
			>
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
				<div
					style={{
						position: 'fixed',
						top: menuPosition.y,
						left: menuPosition.x,
						width: '60px',
						backgroundColor: 'white',
						boxShadow: '0 0 5px grey',
						borderRadius: '3px',
						zIndex: 10
					}}
					onClick={(e) => e.stopPropagation()}
				>
					<button
						style={{
							width: '100%',
							backgroundColor: 'white',
							border: 'none',
							margin: 0,
							padding: '10px',
							cursor: 'pointer'
						}}
						onMouseOver={(e) => e.target.style.backgroundColor = 'lightgray'}
						onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
						onClick={handleDelete}
					>
						Delete
					</button>
				</div>
			)}
		</div>
	);
})
export default Board