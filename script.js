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
    // Create modal container
    const modalContainer = document.createElement('div');
    modalContainer.id = 'modalContainer';
    document.body.appendChild(modalContainer);

    // Declare layoutArea once
    const layoutArea = document.querySelector('.layout-area');
    if (!layoutArea) {
        return;
    }

    loadRestaurantName();
    
    const sidebar = document.querySelector('.sidebar');
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
        if (startEvent.target.classList.contains('table-name')) {
            return; // Don't start dragging if clicking on the name input
        }
        
        startEvent.preventDefault();
        const rect = element.getBoundingClientRect();
        const offsetX = startEvent.clientX - rect.left;
        const offsetY = startEvent.clientY - rect.top;

        document.onmousemove = elementDrag;
        document.onmouseup = closeDragElement;

        function elementDrag(e) {
            e.preventDefault();
            const newLeft = e.clientX - offsetX;
            const newTop = e.clientY - offsetY;

            // Allow the table to be dragged anywhere on the screen
            element.style.left = `${newLeft}px`;
            element.style.top = `${newTop}px`;

            // Check if the table is over the sidebar
            const sidebarRect = sidebar.getBoundingClientRect();
            if (e.clientX >= sidebarRect.left && e.clientX <= sidebarRect.right &&
                e.clientY >= sidebarRect.top && e.clientY <= sidebarRect.bottom) {
                sidebar.classList.add('delete-hover');
                element.classList.add('delete-hover');
            } else {
                sidebar.classList.remove('delete-hover');
                element.classList.remove('delete-hover');
            }
        }

        function closeDragElement(e) {
            document.onmousemove = null;
            document.onmouseup = null;

            // Remove hover classes
            sidebar.classList.remove('delete-hover');
            element.classList.remove('delete-hover');

            // Check if the table is dropped in the sidebar
            const sidebarRect = sidebar.getBoundingClientRect();
            if (e.clientX >= sidebarRect.left && e.clientX <= sidebarRect.right &&
                e.clientY >= sidebarRect.top && e.clientY <= sidebarRect.bottom) {
                element.remove(); // Delete the table
            } else if (e.clientX >= layoutArea.offsetLeft && 
                       e.clientX <= layoutArea.offsetLeft + layoutArea.offsetWidth &&
                       e.clientY >= layoutArea.offsetTop && 
                       e.clientY <= layoutArea.offsetTop + layoutArea.offsetHeight) {
                // If dropped within layout area, adjust position relative to layout area
                element.style.left = `${e.clientX - layoutArea.offsetLeft - offsetX}px`;
                element.style.top = `${e.clientY - layoutArea.offsetTop - offsetY}px`;
            } else {
                // If dropped outside layout area and sidebar, return to original position
                element.style.left = `${rect.left - layoutArea.offsetLeft}px`;
                element.style.top = `${rect.top - layoutArea.offsetTop}px`;
            }
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

        const orderButton = document.createElement('button');
        orderButton.textContent = 'Order';
        orderButton.onclick = () => {
            showOrderModal(table);
            contextMenu.remove();
        };

        contextMenu.appendChild(deleteButton);
        contextMenu.appendChild(occupiedButton);
        contextMenu.appendChild(orderButton);
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

    // Allow dropping in sidebar for deletion
    sidebar.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    sidebar.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedElement && draggedElement.classList.contains('placed')) {
            draggedElement.remove();
        }
    });

    const menuButton = document.querySelector('.menu-button');
    const menuModal = document.getElementById('menuModal');
    const modalRestaurantName = document.getElementById('modalRestaurantName');
    const closeButton = menuModal.querySelector('.close');
    const addItemButton = document.getElementById('addItemButton');
    const addItemModal = document.getElementById('addItemModal');
    const addItemForm = document.getElementById('addItemForm');
    const menuItemsContainer = document.querySelector('.modal-body');

    let menuItems = JSON.parse(localStorage.getItem('menuItems')) || [];
    if (!Array.isArray(menuItems)) {
        menuItems = [];
        localStorage.setItem('menuItems', JSON.stringify(menuItems));
    }

    function displayMenuItems() {
        menuItemsContainer.innerHTML = '';
        menuItems.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.className = 'menu-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name || 'Unknown item'}">
                <div class="menu-item-details">
                    <div class="menu-item-name">${item.name || 'Unknown item'}</div>
                    <div class="menu-item-description">${item.description || 'No description available'}</div>
                </div>
                <div class="menu-item-price">$${(item.price != null && !isNaN(item.price)) ? item.price.toFixed(2) : '0.00'}</div>
                <button class="delete-item" data-index="${index}">Delete</button>
            `;
            menuItemsContainer.appendChild(itemElement);
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-item').forEach(button => {
            button.addEventListener('click', deleteMenuItem);
        });
    }

    function deleteMenuItem(event) {
        const index = parseInt(event.target.getAttribute('data-index'));
        if (!isNaN(index) && index >= 0 && index < menuItems.length) {
            menuItems.splice(index, 1);
            localStorage.setItem('menuItems', JSON.stringify(menuItems));
            displayMenuItems();
        }
    }

    // Open the menu modal
    menuButton.addEventListener('click', () => {
        menuModal.style.display = 'block';
        modalRestaurantName.textContent = document.getElementById('restaurant-name').textContent;
        displayMenuItems();
    });

    // Close the menu modal
    closeButton.addEventListener('click', () => {
        menuModal.style.display = 'none';
    });

    // Open the add item modal
    addItemButton.addEventListener('click', () => {
        addItemModal.style.display = 'block';
    });

    // Close the add item modal
    addItemModal.querySelector('.close').addEventListener('click', () => {
        addItemModal.style.display = 'none';
    });

    // Handle form submission
    addItemForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const file = document.getElementById('itemImage').files[0];
        
        if (file) {
            const reader = new FileReader();

            reader.onload = function(event) {
                const newItem = {
                    image: event.target.result,
                    name: document.getElementById('itemName').value.trim() || 'Unknown item',
                    description: document.getElementById('itemDescription').value.trim() || 'No description available',
                    price: parseFloat(document.getElementById('itemPrice').value) || 0
                };

                menuItems.push(newItem);
                localStorage.setItem('menuItems', JSON.stringify(menuItems));
                displayMenuItems();
                addItemModal.style.display = 'none';
                addItemForm.reset();
            };

            reader.readAsDataURL(file);
        } else {
            alert('Please select an image file.');
        }
    });

    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === menuModal) {
            menuModal.style.display = 'none';
        }
        if (event.target === addItemModal) {
            addItemModal.style.display = 'none';
        }
    });

    // Display menu items on page load
    displayMenuItems();

    // Order modal
    function showOrderModal(table) {
        const modalContainer = document.getElementById('modalContainer');
        if (!modalContainer) {
            return;
        }

        const orderModal = document.createElement('div');
        orderModal.className = 'modal';
        orderModal.style.display = 'block';
        orderModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Order for ${table.querySelector('.table-name') ? table.querySelector('.table-name').value : 'Table'}</h2>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="order-items"></div>
                    <button id="addToOrderButton">Add Item</button>
                </div>
            </div>
        `;
        modalContainer.appendChild(orderModal);

        const closeButton = orderModal.querySelector('.close');
        closeButton.onclick = () => orderModal.remove();

        const addToOrderButton = orderModal.querySelector('#addToOrderButton');
        addToOrderButton.onclick = () => showAddToOrderModal(table, orderModal);

        displayOrderItems(table, orderModal);
    }

    function showAddToOrderModal(table, orderModal) {
        const modalContainer = document.getElementById('modalContainer');
        const addToOrderModal = document.createElement('div');
        addToOrderModal.className = 'modal';
        addToOrderModal.style.display = 'block';
        addToOrderModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Add to Order</h2>
                    <span class="close">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="menu-items-container"></div>
                </div>
            </div>
        `;
        modalContainer.appendChild(addToOrderModal);

        const closeButton = addToOrderModal.querySelector('.close');
        closeButton.onclick = () => addToOrderModal.remove();

        const menuItemsContainer = addToOrderModal.querySelector('.menu-items-container');
        menuItems.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'menu-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name || 'Unknown item'}">
                <div class="menu-item-details">
                    <div class="menu-item-name">${item.name || 'Unknown item'}</div>
                    <div class="menu-item-description">${item.description || 'No description available'}</div>
                    <div class="menu-item-price">$${(item.price != null && !isNaN(item.price)) ? item.price.toFixed(2) : '0.00'}</div>
                </div>
                <div class="menu-item-actions">
                    <input type="number" class="item-quantity" value="1" min="1">
                    <button class="add-to-order" data-item-name="${item.name}">Add</button>
                </div>
            `;
            menuItemsContainer.appendChild(itemElement);
        });

        // Add event listeners for "Add" buttons
        addToOrderModal.querySelectorAll('.add-to-order').forEach(button => {
            button.addEventListener('click', (e) => {
                const itemName = e.target.getAttribute('data-item-name');
                const quantity = parseInt(e.target.parentElement.querySelector('.item-quantity').value);
                addItemToOrder(table, itemName, quantity);
                displayOrderItems(table, orderModal);
                addToOrderModal.remove();
            });
        });
    }

    function addItemToOrder(table, itemName, quantity) {
        if (!table.order) {
            table.order = [];
        }
        const existingItem = table.order.find(item => item.name === itemName);
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            const menuItem = menuItems.find(item => item.name === itemName);
            table.order.push({ name: itemName, price: menuItem.price, quantity: quantity });
        }
    }

    function displayOrderItems(table, orderModal) {
        const orderItemsContainer = orderModal.querySelector('.order-items');
        orderItemsContainer.innerHTML = '';
        if (table.order && table.order.length > 0) {
            table.order.forEach((item, index) => {
                const itemElement = document.createElement('div');
                itemElement.className = 'order-item';
                itemElement.innerHTML = `
                    <span>${item.name} - $${item.price.toFixed(2)} x ${item.quantity}</span>
                    <button class="edit-quantity" data-index="${index}">Edit</button>
                    <button class="delete-order-item" data-index="${index}">Delete</button>
                `;
                orderItemsContainer.appendChild(itemElement);
            });

            // Add event listeners for edit and delete buttons
            orderItemsContainer.querySelectorAll('.edit-quantity').forEach(button => {
                button.addEventListener('click', (e) => editOrderItemQuantity(e, table, orderModal));
            });
            orderItemsContainer.querySelectorAll('.delete-order-item').forEach(button => {
                button.addEventListener('click', (e) => deleteOrderItem(e, table, orderModal));
            });
        } else {
            orderItemsContainer.innerHTML = '<p>No items in the order.</p>';
        }
    }

    function editOrderItemQuantity(event, table, orderModal) {
        const index = parseInt(event.target.getAttribute('data-index'));
        const item = table.order[index];
        const newQuantity = prompt(`Enter new quantity for ${item.name}:`, item.quantity);
        if (newQuantity !== null && !isNaN(newQuantity) && newQuantity > 0) {
            item.quantity = parseInt(newQuantity);
            displayOrderItems(table, orderModal);
        }
    }

    function deleteOrderItem(event, table, orderModal) {
        const index = parseInt(event.target.getAttribute('data-index'));
        table.order.splice(index, 1);
        displayOrderItems(table, orderModal);
    }

    // Make sure this event listener is inside the DOMContentLoaded event
    layoutArea.addEventListener('contextmenu', (e) => {
        const tableElement = e.target.closest('.table-icon');
        if (tableElement && tableElement.parentElement === layoutArea) {
            e.preventDefault();
            createContextMenu(e.clientX, e.clientY, tableElement);
        }
    });
});