/**
 * Records a micro-operation during the recording process and updates the microcode table accordingly.
 * Also saves the updated microcode to localStorage.
 * 
 * @param {number} microStepId The identifier for the micro-operation being recorded.
 * @returns {void}
 */
function recordMicroStep(microStepId) {
    if (!isRecording || recordMicroCodeAddress === null) return;

    project.setMicroCode(recordMicroCodeAddress, microStepId); // assume the microStepId is valid, so it can be used directly without additional validation
    updateMicroCodeTableRow(recordMicroCodeAddress); // Update the corresponding row in the microcode table
    recordMicroCodeAddress++; // Move to the next microcode address for the next step
}

/**
 * Starts the recording of a macro instruction.
 * Validates the input for the starting microcode address and instruction name, updates the instruction
 * names mapping, and updates the microcode table and instruction select dropdown accordingly.
 * 
 * @returns {boolean} true if recording started successfully, false otherwise
 */
function startRecording() {
    const recordStartAddressInput = document.getElementById("record-start-address");
    const recordInstructionNameInput = document.getElementById("record-instruction-name");

    try {
        // Validate and set the starting microcode address for recording
        recordMicroCodeAddress = toNumberStrict(recordStartAddressInput.value, "Record start address");

        // Check if the given address is within the valid range for microcode addresses
        if (recordMicroCodeAddress < 0 || recordMicroCodeAddress > (project.MICROCODE_SIZE - 10)) {
            throw new Error("Record start address is out of bounds.");
        }

        // Check if the given address is a multiple of 10, which is required for macro instruction recording
        if (recordMicroCodeAddress % 10 !== 0) {
            throw new Error("Record start address must be a multiple of 10.");
        }

        // Validate the instruction name input (max length of 5 characters)
        const instructionName = recordInstructionNameInput.value.trim();
        if (instructionName.length === 0) {
            throw new Error("Instruction name cannot be empty.");
        }

        if (instructionName.length > 5) {
            throw new Error("Instruction name is too long (max 5 characters).");
        }

        // Update the instructionNames mapping with the new instruction name for the corresponding opcode
        const opcode = recordMicroCodeAddress / 10;
        project.setInstructionName(opcode, instructionName); // Update the instruction name for the given opcode in the project data
        updateMicroCodeTableMacroInstructionName(opcode); // Update the corresponding row in the microcode table with the new instruction name
        populateInstructionSelect(); // Update the instruction select dropdown with the new instruction name
        updateRamTable(); // Update the RAM table to reflect any changes in instruction names

        return true; // Indicate that recording has successfully started
    } catch (error) {
        console.error("Error starting recording:", error);
        alert("Error starting recording. Please check your inputs.\n" +
            "See console for details.");

        // Reset recording state on error
        isRecording = false;
        recordMicroCodeAddress = null;
        return false; // Indicate that recording did not start due to an error
    }
}