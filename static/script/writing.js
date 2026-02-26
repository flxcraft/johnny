/**
 * Writes a value to the specified RAM address and updates the RAM table.
 *
 * @param {number|string} address RAM address (0 … RAM_SIZE-1)
 * @param {number|string} value Data value to write (0 … DATA_MAX_SIZE-1)
 * @returns {void}
 */
function writeToRam(address, value) {
    address = normalizeInt(address, 0, RAM_SIZE - 1, "RAM address");
    value = normalizeInt(value, 0, RAM_MAX_VALUE, "RAM data");

    ram[address] = value;
    saveRamToLocalStorage();
    updateRamTableRow(address);
}

/**
 * Writes a value to the specified microcode address and updates the microcode table.
 *
 * @param {number|string} address Microcode address (0 … MICROCODE_SIZE-1)
 * @param {number|string} value Microcode data value (0 … max microcode value)
 * @returns {void}
 */
function writeToMicroCode(address, value) {
    address = normalizeInt(address, 0, MICROCODE_SIZE - 1, "Microcode address");
    value = normalizeInt(value, 0, getObjectBiggestKey(MicroInstructionNames), "Microcode data");

    microCode[address] = value;
    saveMicroCodeToLocalStorage();
    updateMicroCodeTableRow(address);
}

/**
 * Writes a value to the address bus and updates the display.
 *
 * @param {number|string} value Address value (0 … RAM_SIZE-1)
 * @returns {void}
 */
function writeToAddressBus(value) {
    addressBus = normalizeInt(value, 0, RAM_SIZE - 1, "Address bus value");
    document.getElementById("ab-field").innerText = formatAddress(addressBus);
}

/**
 * Writes a value to the data bus and updates the display.
 *
 * @param {number|string} value Data value (0 … DATA_MAX_SIZE-1)
 * @returns {void}
 */
function writeToDataBus(value) {
    dataBus = normalizeInt(value, 0, RAM_MAX_VALUE, "Data bus value");
    document.getElementById("db-field").innerText = formatData(dataBus);
}

/**
 * Writes a value to the accumulator and updates the display.
 *
 * @param {number|string} value Accumulator value (0 … DATA_MAX_SIZE-1)
 * @returns {void}
 */
function writeToAccumulator(value) {
    accumulator = normalizeInt(value, 0, RAM_MAX_VALUE, "Accumulator value");
    document.getElementById("acc-field").innerText = formatData(accumulator);

    // Update accumulator zero indicator
    const accZeroIndicator = document.getElementById("overlay-equal-zero");
    if (!accZeroIndicator) return;
    if (accumulator === 0) {
        accZeroIndicator.classList.add("active");
    } else {
        accZeroIndicator.classList.remove("active");
    }
}

/**
 * Writes a value to the program counter and updates the display.
 *
 * @param {number|string} value Program counter value (0 … RAM_SIZE-1)
 * @returns {void}
 */
function writeToProgramCounter(value) {
    programCounter = normalizeInt(value, 0, RAM_SIZE - 1, "Program counter value");;
    document.getElementById("pc-field").innerText = formatAddress(programCounter);
}

/**
 * Writes a value to the instruction register and updates the display.
 *
 * @param {number|string} value Instruction word (0 … DATA_MAX_SIZE-1)
 * @returns {void}
 */
function writeToInstructionRegister(value) {
    instructionRegister = normalizeInt(value, 0, RAM_MAX_VALUE, "Instruction register value");
    document.getElementById("ins-high").innerText = formatDataHigh(instructionRegister);
    document.getElementById("ins-low").innerText = formatDataLow(instructionRegister);
}

/**
 * Writes a value to the microcode counter and updates the display and highlighting.
 *
 * @param {number|string} value Microcode address (0 … MICROCODE_SIZE-1)
 * @returns {void}
 */
function writeToMicroCodeCounter(value) {
    microCodeCounter = normalizeInt(value, 0, MICROCODE_SIZE - 1, "Microcode counter value");
    document.getElementById("mc-field").innerText = formatAddress(microCodeCounter);
    updateMicrocodeTableHighlighting();
}

/**
 * Converts a value to a finite number.
 * Throws an error if conversion fails.
 *
 * @param {number|string} value Value to convert
 * @param {string} [context="Value"] Optional context for error messages
 * @returns {number} Converted finite number
 * @throws {TypeError} If value is not a finite number
 */
function toNumberStrict(value, context = "Value") {
    const num = Number(value);
    if (!Number.isFinite(num)) { // check for NaN and Infinity
        console.error(context + " is not a valid finite number:", value);
        throw new TypeError(context + " is not a valid finite number: " + value);
    }
    return num;
}

/**
 * Clamps a numeric value between a minimum and maximum.
 *
 * @param {number} value Value to clamp
 * @param {number} min Minimum allowed value
 * @param {number} max Maximum allowed value
 * @returns {number} Clamped value
 */
function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

/**
 * Converts a value to a finite integer and clamps it within given bounds.
 * Logs a warning if the value is outside the allowed range.
 *
 * @param {number|string} value Value to normalize
 * @param {number} min Minimum allowed value
 * @param {number} max Maximum allowed value
 * @param {string} [context="Value"] Context used for logging
 * @returns {number} Normalized (finite and clamped) number
 */
function normalizeInt(value, min, max, context = "Value") {
    const num = Math.trunc(toNumberStrict(value, context));
    if (num < min || num > max) {
        console.warn(`${context} out of range: ${num} (clamped to ${min}-${max})`);
    }
    return clamp(num, min, max);
}