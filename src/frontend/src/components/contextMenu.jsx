import React from 'react';
import { ChromePicker, CirclePicker } from 'react-color';
import './contextMenu.css';

const ContextMenu = ({
    position,
    selectedColor,
    setSelectedColor,
    onColorChange,
    onDelete,
    showColorPicker,
    onClose
}) => {
    const handleClick = (e) => {
        e.stopPropagation();
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: position.y,
                left: position.x,
                backgroundColor: 'white',
                boxShadow: '0 0 5px grey',
                borderRadius: '8px',
                padding: '10px',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
            }}
            onClick={handleClick}
        >
            {
                showColorPicker &&
                <CirclePicker
                    color={selectedColor}
                    onChangeComplete={onColorChange}
                    onChange={(color) => { setSelectedColor(color) }}
                    width={'250px'}
                    colors={[
                        // Первая строка: основные
                        '#404040', '#DF3838', '#31EF31', '#2099EF', '#EFEF33',
                        // Вторая строка: приглушенные
                        '#000000', '#8B1010', '#228B22', '#0A4F8D', '#C5A838',
                        // Третья строка: пастельные
                        '#B5B5B5', '#FD927B', '#AFFF9C', '#9FE2F8', '#FFF080'
                    ]}
                />}
            {
                showColorPicker &&
                <ChromePicker
                    color={selectedColor}
                    onChangeComplete={onColorChange}
                    onChange={(color) => { setSelectedColor(color) }}
                    disableAlpha
                    style={{ boxShadow: 'none' }}
                    width={'200px'}
                />}

            <button
                style={{
                    padding: '8px',
                    backgroundColor: '#ff4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                }}
                onClick={onDelete}
            >
                Delete
            </button>
        </div>
    );
};

export default ContextMenu;