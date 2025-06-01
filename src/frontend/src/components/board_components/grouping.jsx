import React from 'react';
import { Group, Rect } from 'react-konva';
import EditableText from './text';

export const Grouping = ({
    element,
    onDragStart,
    onDragEnd,
    rectRefs,
    onUpdateElement
}) => {
    const handleTransform = (newAttrs) => {
        const updatedElement = {
            ...element,
            ...newAttrs
        };
        onUpdateElement(updatedElement);
    };

    return (
        <Group
            id={element.id}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            rotation={element.rotation}
            skewX={element.skewX}
            skewY={element.skewY}
            // draggable
            // zIndex={-1000}
            onDragStart={onDragStart}
            onDragEnd={(e) => {
                const node = e.target;
                const updatedElement = {
                    ...element,
                    x: node.x(),
                    y: node.y()
                };
                onUpdateElement(updatedElement);
                onDragEnd(e);
            }}
            ref={node => {
                if (node) {
                    rectRefs.current.set(element.id, node);
                }
            }}
        // onTransformEnd={(e) => {
        //     console.log("Transfor", element.width, element.height)
        //     const node = e.target;
        //     const scaleX = node.scaleX();
        //     const scaleY = node.scaleY();

        //     node.scaleX(1);
        //     node.scaleY(1);

        //     handleTransform({
        //         x: node.x(),
        //         y: node.y(),
        //         width: Math.max(20, node.width() * scaleX),
        //         height: Math.max(20, node.height() * scaleY),
        //         rotation: node.rotation(),
        //         skewX: node.skewX(),
        //         skewY: node.skewY()
        //     });
        // }}
        >
            <Rect
                x={0}
                y={0}
                width={element.width}
                height={element.height}
                fill={"#00000000"}
                stroke={element.stroke || '#000000'}
                strokeWidth={1}
                shadowColor="black"
                shadowBlur={10}
                shadowOpacity={0.6}
                skewX={element.skewX}
                skewY={element.skewY}
                draggable={false}
                name='ignore'
            />
            <EditableText
                element={{
                    ...element,
                    x: 10, // Небольшой отступ от края
                    y: 10,
                    fill: 'black',
                    width: element.width - 20, // Ширина текста с учетом отступов
                    text: element.text || 'Text',
                    draggable: false // Запрещаем перемещение текста отдельно
                }}
                onDragStart={() => { }}
                onDragEnd={() => { }}
                rectRefs={{ current: new Map() }}
                onUpdateElement={(updatedText) => {
                    onUpdateElement({
                        ...element,
                        text: updatedText.text
                    });
                }}
                draggable={false}
            />
        </Group>
    );
};