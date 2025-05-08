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
export function findGroups(objects, threshold = 0) {
    const groups = [];
    const visited = new Set();

    for (const obj of objects) {
        if (visited.has(obj.id)) continue;

        const queue = [obj];
        const currentGroup = [];

        while (queue.length > 0) {
            const current = queue.shift();
            if (visited.has(current.id)) continue;

            visited.add(current.id);
            currentGroup.push(current);

            // Ищем соседей
            for (const other of objects) {
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
            groups.push(currentGroup);
        }
    }


    return groups;
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