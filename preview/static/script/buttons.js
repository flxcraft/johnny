/**
 * Sets the address bus to the value entered in the manual input field.
 * 
 * @returns {void}
 */
function manualAddressBus() {
    try {
        let inputAddress = toNumberStrict(document.getElementById("ab-manual-input").value, "Address bus input");
        if (isNaN(inputAddress) || inputAddress < 0 || inputAddress >= project.RAM_SIZE) {
            throw new RangeError("Invalid address! Please enter a number between 0 and " + (project.RAM_SIZE - 1) + ".");
        }
        writeToAddressBus(inputAddress);
    } catch (error) {
        console.error("Error processing manual address bus input:", error);
        alert("An error occurred while processing the address bus input. Please enter a valid number.");
    }
}

/**
 * Sets the data bus to the value entered in the manual input field.
 * 
 * @returns {void}
 */
function manualDataBus() {
    try {
        let inputData = toNumberStrict(document.getElementById("db-manual-input").value, "Data bus input");
        if (isNaN(inputData) || inputData < 0 || inputData > project.MAX_RAM_VALUE) {
            throw new RangeError("Invalid data! Please enter a number between 0 and " + project.MAX_RAM_VALUE + ".");
        }
        writeToDataBus(inputData);
    } catch (error) {
        console.error("Error processing manual data bus input:", error);
        alert("An error occurred while processing the data bus input. Please enter a valid number.");
    }
}

/**
 * Updates the RAM input field when an instruction is selected from the dropdown.
 * It combines the selected instruction with the low part of the current input.
 * 
 * @returns {void}
 */
