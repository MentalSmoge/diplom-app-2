import { Stage, Layer, Text, Transformer, Group } from 'react-konva';
import { Html } from 'react-konva-utils';
import { useEffect, useRef, useState, useCallback, useLayoutEffect } from 'react';

Konva._fixTextRendering = true;

const TextEditor = ({ value, textNodeRef, onClose, onBlur, onChange }) => {
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
        newStyle.height = 'auto';

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
    transformerRef
}) => {
    const [text, setText] = useState('Text So Loooong');
    const [isEditing, setIsEditing] = useState(false);
    const [textWidth, setTextWidth] = useState(200);
    const textRef = useRef();
    const groupRef = useRef();
    const trRef = transformerRef;

    useEffect(() => {
        // if (trRef.current && textRef.current) {
        //     trRef.current.nodes([textRef.current]);
        // }
    }, [isEditing]);

    const handleTextDblClick = useCallback(() => {
        setIsEditing(true);
    }, []);

    const handleTextChange = useCallback((newText) => {
        setText(newText);
    }, []);



    const handleTransform = useCallback((e) => {
        const group = groupRef.current;
        const node = textRef.current;
        const scaleX = group.scaleX();
        console.log(group.scaleX())
        const newWidth = node.width() * scaleX;
        setTextWidth(newWidth);
        node.setAttrs({
            width: newWidth,
            scaleX: 1,
        });
        console.log(group.scaleX())
    }, []);

    return (
        // <Stage width={window.innerWidth} height={window.innerHeight}>
        <Group draggable
            id={element.id}
            name='selectable'
            x={element.x}
            y={element.y}
            rotation={element.rotation}
            height={element.height}
            width={element.width}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            ref={groupNode => {
                if (groupNode) {
                    rectRefs.current.set(element.id, groupNode);
                    groupRef.current = groupNode
                }
            }}
            onTransform={handleTransform}
        >
            <Text
                name='text'
                ref={textRef}
                text={text}
                fontSize={20}
                width={textWidth}
                onDblClick={handleTextDblClick}
                onDblTap={handleTextDblClick}
                visible={!isEditing}
            // onTransform={() => { console.log("SAS") }}
            />
            {isEditing && (
                <Group>
                    <TextEditor
                        value={text}
                        textNodeRef={textRef.current}
                        onChange={handleTextChange}
                        onClose={() => setIsEditing(false)}
                        onBlur={() => setIsEditing(false)}
                    />
                </Group>
            )}
            {/* {!isEditing && (
                <Transformer
                    ref={trRef}
                    rotateEnabled={false}
                    enabledAnchors={['middle-left', 'middle-right']}
                    boundBoxFunc={(oldBox, newBox) => ({
                        ...newBox,
                        width: Math.max(30, newBox.width),
                    })}
                />
            )} */}
        </Group>
        // </Stage>
    );
};

export default EditableText;
