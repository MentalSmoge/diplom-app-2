import React from "react";
import ReactDOM from "react-dom";
import { Stage, Layer, Circle, Arrow, Text, Group } from "react-konva";
const degrees_to_radians = degrees => degrees * (Math.PI / 180);
import { observer } from "mobx-react-lite";
const Edge = ({ nodeStart, nodeEnd }) => {
    const dx = nodeEnd.x - nodeStart.x;
    const dy = nodeEnd.y - nodeStart.y;
    let angle = Math.atan2(-dy, dx);

    const radius = -5;

    const arrowStart = {
        x: nodeStart.x + -radius * Math.cos(angle + Math.PI),
        y: nodeStart.y + radius * Math.sin(angle + Math.PI)
    };

    const arrowEnd = {
        x: nodeEnd.x + -radius * Math.cos(angle),
        y: nodeEnd.y + radius * Math.sin(angle)
    };

    const arrowMiddle = {
        x: (arrowStart.x + arrowEnd.x) / 2,
        y: (arrowStart.y + arrowEnd.y) / 2
    };

    const text = "Some text";
    return (
        <Group>
            <Arrow
                points={[
                    arrowStart.x,
                    arrowStart.y,
                    arrowMiddle.x,
                    arrowMiddle.y,
                    arrowEnd.x,
                    arrowEnd.y
                ]}
                stroke="#000"
                fill="#000"
                strokeWidth={2}
                pointerWidth={6}
            />
            {/* <Text
                fill="red"
                x={(nodeEnd.x + nodeStart.x) / 2 - 100}
                y={(nodeEnd.y + nodeStart.y) / 2 - 100}
                width={200}
                height={200}
                align="center"
                verticalAlign="middle"
                text={text}
            /> */}
        </Group>
    );
};
const EdgeArrow = observer
    (({
        element,
        onDragStart,
        onDragEnd,
        rectRefs,
        onUpdateElement
    }) => {
        const groupRef = React.useRef();
        React.useEffect(() => {
            updateNodeStart({
                x: element.x_start,
                y: element.y_start,
                width: 25,
                height: 25,
                draggable: true
            });
            updateNodeEnd({
                x: element.x_end,
                y: element.y_end,
                width: 25,
                height: 25,
                draggable: true
            });
        }, [element.x_start, element.y_start, element.x_end, element.y_end]);

        const NODE_START = {
            x: element.x_start,
            y: element.y_start,
            width: 25,
            height: 25,
            draggable: true
        };

        const NODE_END = {
            x: element.x_end,
            y: element.y_end,
            width: 25,
            height: 25,
            draggable: true
        };
        const [nodeStart, updateNodeStart] = React.useState(NODE_START);
        const [nodeEnd, updateNodeEnd] = React.useState(NODE_END);
        const onDragMove = (e) => {

        }

        return (
            <Group
                id={element.id}
                ref={node => {
                    if (node) {
                        rectRefs.current.set(element.id, node);
                        groupRef.current = node
                    }
                }}
            >
                <Edge nodeEnd={nodeEnd} nodeStart={nodeStart} />
                <Circle
                    {...nodeStart}
                    onDragMove={e => {
                        updateNodeStart({ ...nodeStart, ...e.target.position() });
                    }}
                    onDragEnd={(e) => { onDragEnd(e, groupRef.current, "start") }}
                    onDragStart={onDragStart}
                />
                <Circle
                    {...nodeEnd}
                    x={element.x_end}
                    y={element.y_end}
                    onDragMove={e => {
                        updateNodeEnd({ ...nodeEnd, ...e.target.position() });
                    }}
                    onDragEnd={(e) => { onDragEnd(e, groupRef.current, "end") }}
                    onDragStart={onDragStart}
                />
            </Group>
        );
    })
export default EdgeArrow;