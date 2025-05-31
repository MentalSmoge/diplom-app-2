import React from 'react';
import { Line } from 'react-konva';

const BrushElement = ({ element, onDragStart, onDragEnd, rectRefs }) => {
    return (
        <Line
            id={element.id}
            points={element.points}
            stroke={element.stroke || '#000000'}
            strokeWidth={element.strokeWidth || 5}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            name="selectable"
            ref={node => {
                if (node) {
                    rectRefs.current.set(element.id, node);
                }
            }}
        />
    );
};

export default BrushElement;