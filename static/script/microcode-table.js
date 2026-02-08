/**
 * Generates the microcode table in the HTML document.
 * 
 * @return {void}
 */
function generateMicroCodeTable() {
    const mcTable = document.getElementById("microcode-table");
    mcTable.innerHTML = ""; // Clear existing table content

    // Create table header
    const headerRow = document.createElement("tr");
    const addressHeader = document.createElement("th");
    addressHeader.textContent = "Adresse";
    const actionHeader = document.createElement("th");
    actionHeader.textContent = "Aktion";
    headerRow.appendChild(addressHeader);
    headerRow.appendChild(actionHeader);
    mcTable.appendChild(headerRow);

    // Create table rows for each microcode entry
    for (let address = 0; address < MICROCODE_SIZE; address++) {
        const newRow = document.createElement("tr");
        const addressCell = document.createElement("td");
        const actionCell = document.createElement("td");

        // Add instruction names for addresses that are multiples of 10 (macro instruction entries)
        if (address % 10 === 0) {
            const instructionNumber = address / 10;
            const instructionName = instructionNames[instructionNumber];
            if (instructionName) {
                addressCell.textContent = `${formatAddress(address)} ${instructionName}:`;
            } else {
                addressCell.textContent = formatAddress(address);
            }
        } else {
            addressCell.textContent = formatAddress(address);
        }

        // Convert microcode entry to human-readable text and set it in the action cell
        actionCell.textContent = microCodeToText(microCode[address]);

        // Set row ID for future reference
        newRow.id = `microcode-row-${address}`;

        // Append cells to the row and the row to the table
        newRow.appendChild(addressCell);
        newRow.appendChild(actionCell);
        mcTable.appendChild(newRow);
    }

    // Clear existing options in the instruction select dropdown
    instructionSelect = document.getElementById("ram-input-instruction-select");
    instructionSelect.innerHTML = "";

    // Populate the instruction select dropdown with macro instruction names
    populateInstructionSelect();

    // Highlight the current microcode row
    updateMicrocodeTableHighlighting();
}

/**
 * Updates all rows in the microcode table to reflect any changes in the microcode data.
 * 
 * @return {void}
 */
function updateMicroCodeTable() {
    for (let address = 0; address < MICROCODE_SIZE; address++) {
        updateMicroCodeTableRow(address);
    }
}

/**
 * Updates a specific row in the microcode table based on the given address.
 * 
 * @param {number} address 
 * @returns {void}
 */
function updateMicroCodeTableRow(address) {
    const row = document.getElementById(`microcode-row-${address}`);
    const actionCell = row.children[1];
    actionCell.textContent = microCodeToText(microCode[address]);
}

/**
 * Updates the name of a macro instruction in the microcode table based on the given opcode.
 *
 * @param {number} opcode the opcode of the macro instruction to update
 * @returns {void}
 */
function updateMicroCodeTableMacroInstructionName(opcode) {
    const element = document.getElementById(`microcode-row-${opcode * 10}`).children[0];
    if (!element) {
        console.warn(`Microcode table row not found for opcode ${opcode}. Cannot update macro instruction name.`);
        return;
    }

    const instructionName = instructionNames[opcode];
    if (instructionName) {
        element.textContent = `${formatAddress(opcode * 10)} ${instructionName}:`;
    } else {
        element.textContent = formatAddress(opcode * 10);
    }
}

/**
 * Updates the names of all macro instructions in the microcode table.
 *
 * @returns {void}
 */
function updateMicroCodeTableMacroInstructionNames() {
    for (let opcode = 0; opcode < MICROCODE_SIZE / 10; opcode++) {
        updateMicroCodeTableMacroInstructionName(opcode);
    }
}

/**
 * Updates the highlighting of the microcode table to reflect the current microcode counter.
 * 
 * @returns {void}
 */
function updateMicrocodeTableHighlighting() {
    for (let address = 0; address < MICROCODE_SIZE; address++) {
        const row = document.getElementById(`microcode-row-${address}`);
        if (address === microCodeCounter) {
            row.classList.add("selected");
        } else {
            row.classList.remove("selected");
        }
    }

    scrollToMicrocodeAddress(microCodeCounter);
}

/**
 * Scrolls the microcode table to ensure that the row corresponding to the given address is visible.
 *
 * @param {number} address the microcode address to scroll to
 * @returns {void}
 */
function scrollToMicrocodeAddress(address) {
    const row = document.getElementById(`microcode-row-${address}`);
    const container = document.getElementById("microcode-table-container");
    const rowsAbove = 5; // Number of rows to show above the selected row

    if (row) container.scrollTop = row.offsetTop - (rowsAbove * row.clientHeight);
}