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
            
            layoutArea.appendChild(newTable);
            draggedElement = null;
        }
    });

    // Make all tables in layout area draggable
    layoutArea.addEventListener('mousedown', (e) => {
        const tableElement = e.target.closest('.table-icon');
        if (tableElement && tableElement.parentElement === layoutArea) {
            dragElement(tableElement, e);
        }
    });

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
});