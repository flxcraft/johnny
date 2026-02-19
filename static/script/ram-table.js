/**
 * Generates the RAM table in the HTML document and populates it with data from the RAM array.
 * 
 * @return {void}
 */
function generateRamTable() {
    const ramTable = document.getElementById("ram-table");
    ramTable.innerHTML = ""; // Clear existing table content

    // Create table header
    const headerRow = document.createElement("tr");
    const addressHeader = document.createElement("th");
    addressHeader.textContent = "Address";
    const dataHeader = document.createElement("th");
    dataHeader.textContent = "Data";
    const assemblerHeader = document.createElement("th");
    assemblerHeader.textContent = "Assembler";
    const operandHeader = document.createElement("th");
    operandHeader.textContent = "Operand";

    headerRow.appendChild(addressHeader);
    headerRow.appendChild(dataHeader);
    headerRow.appendChild(assemblerHeader);
    headerRow.appendChild(operandHeader);
    ramTable.appendChild(headerRow);

    // Create table rows for each RAM address
    for (let address = 0; address < ram.length; address++) {
        const newRow = document.createElement("tr");
        const addressCell = document.createElement("td");
        const dataCell = document.createElement("td");
        const assemblerCell = document.createElement("td");
        const operandCell = document.createElement("td");

        // Populate cells based on whether to load data or initialize with defaults
        const asm = dataToAsm(ram[address]);
        addressCell.textContent = formatAddress(address);
        dataCell.textContent = formatData(ram[address]);
        assemblerCell.textContent = asm.instruction;
        operandCell.textContent = asm.operand;

        // Set row ID for future reference
        newRow.id = `ram-row-${address}`;

        // Onclick event to select memory address
        newRow.onclick = () => {
            selectedRamAddress = address;
            updateRamTableHighlighting(false); // Update highlighting without scrolling to selected address
            document.getElementById("ram-input").focus(); // Focus the RAM input field for immediate editing
        };

        // double-click event to insert the current RAM data into the input field for smoother editing
        // onclick is still triggered on double-click, so the row will be selected and highlighted as well
        newRow.ondblclick = () => {
            const ramInput = document.getElementById("ram-input");
            ramInput.value = formatDataHigh(ram[address]) + "." + formatDataLow(ram[address]); // Insert the current RAM data into the input field
        };

        // Append cells to the row and the row to the table
        newRow.appendChild(addressCell);
        newRow.appendChild(dataCell);
        newRow.appendChild(assemblerCell);
        newRow.appendChild(operandCell);
        ramTable.appendChild(newRow);
    }

    // Initial highlighting update
    updateRamTableHighlighting();
}

/**
 * Updates a specific row in the RAM table based on the given address.
 * 
 * @param {number} address 
 * @returns {void}
 */
function updateRamTableRow(address) {
    const row = document.getElementById(`ram-row-${address}`);
    const dataCell = row.children[1];
    const assemblerCell = row.children[2];
    const operandCell = row.children[3];

    dataCell.textContent = formatData(ram[address]);
    const asm = dataToAsm(ram[address]);
    assemblerCell.textContent = asm.instruction;
    operandCell.textContent = asm.operand;
}

/**
 * Updates all rows in the RAM table to reflect the current RAM data.
 * 
 * @returns {void}
 */
function updateRamTable() {
    for (let address = 0; address < ram.length; address++) {
        updateRamTableRow(address);
    }
}

/**
 * Updates the highlighting of the RAM table rows based on the selected and last used memory addresses.
 * 
 * @return {void}
 */
function updateRamTableHighlighting(scrollToSelected = true) {
    for (let address = 0; address < ram.length; address++) {
        const row = document.getElementById(`ram-row-${address}`);
        row.classList.remove("selected");
        row.classList.remove("last-executed");
        if (address === selectedRamAddress) {
            row.classList.add("selected");

            if (scrollToSelected) scrollToRamAddress(address);
            updateRamInputArrowPosition();
        }
        if (lastAccessedRamAddress !== null && address === lastAccessedRamAddress) {
            row.classList.add("last-executed");
        }
    }
}

/**
 * Moves the arrow indicator to the selected RAM row in the RAM table.
 * 
 * @returns {void}
 */
