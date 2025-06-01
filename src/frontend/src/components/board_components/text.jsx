import { Stage, Layer, Text, Transformer, Group } from 'react-konva';
import { Html } from 'react-konva-utils';
import { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react';

Konva._fixTextRendering = true;

const TextEditor = ({ value, textNodeRef, onClose, onBlur, onChange, element }) => {
    const [style, setStyle] = useState();
    useLayoutEffect(() => {
        const textNode = textNodeRef;
        // apply many styles to match text on canvas as close as possible
        // remember that text rendering on canvas and on the textarea can be different
        // and sometimes it is hard to make it 100% the same. But we will try...
        const newStyle = {};
        newStyle.width = textNode.width() - textNode.padding() * 2 + 'px';
        newStyle.height = textNode.height() - textNode.padding() * 2 + 10 + 'px';
        newStyle.fontSize = textNode.fontSize() + 'px';
        newStyle.border = 'none';
        newStyle.padding = '0px';
        newStyle.overflow = 'hidden';
        newStyle.background = 'none';
        newStyle.outline = 'none';
        newStyle.resize = 'none';
        newStyle.lineHeight = textNode.lineHeight() + 0.01;
        newStyle.fontFamily = '"' + textNode.fontFamily() + '"';
        newStyle.transformOrigin = 'left top';
        newStyle.textAlign = textNode.align();
        newStyle.color = textNode.fill();
        newStyle.overflowWrap = 'break-word';
        newStyle.whiteSpace = 'normal';
        newStyle.userSelect = 'text';
        newStyle.wordBreak = 'normal';
        const rotation = textNode.rotation();
        let transform = '';
        if (rotation) {
            transform += `rotateZ(${rotation}deg)`;
        }
        newStyle.transform = transform;
        newStyle.position = 'absolute';
        newStyle.left = element.x + 'px';
        newStyle.top = element.y + 'px';
        // newStyle.height = 'auto';

        if (JSON.stringify(newStyle) !== JSON.stringify(style)) {
            setStyle(newStyle);
        }
    });

    return (
        <Html>
            <textarea
                className="polotno-input"
                style={{
                    ...style,
                }}
                value={value}
                onChange={(e) => {
                    onChange(e.target.value);
                }}
                onBlur={onBlur}
                onClose={onClose}
            />
        </Html>
    );
};

const EditableText = ({
    element,
    onDragStart,
    onDragEnd,
    rectRefs,
    onUpdateElement,
    draggable = true
}) => {
    const [text, setText] = useState(element.text);
    const [isEditing, setIsEditing] = useState(false);
    const [textWidth, setTextWidth] = useState(200);
    const textRef = useRef();
    useEffect(() => {
        setText(element.text);
        setTextWidth(element.width);
        // if (trRef.current && textRef.current) {
        //     trRef.current.nodes([textRef.current]);
        // }
    }, [isEditing, element.text, element.width]);

    const handleTextDblClick = useCallback(() => {
        setIsEditing(true);
    }, []);

    const handleTextChange = useCallback((newText) => {
        setText(newText);
        const updatedElement = {
            ...element,
            text: newText
        };
        // console.log("Wow text changed", updatedElement)
        onUpdateElement(updatedElement);
    }, [element, onUpdateElement]);



    const handleTransform = useCallback((e) => {
        const node = textRef.current;
        const scaleX = node.scaleX();
        const newWidth = node.width() * scaleX;
        setTextWidth(newWidth);
        node.setAttrs({
            width: newWidth,
            scaleX: 1,
        });
        // console.log(node.width(), scaleX, newWidth)
    }, []);

    return (
        // <Stage width={window.innerWidth} height={window.innerHeight}>
        <>
            <Text
                draggable={draggable}
                fill={element.fill}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                id={element.id}
                name='selectable'
                // ref={textRef}
                x={element.x}
                y={element.y}
                text={text}
                fontSize={20}
                width={textWidth}
                onDblClick={handleTextDblClick}
                onDblTap={handleTextDblClick}
                visible={!isEditing}
                onTransform={handleTransform}
                ref={node => {
                    if (node) {
                        rectRefs.current.set(element.id, node);
                        textRef.current = node
                    }
                }}
            // onTransform={() => { console.log("SAS") }}
            />
            {isEditing && (
                <TextEditor
                    value={text}
                    element={element}
                    textNodeRef={textRef.current}
                    onChange={handleTextChange}
                    onClose={() => setIsEditing(false)}
                    onBlur={() => setIsEditing(false)}
                />
            )}
        </>
        // <Group
        //     draggable
        //     id={element.id}
        //     name='selectable'
        //     x={element.x}
        //     y={element.y}
        //     rotation={element.rotation}
        //     height={element.height}
        //     width={element.width}
        //     onDragStart={onDragStart}
        //     onDragEnd={onDragEnd}
        //     ref={groupNode => {
        //         if (groupNode) {
        //             rectRefs.current.set(element.id, groupNode);
        //             groupRef.current = groupNode
        //         }
        //     }}
        //     onTransform={handleTransform}
        // >

        //     {/* {!isEditing && (
        //         <Transformer
        //             ref={trRef}
        //             rotateEnabled={false}
        //             enabledAnchors={['middle-left', 'middle-right']}
        //             boundBoxFunc={(oldBox, newBox) => ({
        //                 ...newBox,
        //                 width: Math.max(30, newBox.width),
        //             })}
        //         />
        //     )} */}
        // </Group >
        // </Stage>
    );
};

export default EditableText;
