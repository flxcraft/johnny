/**
 * Writes a value to the specified RAM address and updates the RAM table.
 * If an invalid address or value is provided, it stops all executions and shows an error message.
 *
 * @param {number|string} address RAM address (0 … project.RAM_SIZE-1)
 * @param {number|string} value Data value to write (0 … project.MAX_RAM_VALUE)
 * @returns {void}
 */
function writeToRam(address, value) {
    try {
        address = normalizeInt(address, 0, project.RAM_SIZE - 1, "RAM address");
        value = normalizeInt(value, 0, project.MAX_RAM_VALUE, "RAM data");

        project.setRam(address, value);
        updateRamTableRow(address);
    } catch (error) {
        stopAllExecutions("Invalid RAM address or data value");
    }
}

/**
 * Writes a value to the address bus and updates the display.
 * If an invalid value is provided, it stops all executions and shows an error message.
 *
 * @param {number|string} value Address value (0 … project.RAM_SIZE-1)
 * @returns {void}
 */
function writeToAddressBus(value) {
    try {
        addressBus = normalizeInt(value, 0, project.RAM_SIZE - 1, "Address bus value");
        document.getElementById("ab-field").innerText = formatRamAddress(addressBus);
    } catch (error) {
        stopAllExecutions("Invalid address bus value");
    }
}

/**
 * Writes a value to the data bus and updates the display.
 * If an invalid value is provided, it stops all executions and shows an error message.
 *
 * @param {number|string} value Data value (0 … project.MAX_RAM_VALUE)
 * @returns {void}
 */
function writeToDataBus(value) {
    try {
        dataBus = normalizeInt(value, 0, project.MAX_RAM_VALUE, "Data bus value");
        document.getElementById("db-field").innerText = formatData(dataBus);
    } catch (error) {
        stopAllExecutions("Invalid data bus value");
    }
}

/**
 * Writes a value to the accumulator and updates the display.
 * If an invalid value is provided, it stops all executions and shows an error message.
 *
 * @param {number|string} value Accumulator value (0 … project.MAX_RAM_VALUE)
 * @returns {void}
 */
function writeToAccumulator(value) {
    try {
        accumulator = normalizeInt(value, 0, project.MAX_RAM_VALUE, "Accumulator value");
        document.getElementById("acc-field").innerText = formatData(accumulator);
    } catch (error) {
        stopAllExecutions("Invalid accumulator value");
    }

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
 * If an invalid value is provided, it stops all executions and shows an error message.
 *
 * @param {number|string} value Program counter value (0 … project.RAM_SIZE-1)
 * @returns {void}
 */
function writeToProgramCounter(value) {
    try {
        programCounter = normalizeInt(value, 0, project.RAM_SIZE - 1, "Program counter value");
        document.getElementById("pc-field").innerText = formatRamAddress(programCounter);
    } catch (error) {
        stopAllExecutions("Invalid program counter value");
    }
}

/**
 * Writes a value to the instruction register and updates the display.
 * If an invalid value is provided, it stops all executions and shows an error message.
 *
 * @param {number|string} value Instruction word (0 … project.MAX_RAM_VALUE)
 * @returns {void}
 */
function writeToInstructionRegister(value) {
    try {
        instructionRegister = normalizeInt(value, 0, project.MAX_RAM_VALUE, "Instruction register value");
        document.getElementById("ins-high").innerText = formatDataHigh(instructionRegister);
        document.getElementById("ins-low").innerText = formatDataLow(instructionRegister);
    } catch (error) {
        stopAllExecutions("Invalid instruction register value");
    }
}

/**
 * Writes a value to the microcode counter and updates the display and highlighting.
 * If an invalid value is provided, it stops all executions and shows an error message.
 *
 * @param {number|string} value Microcode address (0 … project.MICROCODE_SIZE-1)
 * @returns {void}
 */
function writeToMicroCodeCounter(value) {
    try {
        microCodeCounter = normalizeInt(value, 0, project.MICROCODE_SIZE - 1, "Microcode counter value");
        document.getElementById("mc-field").innerText = formatMicroCodeAddress(microCodeCounter);
        updateMicrocodeTableHighlighting();
    } catch (error) {
        stopAllExecutions("Invalid microcode counter value");
    }
}

/**
 * Converts a value to a finite number. Throws an error if conversion fails.
 *
 * @param {number|string} value Value to convert
 * @returns {number} Converted finite number
 * @throws {TypeError} If value is not a finite number
 */
function toNumberStrict(value, context = "Value") {
    // If the value is a string, attempt to convert it to a number
    if (typeof value === "string") {
        value = Number(value.trim());
    }

    // Check if the value is a finite number (not NaN or Infinity)
    if (!Number.isFinite(value)) {
        throw new TypeError(`${context} is not a valid finite number: ` + value);
    }
    return value;
}

/**
 * Tries to convert a value to a finite integer and checks if it's within the allowed range.
 * In case of an invalid input, it throws an error.
 *
 * @param {number|string} value Value to normalize
 * @param {number} min Minimum allowed value
 * @param {number} max Maximum allowed value
 * @param {string} context Context used for logging (default: "Value")
 * @returns {number} Normalized (finite and clamped) number
 * @throws {TypeError} If the value cannot be converted to a finite number
 * @throws {RangeError} If the value is outside the specified range
 */
function normalizeInt(value, min, max, context = "Value") {
    // Convert the value to a finite number and convert to an integer
    // If the conversion fails (e.g., value is not a number or is infinite), a TypeError will be thrown
    const num = Math.trunc(toNumberStrict(value, context));

    // Check if the number is within the specified range
    // If it's not, throw a RangeError with a descriptive message
    if (num < min || num > max) {
        throw new RangeError(`${context} is not in the range of ${min} to ${max}.`);
    }

    // If the number is valid, return it
    return num;
}