function updateRamInputArrowPosition() {
    const arrow = document.getElementById("ram-input-arrow");
    const selectedRow = document.getElementById(`ram-row-${selectedRamAddress}`);

    if (!selectedRow) {
        arrow.style.display = "none";
        return;
    }

    const rowRect = selectedRow.getBoundingClientRect();

    // Position the arrow to the left of the selected row
    arrow.style.top = `${rowRect.top + rowRect.height / 2 - arrow.offsetHeight / 2}px`;
    arrow.style.display = "flex";
}

/**
 * Scrolls the RAM table container to ensure that the specified RAM address is visible and centered in the view.
 * 
 * @param {number} address the RAM address to scroll to
 * @returns {void}
 */
function scrollToRamAddress(address) {
    const row = document.getElementById(`ram-row-${address}`);
    const ramTablecontainer = document.getElementById("ram-table-container");
    const rowsAbove = 5; // Number of rows to show above the target row

    if (row) ramTablecontainer.scrollTop = row.offsetTop - (rowsAbove * row.clientHeight);
}

/**
 * Inserts a new row into the RAM table above the currently selected RAM address by shifting existing rows down.
 * 
 * @returns {void}
 */
function insertRamRowAbove() {
    // Find last used address in RAM (the last address that is not 0; if all are 0, it will be -1)
    let lastUsedAddress = getLastUsedRamAddress();

    // If RAM is empty, we don't need to do anything
    if (lastUsedAddress === -1) return;

    // If there is no empty address to shift down, we cannot insert a new row
    if (lastUsedAddress >= ram.length - 1) {
        console.error("Cannot insert new row: RAM is full.");
        alert("Cannot insert new row: RAM is full.");
        return;
    }

    // Shift rows down from the last used address to the selected address to create space for the new row
    for (let i = lastUsedAddress + 1; i > selectedRamAddress; i--) {
        console.debug(`Shifting RAM address ${i - 1} to ${i}`);
        ram[i] = ram[i - 1];
        updateRamTableRow(i);
    }

    // Clear the selected address for new input
    ram[selectedRamAddress] = 0;
    updateRamTableRow(selectedRamAddress);

    fixOperandAfterRamShift(selectedRamAddress);

    // Save the updated RAM to localStorage
    saveRamToLocalStorage();
}

/**
 * Deletes the currently selected row from the RAM table by shifting existing rows up and clearing the last used address.
 * 
 * @returns {void}
 */
function deleteRamRow() {
    // Find last used address in RAM (the last address that is not 0; if all are 0, it will be -1)
    let lastUsedAddress = getLastUsedRamAddress();

    // If RAM is empty, we don't need to do anything
    if (lastUsedAddress === -1) return;

    // Shift rows up from the selected address to the last used address to fill the gap of the deleted row
    for (let i = selectedRamAddress; i < lastUsedAddress; i++) {
        console.debug(`Shifting RAM address ${i + 1} to ${i}`);
        ram[i] = ram[i + 1];
        updateRamTableRow(i);
    }

    // Clear the last address after shifting
    ram[lastUsedAddress] = 0;
    updateRamTableRow(lastUsedAddress);

    fixOperandAfterRamShift(selectedRamAddress, -1);

    // Save the updated RAM to localStorage
    saveRamToLocalStorage();
}

/**
 * After shifting RAM rows, this function updates the operands of instructions that point to addresses at or above the startAddress by incrementing them by `delta`.
 *
 * @param {number} startAddress the address from which the new row was inserted and above which operands need to be updated
 * @returns {void}
 */
function fixOperandAfterRamShift(startAddress, delta = 1) {
    if (!fixRamAfterShift) return; // only fix RAM if the flag is set

    for (let address = 0; address < ram.length; address++) {
        const data = ram[address];
        const opcode = getDataHigh(data);
        const operand = getDataLow(data);

        // Skip if opcode is 0 (FETCH) or 10 (HLT) since they don't have operands
        if (opcode === 0 || opcode === 10) continue;

        // If operand is greater than or equal to the startAddress, it needs to be incremented by 1
        if (operand >= startAddress) {
            ram[address] = (opcode * 1000) + (operand + delta);
            updateRamTableRow(address);
        }
    }
}