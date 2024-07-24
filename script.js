function editRestaurantName() {
    const currentName = document.getElementById('restaurant-name').textContent;
    const newName = prompt("Enter new restaurant name:", currentName);
    if (newName !== null && newName.trim() !== "") {
        document.getElementById('restaurant-name').textContent = newName.trim();
        // Save to localStorage
        localStorage.setItem('restaurantName', newName.trim());
    }
}

// Function to load the restaurant name from localStorage
function loadRestaurantName() {
    const savedName = localStorage.getItem('restaurantName');
    if (savedName) {
        document.getElementById('restaurant-name').textContent = savedName;
    }
}

// Call loadRestaurantName when the DOM content is loaded
document.addEventListener('DOMContentLoaded', (event) => {
    loadRestaurantName();
    
    const sidebar = document.querySelector('.sidebar');
    const layoutArea = document.querySelector('.layout-area');
    let draggedElement = null;

    // Make sidebar items draggable
    sidebar.querySelectorAll('.table-icon').forEach(table => {
        table.addEventListener('dragstart', (e) => {
            draggedElement = e.target.cloneNode(true);
        });
    });

    // Allow dropping in layout area
    layoutArea.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    // Handle drop in layout area
    layoutArea.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedElement) {
            const newTable = draggedElement.cloneNode(true);
            newTable.style.position = 'absolute';
            newTable.style.left = `${e.clientX - layoutArea.getBoundingClientRect().left}px`;
            newTable.style.top = `${e.clientY - layoutArea.getBoundingClientRect().top}px`;
            
            // Add resize handle
            const resizeHandle = document.createElement('div');
            resizeHandle.className = 'resize-handle';
            newTable.appendChild(resizeHandle);
            
            // Add name input
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.className = 'table-name';
            nameInput.value = `Table ${layoutArea.children.length + 1}`;
            nameInput.addEventListener('click', (e) => e.stopPropagation());
            newTable.appendChild(nameInput);
            
            newTable.classList.add('placed');
            newTable.classList.add('occupied'); // Start as occupied (green)
            
            layoutArea.appendChild(newTable);
            draggedElement = null;
        }
    });

    // Make all tables in layout area draggable
    layoutArea.addEventListener('mousedown', (e) => {
        const tableElement = e.target.closest('.table-icon');
        if (tableElement && tableElement.parentElement === layoutArea) {
            if (e.target.classList.contains('resize-handle')) {
                resizeElement(tableElement, e);
            } else if (e.target.classList.contains('table-name')) {
                return; // Don't start dragging if clicking on the name input
            } else {
                dragElement(tableElement, e);
            }
        }
    });

    function resizeElement(element, startEvent) {
        startEvent.preventDefault();
        const startX = startEvent.clientX;
        const startY = startEvent.clientY;
        const startWidth = element.offsetWidth;
        const startHeight = element.offsetHeight;

        document.onmousemove = resize;
        document.onmouseup = stopResize;

        function resize(e) {
            const newWidth = startWidth + e.clientX - startX;
            const newHeight = startHeight + e.clientY - startY;
            
            // Ensure minimum size and stay within layout area
            if (newWidth >= 50 && newHeight >= 50 &&
                element.offsetLeft + newWidth <= layoutArea.offsetWidth &&
                element.offsetTop + newHeight <= layoutArea.offsetHeight) {
                element.style.width = `${newWidth}px`;
                element.style.height = `${newHeight}px`;
            }
        }

        function stopResize() {
            document.onmousemove = null;
            document.onmouseup = null;
        }
    }

    function dragElement(element, startEvent) {
        startEvent.preventDefault();
        const rect = element.getBoundingClientRect();
        const offsetX = startEvent.clientX - rect.left;
        const offsetY = startEvent.clientY - rect.top;

        document.onmousemove = elementDrag;
        document.onmouseup = closeDragElement;

        function elementDrag(e) {
            e.preventDefault();
            const newLeft = e.clientX - offsetX - layoutArea.getBoundingClientRect().left;
            const newTop = e.clientY - offsetY - layoutArea.getBoundingClientRect().top;

            // Ensure the table stays within the layout area
            if (newTop >= 0 && newTop + element.offsetHeight <= layoutArea.offsetHeight &&
                newLeft >= 0 && newLeft + element.offsetWidth <= layoutArea.offsetWidth) {
                element.style.left = `${newLeft}px`;
                element.style.top = `${newTop}px`;
            }
        }

        function closeDragElement() {
            document.onmousemove = null;
            document.onmouseup = null;
        }
    }

    let contextMenu = null;

    // Create context menu
    function createContextMenu(x, y, table) {
        // Remove existing context menu if any
        if (contextMenu) {
            contextMenu.remove();
        }

        contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = `${x}px`;
        contextMenu.style.top = `${y}px`;

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => {
            table.remove();
            contextMenu.remove();
        };

        const occupiedButton = document.createElement('button');
        occupiedButton.textContent = table.classList.contains('occupied') ? 'Mark as Unoccupied' : 'Mark as Occupied';
        occupiedButton.onclick = () => {
            table.classList.toggle('occupied');
            contextMenu.remove();
        };

        contextMenu.appendChild(deleteButton);
        contextMenu.appendChild(occupiedButton);
        document.body.appendChild(contextMenu);
    }

    // Handle right-click on tables
    layoutArea.addEventListener('contextmenu', (e) => {
        const tableElement = e.target.closest('.table-icon');
        if (tableElement && tableElement.parentElement === layoutArea) {
            e.preventDefault();
            createContextMenu(e.clientX, e.clientY, tableElement);
        }
    });

    // Close context menu when clicking outside
    document.addEventListener('click', (e) => {
        if (contextMenu && !contextMenu.contains(e.target)) {
            contextMenu.remove();
        }
    });
});