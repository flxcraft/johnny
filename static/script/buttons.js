/**
 * Sets the address bus to the value entered in the manual input field.
 * 
 * @returns {void}
 */
function manualAddressBus() {
    let inputAddress = Number(document.getElementById("ab-manual-input").value);
    if (isNaN(inputAddress) || inputAddress < 0 || inputAddress >= RAM_SIZE) {
        alert("Invalid address! Please enter a number between 0 and " + (RAM_SIZE - 1) + ".");
        return;
    }
    writeToAddressBus(inputAddress);
}

/**
 * Sets the data bus to the value entered in the manual input field.
 * 
 * @returns {void}
 */
function manualDataBus() {
    let inputData = Number(document.getElementById("db-manual-input").value);
    if (isNaN(inputData) || inputData < 0 || inputData > RAM_MAX_VALUE) {
        alert("Invalid data! Please enter a number between 0 and " + RAM_MAX_VALUE + ".");
        return;
    }
    writeToDataBus(inputData);
}

/**
 * Updates the RAM input field when an instruction is selected from the dropdown.
 * It combines the selected instruction with the low part of the current input.
 * 
 * @returns {void}
 */
function instructionSelectOnChange() {
    const selectElement = document.getElementById("ram-input-instruction-select");
    const selectedValue = selectElement.value;
    const inputElement = document.getElementById("ram-input");
    let inputValue = inputElement.value.replace('.', '').replace(',', '');

    inputValue = `${selectedValue}${formatDataLow(inputValue)}`;
    inputElement.value = formatData(inputValue);
}

/**
 * Populates the instruction select dropdown with the names of macro instructions defined in the instructionNames object.
 * The dropdown options are generated based on the opcodes and their corresponding instruction names.
 * 
 * @returns {void}
 */
function populateInstructionSelect() {
    // Clear existing options in the instruction select dropdown
    const instructionSelect = document.getElementById("ram-input-instruction-select");
    instructionSelect.innerHTML = "";

    // Append macro instruction names if present
    for (let opcode = 1; opcode <= getObjectBiggestKey(instructionNames); opcode++) {
        const instructionName = instructionNames[opcode];
        if (instructionName) {
            const option = document.createElement("option");
            option.value = opcode;
            option.textContent = `${opcode}: ${instructionName}`;
            instructionSelect.appendChild(option);
        }
    }
}

/**
 * Sets the RAM at the selected memory address to the value entered in the RAM input field and jumps to the next row / address.
 * 
 * @returns {void}
 */
function manualRamInput() {
    let inputData = Number(document.getElementById("ram-input").value.replace(/^0+/, '').replace('.', '').replace(',', ''));
    if (isNaN(inputData) || inputData < 0 || inputData > RAM_MAX_VALUE) {
        alert("Invalid data! Please enter a number between 0 and " + RAM_MAX_VALUE + ".");
        return;
    }
    writeToRam(selectedRamAddress, inputData);
    selectedRamAddress = (selectedRamAddress + 1) % RAM_SIZE;
    updateRamTableHighlighting(false); // Update highlighting without scrolling to selected address
}

/**
 * Updates the macro execution delay based on the speed slider value.
 * 
 * @returns {void}
 */
function updateMacroExecutionDelay() {
    const speedSlider = document.getElementById("macro-run-speed");
    macroExecutionDelay = 1000 - Number(speedSlider.value);
    console.info("Macro execution delay set to:", macroExecutionDelay, "ms");
}

/**
 * Downloads the current RAM contents as a .ram file.
 * 
 * @returns {void}
 */
function downloadRamAsFile() {
    downloadData("ram.ram", ram);
}

/**
 * Downloads the current microcode contents as a .mcode file.
 * 
 * @returns {void}
 */
function downloadMicrocodeAsFile() {
    const microCodeData = [...microCode, ...Object.values(instructionNames)];
    downloadData("microcode.mc", microCodeData);
}

/**
 * Resets the RAM to an empty state and updates the display.
 * 
 * @returns {void}
 */
function resetRamToEmpty() {
    ram = generateEmptyRam();
    saveRamToLocalStorage();
    updateRamTable();
}

/**
 * Resets the microcode to the default program and updates the display.
 * 
 * @returns {void}
 */
function resetMicrocodeToDefault() {
    importMicroCodeArray(null); // passing null to load default microcode
    updateMicroCodeTable();
    populateInstructionSelect();
    updateMicroCodeTableMacroInstructionNames();
}

/**
 * Imports RAM contents from a selected .ram file.
 *
 * @param {Event} event The file input change event
 * @returns {void}
 */
function importRamFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const lines = e.target.result.split(/\r?\n/);
        resetRamToEmpty(); // Clear existing RAM before importing new data

        let address = 0;
        for (let i = 0; i < lines.length && address < RAM_SIZE; i++) {
            // Remove in-line comments and trim whitespace
            const line = lines[i].split('#')[0].trim();

            // Skip empty lines and comments
            if (!line) continue;

            // Validate that the line contains a valid number within the allowed range
            const value = Number(line);
            if (!Number.isInteger(value) || value < 0 || value > RAM_MAX_VALUE) {
                console.warn(`Invalid RAM value at line ${i + 1}: "${line}" → 0`);
                writeToRam(address, 0);
            } else {
                writeToRam(address, value);
            }
            address++;
        }

        // Reset simulator state after importing new RAM data
        resetSimulator();
        event.target.value = ""; // reset file input
        console.info("RAM imported from file:", file.name);
    }

    reader.onerror = function (e) {
        console.error("Error reading RAM file:", e);
        alert("Error reading RAM file.");
    }

    reader.readAsText(file);
}

/**
 * Imports microcode contents from a selected .mcode file.
 * 
 * @param {Event} event The file input change event
 * @returns {void}
 */
function importMicroCodeFromFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const lines = e.target.result.split(/\r?\n/)
            .map(line => line.split('#')[0].trim()) // Remove in-line comments and trim whitespace
            .filter(line => line); // Remove empty lines

        if (lines.length < MICROCODE_SIZE) {
            console.error(`Invalid microcode file: expected at least ${MICROCODE_SIZE} lines, but got ${lines.length}.`);
            alert(`Invalid microcode file! Expected at least ${MICROCODE_SIZE} lines, but got ${lines.length}.`);
            return;
        }

        importMicroCodeArray(lines);

        // Reset simulator state after importing new microcode data
        resetSimulator();
        event.target.value = ""; // reset file input
        console.info("Micro Code imported from file:", file.name);
    }

    reader.onerror = function (e) {
        console.error("Error reading Micro Code file:", e);
        alert("Error reading Micro Code file.");
    }

    reader.readAsText(file);
}

/**
 * Toggles the visibility of the control unit, updates the corresponding setting and saves it to localStorage.
 * 
 * @returns {void}
 */
function toggleControlUnit() {
    settings.showControlUnit = !settings.showControlUnit;
    settings.save(); // Save the updated setting to localStorage

    updateControlUnitVisibility();
}

/**
 * Updates the visibility of the control unit elements based on the current state of the `showControlUnit` setting.
 * 
 * @returns {void}
 */
function updateControlUnitVisibility() {
    const controlUnitCover = document.getElementById("overlay-control-unit-cover");
    const controlUnitElements = document.getElementsByClassName("control-unit-element");

    if (settings.showControlUnit) { // Show control unit
        // Hide control unit cover
        controlUnitCover.classList.remove("active");

        // Show control unit elements
        for (let element of controlUnitElements) {
            element.classList.remove("hidden");
        }
    } else { // Hide control unit
        // Show control unit cover
        controlUnitCover.classList.add("active");

        // Hide control unit elements
        for (let element of controlUnitElements) {
            element.classList.add("hidden");
        }
    }
}

/**
 * Toggles the recording state for macro instructions and updates the UI to reflect the current state.
 * When recording is active, the record panel will have a "recording" class added for visual feedback.
 * 
 * @returns {void}
 */
function toggleRecording() {
    isRecording = !isRecording;
    const recordPanel = document.getElementById("mc-record-panel");
    if (isRecording) {
        if (!startRecording()) return;
        recordPanel.classList.add("recording");
    } else {
        recordMicroCodeAddress = null;
        recordPanel.classList.remove("recording");
    }
}

/**
 * Toggles the visibility of the settings modal.
 * 
 * @returns {void}
 */
function toggleSettingsModal() {
    const settingsModal = document.getElementById("settings-modal");
    settingsModal.classList.toggle("active");
}

/**
 * Resets the simulator to its initial state.
 * 
 * @returns {void}
 */
function resetSimulator() {
    stopMacroProgram();
    isHlt = false;

    writeToAddressBus(0);
    writeToDataBus(0);
    writeToInstructionRegister(0);
    writeToMicroCodeCounter(0);
    writeToAccumulator(0);
    writeToProgramCounter(0);

    selectedRamAddress = 0;
    lastAccessedRamAddress = null;
    updateRamTableHighlighting();
}