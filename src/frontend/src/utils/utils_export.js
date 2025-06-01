export function getBoundingBox(obj) {
    if (obj.type === "arrow") {
        return {
            x: Math.min(obj.x_start, obj.x_end),
            y: Math.min(obj.y_start, obj.y_end),
            width: Math.abs(obj.x_end - obj.x_start),
            height: Math.abs(obj.y_end - obj.y_start),
        };
    }
    return {
        x: obj.x,
        y: obj.y,
        width: obj.width,
        height: obj.height,
    };
}
export function doRectanglesOverlap(rect1, rect2, threshold = 0) {
    const box1 = getBoundingBox(rect1);
    const box2 = getBoundingBox(rect2);

    if (!box1 || !box2) return false;

    return (
        box1.x < box2.x + box2.width + threshold &&
        box1.x + box1.width + threshold > box2.x &&
        box1.y < box2.y + box2.height + threshold &&
        box1.y + box1.height + threshold > box2.y
    );
}
export function findGroups(objects, groupings = [], threshold = 0) {
    const naturalGroups = [];
    const visited = new Set();

    const filteredObjects = objects.filter(obj => !groupings.includes(obj));

    for (const obj of filteredObjects) {
        if (visited.has(obj.id)) continue;

        const queue = [obj];
        const currentGroup = [];

        while (queue.length > 0) {
            const current = queue.shift();
            if (visited.has(current.id)) continue;

            visited.add(current.id);
            currentGroup.push(current);

            for (const other of filteredObjects) {
                if (
                    other.id !== current.id &&
                    !visited.has(other.id) &&
                    doRectanglesOverlap(current, other, threshold)
                ) {
                    queue.push(other);
                }
            }
        }

        if (currentGroup.length > 0) {
            naturalGroups.push(currentGroup);
        }
    }
    console.log(naturalGroups)

    const resultGroups = [];

    for (const grouping of groupings) {
        const groupBounds = {
            x: grouping.x,
            y: grouping.y,
            width: grouping.width,
            height: grouping.height
        };

        const elementsInside = [];
        const groupsToRemove = new Set();

        for (let i = 0; i < naturalGroups.length; i++) {
            const naturalGroup = naturalGroups[i];
            const hasOverlap = naturalGroup.some(el => {
                const elBounds = getBoundingBox(el);
                return (
                    elBounds.x >= groupBounds.x &&
                    elBounds.y >= groupBounds.y &&
                    elBounds.x + elBounds.width <= groupBounds.x + groupBounds.width &&
                    elBounds.y + elBounds.height <= groupBounds.y + groupBounds.height
                );
            });

            if (hasOverlap) {
                elementsInside.push(naturalGroup); // Добавляем элементы, а не всю группу
                groupsToRemove.add(i); // Помечаем группу для удаления
            }
        }
        console.log(groupsToRemove)
        console.log(naturalGroups)
        Array.from(groupsToRemove).sort((a, b) => b - a).forEach(index => {
            naturalGroups.splice(index, 1);
        });
        console.log(naturalGroups)

        if (elementsInside.length > 0) {
            console.log(resultGroups)
            resultGroups.push({
                type: 'grouping',
                grouping,
                elements: elementsInside
            });
            console.log(resultGroups[0])
        }
    }

    for (const naturalGroup of naturalGroups) {
        const isInAnyGrouping = resultGroups.some(g =>
            g.elements.some(el => naturalGroup.includes(el))
        );

        if (!isInAnyGrouping) {
            resultGroups.push({
                type: 'natural',
                elements: naturalGroup
            });
        }
    }
    console.log(resultGroups)
    return resultGroups;
}
export function getGroupBoundingBox(group, margin = 10) {
    if (group.length === 0) return null;

    // Находим минимальные и максимальные X и Y
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    group.forEach(obj => {
        let x, y, width, height;

        // Определяем bounding box в зависимости от типа объекта
        if (obj.type === "rect") {
            x = obj.x;
            y = obj.y;
            width = obj.width;
            height = obj.height;
        } else if (obj.type === "arrow") {
            x = Math.min(obj.x_start, obj.x_end);
            y = Math.min(obj.y_start, obj.y_end);
            width = Math.abs(obj.x_end - obj.x_start);
            height = Math.abs(obj.y_end - obj.y_start);
        } else if (obj.type === "text") {
            x = obj.x;
            y = obj.y;
            width = obj.width;
            height = obj.height;
        }
        else {
            x = obj.x;
            y = obj.y;
            width = obj.width;
            height = obj.height;
        }

        // Обновляем min/max значения
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x + width);
        maxY = Math.max(maxY, y + height);
    });

    // Возвращаем общий bounding box
    return {
        x: minX - margin,
        y: minY - margin,
        width: maxX - minX + 2 * margin,
        height: maxY - minY + 2 * margin,
    };
}