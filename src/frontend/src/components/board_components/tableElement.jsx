import { Group, Rect, Text, Transformer } from 'react-konva';
import { useEffect, useRef, useState } from 'react';
import EditableText from './text';

const TableElement = ({
    element,
    onDragStart,
    onDragEnd,
    rectRefs,
    onUpdateElement,
    isSelected,
    onSelect
}) => {
    const [data, setData] = useState(element.data || {
        rows: 3,
        cols: 3,
        cells: Array(3).fill().map(() => Array(3).fill('')),
        colWidths: Array(3).fill(100),
        rowHeights: Array(3).fill(40)
    });
    const [isEditing, setIsEditing] = useState(false);
    const groupRef = useRef();
    const trRef = useRef();

    useEffect(() => {
        if (isSelected && trRef.current && groupRef.current) {
            trRef.current.nodes([groupRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    const handleCellChange = (row, col, value) => {
        const newCells = [...data.cells];
        newCells[row][col] = value;
        const newData = { ...data, cells: newCells };
        setData(newData);
        onUpdateElement({ ...element, data: newData });
    };

    const addRow = () => {
        const newRowHeights = [...data.rowHeights, 40];
        const newCells = [...data.cells, Array(data.cols).fill('')];
        const newData = {
            ...data,
            rows: data.rows + 1,
            rowHeights: newRowHeights,
            cells: newCells
        };
        setData(newData);
        onUpdateElement({ ...element, data: newData });
    };

    const removeRow = () => {
        if (data.rows <= 1) return;
        const newRowHeights = data.rowHeights.slice(0, -1);
        const newCells = data.cells.slice(0, -1);
        const newData = {
            ...data,
            rows: data.rows - 1,
            rowHeights: newRowHeights,
            cells: newCells
        };
        setData(newData);
        onUpdateElement({ ...element, data: newData });
    };

    const addColumn = () => {
        const newColWidths = [...data.colWidths, 100];
        const newCells = data.cells.map(row => [...row, '']);
        const newData = {
            ...data,
            cols: data.cols + 1,
            colWidths: newColWidths,
            cells: newCells
        };
        setData(newData);
        onUpdateElement({ ...element, data: newData });
    };

    const removeColumn = () => {
        if (data.cols <= 1) return;
        const newColWidths = data.colWidths.slice(0, -1);
        const newCells = data.cells.map(row => row.slice(0, -1));
        const newData = {
            ...data,
            cols: data.cols - 1,
            colWidths: newColWidths,
            cells: newCells
        };
        setData(newData);
        onUpdateElement({ ...element, data: newData });
    };

    const handleTransformEnd = () => {
        const node = groupRef.current;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        // Calculate new column widths and row heights based on scaling
        const newColWidths = data.colWidths.map(width => width * scaleX);
        const newRowHeights = data.rowHeights.map(height => height * scaleY);

        node.scaleX(1);
        node.scaleY(1);

        const newData = {
            ...data,
            colWidths: newColWidths,
            rowHeights: newRowHeights
        };

        setData(newData);
        onUpdateElement({
            ...element,
            x: node.x(),
            y: node.y(),
            width: node.width() * scaleX,
            height: node.height() * scaleY,
            rotation: node.rotation(),
            data: newData
        });
    };

    const calculateTableSize = () => {
        return {
            width: data.colWidths.reduce((sum, width) => sum + width, 0),
            height: data.rowHeights.reduce((sum, height) => sum + height, 0)
        };
    };

    const tableSize = calculateTableSize();

    return (
        <>
            <Group
                draggable
                id={element.id}
                name="selectable"
                x={element.x}
                y={element.y}
                width={tableSize.width}
                height={tableSize.height}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onClick={onSelect}
                onTap={onSelect}
                ref={node => {
                    if (node) {
                        rectRefs.current.set(element.id, node);
                        groupRef.current = node;
                    }
                }}
            >
                {/* Draw table grid */}
                {data.cells.map((row, rowIndex) => {
                    const y = data.rowHeights.slice(0, rowIndex).reduce((sum, height) => sum + height, 0);
                    return row.map((cell, colIndex) => {
                        const x = data.colWidths.slice(0, colIndex).reduce((sum, width) => sum + width, 0);
                        const width = data.colWidths[colIndex];
                        const height = data.rowHeights[rowIndex];

                        return (
                            <Group key={`${rowIndex}-${colIndex}`}>
                                <Rect
                                    x={x}
                                    y={y}
                                    width={width}
                                    height={height}
                                    stroke="#000"
                                    strokeWidth={1}
                                    fill="#fff"
                                />
                                <EditableText
                                    element={{
                                        id: `${element.id}-cell-${rowIndex}-${colIndex}`,
                                        x: x + 5,
                                        y: y + 5,
                                        width: width - 10,
                                        height: height - 10,
                                        text: cell,
                                        fill: "#000",
                                        type: "text"
                                    }}
                                    onUpdateElement={(updated) => {
                                        handleCellChange(rowIndex, colIndex, updated.text);
                                    }}
                                    rectRefs={rectRefs}
                                    draggable={false}
                                />
                            </Group>
                        );
                    });
                })}

                {/* Controls for adding/removing rows/columns */}
                {isSelected && (
                    <Group>
                        {/* Add row button */}
                        <Rect
                            x={tableSize.width - 30}
                            y={tableSize.height}
                            width={30}
                            height={30}
                            fill="#4CAF50"
                            onClick={addRow}
                            onTap={addRow}
                        />
                        <Text
                            x={tableSize.width - 25}
                            y={tableSize.height + 10}
                            text="+R"
                            fontSize={14}
                            fill="#fff"
                            onClick={addRow}
                            onTap={addRow}
                        />

                        {/* Remove row button */}
                        <Rect
                            x={tableSize.width - 60}
                            y={tableSize.height}
                            width={30}
                            height={30}
                            fill="#F44336"
                            onClick={removeRow}
                            onTap={removeRow}
                        />
                        <Text
                            x={tableSize.width - 55}
                            y={tableSize.height + 10}
                            text="-R"
                            fontSize={14}
                            fill="#fff"
                            onClick={removeRow}
                            onTap={removeRow}
                        />

                        {/* Add column button */}
                        <Rect
                            x={tableSize.width}
                            y={tableSize.height - 30}
                            width={30}
                            height={30}
                            fill="#4CAF50"
                            onClick={addColumn}
                            onTap={addColumn}
                        />
                        <Text
                            x={tableSize.width + 5}
                            y={tableSize.height - 20}
                            text="+C"
                            fontSize={14}
                            fill="#fff"
                            onClick={addColumn}
                            onTap={addColumn}
                        />

                        {/* Remove column button */}
                        <Rect
                            x={tableSize.width}
                            y={tableSize.height - 60}
                            width={30}
                            height={30}
                            fill="#F44336"
                            onClick={removeColumn}
                            onTap={removeColumn}
                        />
                        <Text
                            x={tableSize.width + 5}
                            y={tableSize.height - 50}
                            text="-C"
                            fontSize={14}
                            fill="#fff"
                            onClick={removeColumn}
                            onTap={removeColumn}
                        />
                    </Group>
                )}
            </Group>

            {isSelected && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        // Limit minimum size
                        if (newBox.width < 100 || newBox.height < 50) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                    onTransformEnd={handleTransformEnd}
                />
            )}
        </>
    );
};

export default TableElement;