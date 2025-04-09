/* eslint-disable react/prop-types */
import React from 'react';
import { Rect } from 'react-konva';

export const RectangleElement = ({
    element,
    onDragStart,
    onDragEnd
}) => {
    return (
        <Rect
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
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
        />
    );
};