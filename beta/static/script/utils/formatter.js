// A mapping of microcode instruction codes to their human-readable names for display in the microcode table.
const MicroInstructionNames = Object.freeze({
    0: "---",
    1: "db ---> ram",
    2: "ram ---> db",
    3: "db ---> ins",
    4: "ins ---> ab",
    5: "ins ---> mc",
    7: "mc:=0",
    8: "pc ---> ab",
    9: "pc++",
    10: "acc=0?->pc++",
    11: "ins ---> pc",
    12: "acc:=0",
    13: "plus",
    14: "minus",
    15: "acc ---> db",
    16: "acc++",
    17: "acc--",
    18: "db ---> acc",
    19: "stop"
});

/**
 * Returns the human-readable name of a micro instruction based on its code.
 * If the code is not found in the microInstructionNames mapping, it returns "Unknown (code)".
 * 
 * @param {number} code the micro instruction code to get the name for
 * @returns {string} the name of the micro instruction
 */
function getMicroInstructionName(code) {
    return MicroInstructionNames[code] || `Unknown (${code})`;
}

/**
 * Returns the length of a number when converted to a string, ignoring the minus sign. (e.g., -123 -> 3)
 * 
 * @param {number} number the number to get the length of
 * @returns {number} the length of the number when converted to a string
 */
function getNumberLength(number) {
    return Math.abs(number).toString().length;
}

/**
 * Formats an address to a 3-digit string with leading zeros. (e.g., 5 -> "005")
 * 
 * @param {*} address 
 * @returns {string}
 */
function formatRamAddress(address) {
    const length = getNumberLength(project.RAM_SIZE - 1);
    return String(address).padStart(length, '0');
}

/**
 * Formats an address to a 3-digit string with leading zeros. (e.g., 5 -> "005")
 * 
 * @param {*} address 
 * @returns {string}
 */
function formatMicroCodeAddress(address) {
    const length = getNumberLength(project.MICROCODE_SIZE - 1);
    return String(address).padStart(length, '0');
}

/**
 * Formats data to a string with a decimal point after the second digit. (e.g., 12345 -> "12.345")
 * 
 * @param {*} data 
 * @returns {string}
 */
function formatData(data) {
    const length = getNumberLength(project.MAX_RAM_VALUE);
    const s = String(data).padStart(length, '0');
    return s.slice(0, length - 3) + '.' + s.slice(length - 3);
}

/**
 * Gets the high part (first two digits) of the data.
 *
 * @param {number} data 
 * @returns {number}
 */
function getDataHigh(data) {
    return Math.trunc(data / 1000); // 1000 because the low part is 3 digits
}

/**
 * Gets the low part (last three digits) of the data.
 * 
 * @param {number} data
 * @returns {number}
 */
function getDataLow(data) {
    return data % 1000; // 1000 because the low part is 3 digits
}

/**
 * Formats the high part of the data to a 2-digit string with leading zeros.  (e.g., 5 -> "05")
 * 
 * @param {number} data
 * @returns {string}
 */
function formatDataHigh(data) {
    const length = getNumberLength(project.MAX_RAM_VALUE) - 3; // 3 digits for the low part
    return String(getDataHigh(data)).padStart(length, '0');
}

/**
 * Formats the low part of the data to a 3-digit string with leading zeros. (e.g., 5 -> "005")
 * 
 * @param {number} data
 * @returns {string}
 */
function formatDataLow(data) {
    return String(getDataLow(data)).padStart(3, '0');
}

/**
 * Converts data to its corresponding assembly instruction and operand.
 * If the opcode is 0 (FETCH) or not found in instructionNames, it returns an empty instruction and the operand as is.
 * 
 * @param {number} data 
 * @returns {Object} An object containing the instruction name and operand.
 */
function dataToAsm(data) {
    const opCode = getDataHigh(data);
    const operand = getDataLow(data);

    const instruction = project.getInstructionName(opCode);
    if (!instruction || opCode === 0) { // if opcode is 0 (FETCH) or not found in instructionNames, treat as empty
        return { instruction: "", operand: operand };
    }

    return { instruction, operand };
}

/**
 * Gets the largest numeric key from an object.
 *
 * @param {Object} object
 * @return {number} The largest numeric key in the object.
 */
function getObjectBiggestKey(object) {
    return Math.max(...Object.keys(object).map(Number));
}