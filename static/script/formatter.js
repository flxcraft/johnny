/**
 * Formats an address to a 3-digit string with leading zeros. (e.g., 5 -> "005")
 * 
 * @param {*} address 
 * @returns {string}
 */
function formatAddress(address) {
    return String(address).padStart(3, '0');
}

/**
 * Formats data to a string with a decimal point after the second digit. (e.g., 12345 -> "12.345")
 * 
 * @param {*} data 
 * @returns {string}
 */
function formatData(data) {
    const s = String(data).padStart(5, '0');
    return s.slice(0, 2) + '.' + s.slice(2);
}

/**
 * Gets the high part (first two digits) of the data.
 *
 * @param {number} data 
 * @returns {number}
 */
function getDataHigh(data) {
    return Math.trunc(data / RAM_SIZE);
}

/**
 * Gets the low part (last three digits) of the data.
 * 
 * @param {number} data
 * @returns {number}
 */
function getDataLow(data) {
    return data % RAM_SIZE;
}

/**
 * Formats the high part of the data to a 2-digit string with leading zeros.  (e.g., 5 -> "05")
 * 
 * @param {number} data
 * @returns {string}
 */
function formatDataHigh(data) {
    return String(getDataHigh(data)).padStart(2, '0');
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

    const instruction = instructionNames[opCode];
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
    return Math.max(...Object.keys(object).map(Number))
}