/**
 * Executes the current micro-instruction pointed to by the microcode counter.
 *
 * @param {boolean} animate Whether to show an animation for data movement
 * @returns {void}
 */
function microStep(animate = true) {
    if (isHlt) {
        console.warn("[microStep] Execution is halted. Micro-steps are disabled until the simulator is reset. Only manual micro-steps are allowed.");
        return;
    }

    // Get the micro-instruction ID from the microcode at the current counter
    const id = Number(project.getMicroCode(microCodeCounter));

    // Check if FETCH is getting an instruction with opcode 0, which is leading to an infinite loop of executing the FETCH instruction.
    if (id === 5) { // 5 is the ins --> mc step, which is the last step of the FETCH instruction sequence
        const instruction = getDataHigh(instructionRegister);

        // If the instruction is 0, the FETCH instruction is calling itself repeatedly, which is likely an error in the program code.
        if (instruction === 0) {
            console.error(`[microStep] Invalid opcode 0 during FETCH at RAM address ${programCounter}.`);
            alert(`Invalid instruction detected at RAM address ${programCounter}. Please check your program and make sure it reaches HLT.`);
            stopAllExecutions();
            return;
        }
    }

    // Handle the case where microcode at the current counter is 0 (no-op) - this may indicate an error in the microcode for the current instruction
    if (id === 0) {
        console.error(`[microStep] Invalid microcode entry at address ${microCodeCounter}: micro-instruction ID 0.`);
        alert(`Invalid microcode entry detected at address ${microCodeCounter}. Please check the microcode table. Maybe forgot "mc:=0" at the end of the instruction sequence?`);
        stopAllExecutions();
        return;
    }

    // Execute the micro-instruction with the given ID
    executeMicroInstruction(id, animate);
}

/**
 * Executes the micro-instruction with the given ID with animation.
 * 
 * @param {number} id The ID of the micro-instruction to execute
 * @returns {void}
 */
function manualMicroStep(id) {
    executeMicroInstruction(id, true, true);
}

/**
 * Executes the micro-instruction with the given ID.
 *
 * @param {number} id The ID of the micro-instruction to execute
 * @param {boolean} animate Whether to show an animation for data movement
 * @param {boolean} isManual Whether the step is manual (affects microcode counter increment)
 * @returns {void}
 */
function executeMicroInstruction(id, animate = true, isManual = false) {
    const microStep = MICRO_INSTRUCTIONS[id];

    // Handle invalid micro-instruction ID
    if (!microStep) {
        console.error(`[executeMicroInstruction] Invalid micro-instruction ID ${id} at microcode address ${microCodeCounter}.`);
        alert(`Unknown micro-instruction detected at microcode address ${microCodeCounter}. Please verify the microcode table.`);
        stopAllExecutions();
        return;
    }

    // Execute the micro-instruction
    microStep.exec();

    // Record the micro-step if currently recording a macro instruction and this is a manual step
    if (isRecording && isManual) {
        recordMicroStep(id);
    }

    // Increment microcode counter if specified and not a manual step
    if (microStep.increment && !isManual) {
        writeToMicroCodeCounter(microCodeCounter + 1);
    }

    if (animate && microStep.animation !== null) {
        showDataMovementAnimation(microStep.animation);
    }

    // Update microcode table highlighting if not currently recording, to reflect the new microcode counter position
    if (!isRecording) {
        updateMicrocodeTableHighlighting();
    }
}


function dbToRamStep() {
    writeToRam(addressBus, dataBus);
    lastAccessedRamAddress = addressBus;
    updateRamTableHighlighting();
}

function ramToDbStep() {
    writeToDataBus(project.getRam(addressBus));
    lastAccessedRamAddress = addressBus;
    updateRamTableHighlighting();
}

function dbToInsStep() {
    writeToInstructionRegister(dataBus);
}

function insToAbStep() {
    const address = getDataLow(instructionRegister);
    writeToAddressBus(address);
}

function insToMcStep() {
    const microcodeAddress = getDataHigh(instructionRegister);
    writeToMicroCodeCounter(microcodeAddress * 10);

    // Update selected RAM address to match the new program counter
    selectedRamAddress = programCounter;
    updateRamTableHighlighting();
}

function nullMcStep() {
    writeToMicroCodeCounter(0);
}

function pcToAbStep() {
    writeToAddressBus(programCounter);
}

function incPcStep() {
    const newPcValue = programCounter + 1;
    writeToProgramCounter(newPcValue); // handle overflow in writeToProgramCounter
}

function incPcIfAccZeroStep() {
    if (accumulator === 0) {
        incPcStep();
    }
}

function insToPcStep() {
    const address = getDataLow(instructionRegister);
    writeToProgramCounter(address);
}

function nullAccStep() {
    writeToAccumulator(0);
}

function addAccStep() {
    const newAccValue = accumulator + dataBus;
    writeToAccumulator(newAccValue); // handle overflow in writeToAccumulator
}

function subAccStep() {
    const newAccValue = accumulator - dataBus;
    writeToAccumulator(newAccValue); // handle underflow in writeToAccumulator
}

function accToDbStep() {
    writeToDataBus(accumulator);
}

function incAccStep() {
    const newAccValue = accumulator + 1;
    writeToAccumulator(newAccValue); // handle overflow in writeToAccumulator
}

function decAccStep() {
    const newAccValue = accumulator - 1;
    writeToAccumulator(newAccValue); // handle underflow in writeToAccumulator
}

function dbToAccStep() {
    writeToAccumulator(dataBus);
}

function stopStep() {
    isHlt = true;

    setTimeout(() => { // delay alert to allow UI updates before blocking
        alert("Program stopped.");
    }, 0);
}

/**
 * @typedef {Object} MicroInstruction
 * @property {(() => void) | null} exec Function to execute the micro-instruction
 * @property {number|null} animation Animation ID for data movement animation
 * @property {boolean} increment Whether to increment the microcode counter after execution
 */

/** 
 * List of micro-instructions and their implementations
 * 
 * @type {Object<number, MicroInstruction>}
 */
const MICRO_INSTRUCTIONS = {
    1: { exec: dbToRamStep, animation: "overlay-db-ram", increment: true },
    2: { exec: ramToDbStep, animation: "overlay-ram-db", increment: true },
    3: { exec: dbToInsStep, animation: "overlay-db-ins", increment: true },
    4: { exec: insToAbStep, animation: "overlay-ins-ab", increment: true },
    5: { exec: insToMcStep, animation: "overlay-ins-mc", increment: false },
    7: { exec: nullMcStep, animation: "mc-null-button", increment: false },
    8: { exec: pcToAbStep, animation: "overlay-pc-ab", increment: true },
    9: { exec: incPcStep, animation: "pc-inc-button", increment: true },
    10: { exec: incPcIfAccZeroStep, animation: "pc-inc-null-button", increment: true },
    11: { exec: insToPcStep, animation: "overlay-ins-pc", increment: true },
    12: { exec: nullAccStep, animation: "acc-null-button", increment: true },
    13: { exec: addAccStep, animation: "overlay-db-acc", increment: true },
    14: { exec: subAccStep, animation: "overlay-db-acc", increment: true },
    15: { exec: accToDbStep, animation: "overlay-acc-db", increment: true },
    16: { exec: incAccStep, animation: "acc-inc-button", increment: true },
    17: { exec: decAccStep, animation: "acc-dec-button", increment: true },
    18: { exec: dbToAccStep, animation: "overlay-db-acc", increment: true },
    19: { exec: stopStep, animation: "mc-stop-button", increment: false },
    0: { exec: () => { }, animation: null, increment: false }
};