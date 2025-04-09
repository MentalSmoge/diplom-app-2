import { Transformer } from 'react-konva';
import { useEffect, useRef } from 'react';
import Konva from 'konva';

export const SelectionManager = ({
    selectedIds,
    setSelectedIds,
    shapes,
    shapeRefs,
    onTransformEnd,
}) => {
    const transformerRef = useRef();

    // Update transformer when selection changes
    useEffect(() => {
        if (selectedIds.length && transformerRef.current) {
            // Get the nodes from the refs Map
            const nodes = selectedIds
                .map(id => shapeRefs.current.get(id))
                .filter(node => node);

            transformerRef.current.nodes(nodes);
        } else if (transformerRef.current) {
            // Clear selection
            transformerRef.current.nodes([]);
        }
    }, [selectedIds, shapeRefs]);

    return (
        <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
                // Limit resize
                if (newBox.width < 5 || newBox.height < 5) {
                    return oldBox;
                }
                return newBox;
            }}
            onTransformEnd={onTransformEnd}
        />
    );
};