function instructionSelectOnChange() {
    try {
        const inputElement = document.getElementById("ram-input");
        const selectedValue = document.getElementById("ram-input-instruction-select").value;
        let inputValue = toNumberStrict(inputElement.value.replace(/\./g, '').replace(/,/g, '').trim(), "RAM input");

        inputValue = `${selectedValue}${formatDataLow(inputValue)}`;
        inputElement.value = formatData(inputValue);
    } catch (error) {
        console.error("Error processing instruction select change:", error);
        alert("An error occurred while processing the instruction selection. Please try again.");
    }
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
    for (let opcode = 1; opcode <= getObjectBiggestKey(project.getInstructionNames()); opcode++) {
        const instructionName = project.getInstructionName(opcode);
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
    try {
        let inputData = toNumberStrict(document.getElementById("ram-input").value.replace(/^0+/, '').replace(/\./g, '').replace(/,/g, '').trim(), "RAM input");
        if (isNaN(inputData) || inputData < 0 || inputData > project.MAX_RAM_VALUE) {
            throw new RangeError("Invalid RAM value! Please enter a number between 0 and " + project.MAX_RAM_VALUE + ".");
        }

        writeToRam(selectedRamAddress, inputData);
        selectedRamAddress = (selectedRamAddress + 1) % project.RAM_SIZE; // Modulo to wrap around to the beginning of RAM
        updateRamTableHighlighting(false); // Update highlighting without scrolling to selected address
    } catch (error) {
        console.error("Error processing manual RAM input:", error);
        alert("An error occurred while processing the RAM input. Please enter a valid number.");
    }
}

/**
 * Updates the macro execution delay based on the speed slider value.
 * 
 * @returns {void}
 */
function updateMacroExecutionDelay() {
    try {
        const speedSlider = document.getElementById("macro-run-speed");
        macroExecutionDelay = 1000 - toNumberStrict(speedSlider.value, "Macro run speed");
    } catch (error) {
        console.error("Error processing macro run speed input:", error);
        alert("An error occurred while processing the macro run speed input. Please enter a valid number.");
    }
}

/**
 * Downloads the current RAM contents as a .ram file.
 * 
 * @returns {void}
 */
function downloadRamAsFile() {
    downloadData("ram.ram", project.exportLegacyRam());
}

/** 
 * Prompts the user to upload a .ram file and imports its contents into the RAM, updating the RAM table accordingly.
 * The function uses the uploadData utility to handle file selection and reading, and includes error handling to manage potential issues during the import process.
 * 
 * @returns {void}
 */
function uploadRamAsFile() {
    uploadData(".ram", function (fileContent, filename) {
        try {
            project.importLegacyRam(fileContent);
            resetSimulator();
            updateRamTable();
            console.info("RAM imported from file:", filename);
        } catch (error) {
            console.error("Error importing RAM from file:", error);
            alert("An error occurred while importing RAM from the file. Please make sure the file is a valid .ram file.");
        }
    });
}

/**
 * Downloads the current microcode contents as a .mcode file.
 * 
 * @returns {void}
 */
function downloadMicrocodeAsFile() {
    downloadData("microcode.mc", project.exportLegacyMicroCode());
}

/** 
 * Prompts the user to upload a .mc file and imports its contents into the microcode, updating the microcode table accordingly.
 * The function uses the uploadData utility to handle file selection and reading, and includes error handling to manage potential issues during the import process.
 * 
 * @returns {void}
 */
function uploadMicroCodeAsFile() {
    uploadData(".mc", function (fileContent, filename) {
        try {
            project.importLegacyMicroCode(fileContent);
            resetSimulator();
            updateMicroCodeTable();
            populateInstructionSelect();
            updateMicroCodeTableMacroInstructionNames();
            updateRamTable(); // Update RAM table to reflect any changes in instruction names
            console.info("Micro Code imported from file:", filename);
        } catch (error) {
            console.error("Error importing Micro Code from file:", error);
            alert("An error occurred while importing Micro Code from the file. Please make sure the file is a valid .mc file.");
        }
    });
}

/**
 * Downloads the entire project (RAM and microcode) as a .johnny file.
 * 
 * @returns {void}
 */
function downloadProjectAsFile() {
    downloadData("project.johnny", project.export(), "application/json");
}

/**
 * Prompts the user to upload a .johnny project file and imports its contents into the simulator, updating the RAM and microcode tables accordingly.
 * The function uses the uploadData utility to handle file selection and reading, and includes error handling to manage potential issues during the import process.
 * 
 * @returns {void}
 */
function uploadProjectFromFile() {
    uploadData(".johnny", function (fileContent, filename) {
        try {
            project.import(fileContent);
            resetSimulator();
            updateRamTable();
            updateMicroCodeTable();
            populateInstructionSelect();
            updateMicroCodeTableMacroInstructionNames();
            console.info("Project imported from file:", filename);
        } catch (error) {
            console.error("Error importing project from file:", error);
            alert("An error occurred while importing the project. Please make sure the file is a valid .johnny project file.");
        }
    });
}

/**
 * Resets the RAM to an empty state and updates the display.
 * 
 * @returns {void}
 */
function resetRamToEmpty() {
    project.resetRam(); // Reset RAM to default values (0 for all addresses)
    updateRamTable();
}

/**
 * Resets the microcode to the default program and updates the display.
 * 
 * @returns {void}
 */
function resetMicrocodeToDefault() {
    project.resetMicroCode(); // Reset microcode to default values
    updateMicroCodeTable();
    populateInstructionSelect();
    updateMicroCodeTableMacroInstructionNames();
    updateRamTable(); // Update RAM table to reflect any changes in instruction names
}

/**
 * Toggles the visibility of the control unit, updates the corresponding setting and saves it to localStorage.
 * 
 * @returns {void}
 */
function toggleControlUnit() {
    try {
        settings.set("showControlUnit", !settings.get("showControlUnit"));
    } catch (error) {
        console.error("Error toggling control unit visibility:", error);
        alert("An error occurred while toggling control unit visibility.");
        return;
    }

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

    try {
        if (settings.get("showControlUnit")) { // Show control unit
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
    } catch (error) {
        console.error("Error updating control unit visibility:", error);
        alert("An error occurred while updating control unit visibility.");
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
    updateMicrocodeTableHighlighting();
}