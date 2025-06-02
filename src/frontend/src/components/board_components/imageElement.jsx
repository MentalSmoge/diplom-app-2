import React, { useRef, useEffect, useState } from 'react';
import { Image } from 'react-konva';
import { Rect } from 'react-konva';
import useImage from 'use-image';

const ImageElement = ({ element, onDragStart, onDragEnd, rectRefs }) => {
    const imageRef = useRef();
    const [image, status] = useImage(`http://45.143.92.185:8080${element.imageUrl}`, 'Anonymous');
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        if (imageRef.current) {
            rectRefs.current.set(element.id, imageRef.current);
        }
        return () => {
            rectRefs.current.delete(element.id);
        };
    }, [element.id, rectRefs]);

    useEffect(() => {
        console.log('Image status:', status);
        console.log('Image URL:', element.imageUrl);
        if (status === 'failed') {
            console.error('Failed to load image:', element.imageUrl);
            setHasError(true);
        }
    }, [status, element.imageUrl]);

    if (hasError) {
        return (
            <Rect
                id={element.id}
                x={element.x}
                y={element.y}
                width={element.width}
                height={element.height}
                fill="#ffebee"
                stroke="#f44336"
                strokeWidth={2}
                name="selectable"
                draggable
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
            />
        );
    }

    return (
        <Image
            id={element.id}
            x={element.x}
            y={element.y}
            width={element.width}
            height={element.height}
            image={image}
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            name="selectable image"
            ref={imageRef}
        />
    );
};

export default ImageElement;