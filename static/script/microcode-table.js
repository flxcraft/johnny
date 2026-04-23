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
    addressHeader.textContent = "Address";
    const actionHeader = document.createElement("th");
    actionHeader.textContent = "Action";
    headerRow.appendChild(addressHeader);
    headerRow.appendChild(actionHeader);
    mcTable.appendChild(headerRow);

    // Create table rows for each microcode entry
    for (let address = 0; address < project.MICROCODE_SIZE; address++) {
        const newRow = document.createElement("tr");
        const addressCell = document.createElement("td");
        const actionCell = document.createElement("td");

        // Add instruction names for addresses that are multiples of 10 (macro instruction entries)
        if (address % 10 === 0) {
            const instructionNumber = address / 10;
            const instructionName = project.getInstructionName(instructionNumber);
            if (instructionName) {
                addressCell.textContent = `${formatMicroCodeAddress(address)} ${instructionName}:`;
            } else {
                addressCell.textContent = formatMicroCodeAddress(address);
            }
        } else {
            addressCell.textContent = formatMicroCodeAddress(address);
        }

        // Convert microcode entry to human-readable text and set it in the action cell
        actionCell.textContent = getMicroInstructionName(project.getMicroCode(address));

        // Set row ID for future reference
        newRow.id = `microcode-row-${address}`;

        newRow.ondblclick = () => {
            openMicroCodeEditModal(address);
        }

        // Append cells to the row and the row to the table
        newRow.appendChild(addressCell);
        newRow.appendChild(actionCell);
        mcTable.appendChild(newRow);
    }

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
    for (let address = 0; address < project.MICROCODE_SIZE; address++) {
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
    actionCell.textContent = getMicroInstructionName(project.getMicroCode(address));
}

/**
 * Updates the name of a macro instruction in the microcode table based on the given opcode.
 *
 * @param {number} opcode the opcode of the macro instruction to update
 * @returns {void}
 */
function updateMicroCodeTableMacroInstructionName(opCode) {
    const element = document.getElementById(`microcode-row-${opCode * 10}`).children[0];
    if (!element) {
        console.warn(`[updateMicroCodeTableMacroInstructionName] No table row found for opcode ${opCode}.`);
        return;
    }

    const instructionName = project.getInstructionName(opCode);
    if (instructionName) {
        element.textContent = `${formatMicroCodeAddress(opCode * 10)} ${instructionName}:`;
    } else {
        element.textContent = formatMicroCodeAddress(opCode * 10);
    }
}

/**
 * Updates the names of all macro instructions in the microcode table.
 *
 * @returns {void}
 */
function updateMicroCodeTableMacroInstructionNames() {
    for (let opcode = 0; opcode < project.MICROCODE_SIZE / 10; opcode++) {
        updateMicroCodeTableMacroInstructionName(opcode);
    }
}

/**
 * Updates the highlighting of the microcode table to reflect the current microcode counter.
 * 
 * @returns {void}
 */
function updateMicrocodeTableHighlighting() {
    for (let address = 0; address < project.MICROCODE_SIZE; address++) {
        const row = document.getElementById(`microcode-row-${address}`);
        if (address === microCodeCounter) {
            row.classList.add("selected");
        } else {
            row.classList.remove("selected");
        }
    }

    scrollToMicroCodeAddress(microCodeCounter);
}

/**
 * Highlights a specific row in the microcode table to indicate the current recording position.
 *
 * @param {number} address the microcode address to highlight
 * @returns {void}
 */
function highlightMicroCodeTableRow(address) {
    const row = document.getElementById(`microcode-row-${address}`);
    
    // highlighlight for 500ms to indicate the current recording position, but only if the row exists (address is valid)
    if (row) {
        row.classList.add("highlight");
        setTimeout(() => {
            row.classList.remove("highlight");
        }, 500);
    }
}

/**
 * Opens the microcode edit modal for the given address, allowing the user to edit the micro instruction at that address.
 *
 * @param {number} address the microcode address to edit
 * @returns {void}
 */
function openMicroCodeEditModal(address) {
    const editModal = document.getElementById("microcode-edit-modal");
    const addressDisplay = document.getElementById("microcode-edit-address");
    const microInstructionSelect = document.getElementById("micro-instruction-select");

    addressDisplay.textContent = address;

    // Populate the micro instruction select dropdown with options
    microInstructionSelect.innerHTML = ""; // Clear existing options
    for (const [code, description] of Object.entries(MicroInstructionNames)) {
        const option = document.createElement("option");
        option.value = code;
        option.textContent = `${code}: ${description}`;

        // Pre-select the current microcode value for the address
        if (Number(code) === project.getMicroCode(address)) {
            option.selected = true;
        }

        microInstructionSelect.appendChild(option);
    }

    editModal.classList.add("active");
}

/**
 * Closes the microcode edit modal.
 *
 * @returns {void}
 */
function closeMicroCodeEditModal() {
    const editModal = document.getElementById("microcode-edit-modal");
    editModal.classList.remove("active");
}

/**
 * Saves the changes made in the microcode edit modal, updating the microcode data and the corresponding table row.
 *
 * @returns {void}
 */
function saveMicroCodeEdit() {
    try {
        const address = Number(document.getElementById("microcode-edit-address").textContent);
        const microInstructionSelect = document.getElementById("micro-instruction-select");
        const selectedMicroInstruction = Number(microInstructionSelect.value);
        project.setMicroCode(address, selectedMicroInstruction); // assume the dropdown values are valid, so they can be used directly without additional validation

        updateMicroCodeTableRow(address);
        closeMicroCodeEditModal();
    } catch (error) {
        console.error("[saveMicroCodeEdit] Failed to save microcode edit:", error);
        alert("Could not save the microcode change. Please try again.");
    }
}

/**
 * Scrolls the microcode table so the selected row starts at 20% from the top of the visible container.
 *
 * @param {number} address the microcode address to scroll to
 * @returns {void}
 */
function scrollToMicroCodeAddress(address) {
    if (!settings.get("autoScrollMicroCode")) return; // only auto-scroll if enabled

    const row = document.getElementById(`microcode-row-${address}`);
    const container = document.getElementById("microcode-table-container");
    if (!row || !container) return;

    const targetOffsetFromTop = container.clientHeight * 0.2; // 20% from top
    const targetScrollTop = row.offsetTop - targetOffsetFromTop;

    // Keep scrollTop in valid bounds
    const maxScrollTop = container.scrollHeight - container.clientHeight;
    container.scrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop));
}