/**
 * Imports microcode from a given string, where microcode entries and instruction names are separated by semicolons.
 * 
 * @param {string|undefined} microCodeArray the string containing microcode entries and instruction names
 * @returns {void}
 */
function importMicroCodeArray(microCodeArray) {
    if (!microCodeArray) microCodeArray = ["8", "2", "3", "5", "0", "0", "0", "0", "0", "0", "4", "2", "18", "9", "7", "0", "0", "0", "0", "0",
        "4", "2", "13", "9", "7", "0", "0", "0", "0", "0", "4", "2", "14", "9", "7", "0", "0", "0", "0", "0", "4", "15", "1", "9", "7", "0", "0",
        "0", "0", "0", "11", "7", "0", "0", "0", "0", "0", "0", "0", "0", "4", "2", "18", "10", "9", "7", "0", "0", "0", "0", "4", "2", "18", "16",
        "15", "1", "9", "7", "0", "0", "4", "2", "18", "17", "15", "1", "9", "7", "0", "0", "4", "12", "15", "1", "9", "7", "0", "0", "0", "0", "19",
        "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0",
        "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0",
        "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0",
        "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "FETCH", "TAKE", "ADD", "SUB", "SAVE", "JMP", "TST", "INC", "DEC", "NULL", "HLT"];

    // Import microcode entries
    microCode = [];
    for (let i = 0; i < MICROCODE_SIZE; i++) {
        microCode[i] = Number(microCodeArray[i]) || 0; // Fill missing entries with 0
    }

    // Import instruction names (macro instructions)
    instructionNames = {};
    for (let i = MICROCODE_SIZE; i < microCodeArray.length; i++) {
        if (microCodeArray[i]) {
            instructionNames[i - MICROCODE_SIZE] = microCodeArray[i];
        }
    }

    saveMicroCodeToLocalStorage(); // Save the imported microcode to localStorage
    if (initialized) {
        updateMicroCodeTable();
        populateInstructionSelect();
        updateMicroCodeTableMacroInstructionNames();
        console.info("Microcode imported from string.", microCode, instructionNames);
    } else {
        console.info("Microcode imported from string during initialization.", microCode, instructionNames);
    }
}

/**
 * Saves the current microcode state to localStorage.
 * 
 * @returns {void}
 */
function saveMicroCodeToLocalStorage() {
    const microCodeData = [...microCode, ...Object.values(instructionNames)];
    localStorage.setItem("johnny-microcode", JSON.stringify(microCodeData));
    console.debug("Microcode saved to localStorage.");
}

/**
 * Converts a microcode number to its corresponding textual description.
 * 
 * @param {number} microcode 
 * @returns {string}
 */
function microCodeToText(microcode) {
    return MICROCODE_TEXT[microcode] || "";
}

/**
 * Mapping of microcode numbers to their corresponding textual descriptions.
 * Using the same microcode numbers as in Laubersheini's original version for compatibility.
 * 
 * @type {Object<number, string>}
 */
const MICROCODE_TEXT = {
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
};