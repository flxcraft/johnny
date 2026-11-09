/**
 * Stores and validates the simulator's microcode and macro instruction names.
 */
class MicroCodeStore {
    static MICROCODE_SIZE = 200; // later dynamically changable, but for now it's fixed at 200
    static MAX_MICROCODE_VALUE = 19; // the maximum value for a microcode instruction id
    static UNUSED_MICROCODE_VALUE = 6;

    // Default microcode values for the simulator, representing the initial state of the microcode memory
    static DEFAULT_MICROCODE = [
        8, 2, 3, 5, 0, 0, 0, 0, 0, 0, 4, 2, 18, 9, 7, 0, 0, 0, 0, 0,
        4, 2, 13, 9, 7, 0, 0, 0, 0, 0, 4, 2, 14, 9, 7, 0, 0, 0, 0, 0,
        4, 15, 1, 9, 7, 0, 0, 0, 0, 0, 11, 7, 0, 0, 0, 0, 0, 0, 0, 0,
        4, 2, 18, 10, 9, 7, 0, 0, 0, 0, 4, 2, 18, 16, 15, 1, 9, 7, 0, 0,
        4, 2, 18, 17, 15, 1, 9, 7, 0, 0, 4, 12, 15, 1, 9, 7, 0, 0, 0, 0,
        19
    ];

    // Default names for macro instructions, indexed by opcode (0-10)
    static DEFAULT_INSTRUCTION_NAMES = Object.freeze({
        0: "FETCH",
        1: "TAKE",
        2: "ADD",
        3: "SUB",
        4: "SAVE",
        5: "JMP",
        6: "TST",
        7: "INC",
        8: "DEC",
        9: "NULL",
        10: "HLT"
    });

    // Private fields to store microcode and instruction names
    #microCode;
    #instructionNames;

    /**
     * Initializes the MicroCodeStore with optional microcode values and instruction names.
     * If not provided, defaults are used.
     * 
     * @param {number[]} [values=MicroCodeStore.DEFAULT_MICROCODE] - Array of microcode values.
     * @param {Object} [instructionNames=MicroCodeStore.DEFAULT_INSTRUCTION_NAMES] - Object mapping opcodes to instruction names.
     */
    constructor(values = MicroCodeStore.DEFAULT_MICROCODE, instructionNames = MicroCodeStore.DEFAULT_INSTRUCTION_NAMES) {
        // Validate the provided values and instruction names
        if (!Array.isArray(values) || values.length > MicroCodeStore.MICROCODE_SIZE) {
            throw new Error("Invalid microcode data. Expected an array with at most 200 values.");
        }
        if (!instructionNames || typeof instructionNames !== "object" || Array.isArray(instructionNames)) {
            throw new Error("Invalid instruction names. Expected an object.");
        }

        // Initialize the microcode array with default values and validate each provided value
        this.#microCode = new Array(MicroCodeStore.MICROCODE_SIZE).fill(0);
        values.forEach((value, address) => this.#validateValue(value, address));
        this.#microCode.splice(0, values.length, ...values);
        this.#instructionNames = { ...instructionNames };
    }

    /**
     * Returns the size of the microcode memory.
     * 
     * @returns {number} The size of the microcode memory (200).
     */
    get MICROCODE_SIZE() {
        return MicroCodeStore.MICROCODE_SIZE;
    }

    /**
     * Returns the value for the given address in the microcode memory after validating the address.
     *
     * @param {number} address - The address in the microcode memory to retrieve the value from.
     * @returns {number} The microcode value at the specified address.
     * @throws {Error} Throws an error if the address is invalid.
     */
    get(address) {
        this.#validateAddress(address);
        return this.#microCode[address];
    }

    /**
     * Sets a microcode value at the specified address after validating the address and value.
     *
     * @param {number} address - The address in the microcode memory to set the value.
     * @param {number} value - The microcode value to set at the specified address.
     * @throws {Error} Throws an error if the address or value is invalid.
     */
    set(address, value) {
        this.#validateAddress(address);
        this.#validateValue(value, address);
        this.#microCode[address] = value;
    }

    /**
     * Resets the microcode memory to its default values and restores the default instruction names.
     */
    reset() {
        this.#microCode.fill(0);
        this.#microCode.splice(0, MicroCodeStore.DEFAULT_MICROCODE.length, ...MicroCodeStore.DEFAULT_MICROCODE);
        this.#instructionNames = { ...MicroCodeStore.DEFAULT_INSTRUCTION_NAMES };
    }

    /**
     * Returns the name of the instruction associated with the given opcode.
     *
     * @param {number} opCode - The opcode of the instruction to retrieve the name for.
     * @returns {string|null} The name of the instruction, or null if not found.
     */
    getInstructionName(opCode) {
        return this.#instructionNames[opCode] || null;
    }

    /**
     * Returns a copy of the instruction names mapping.
     *
     * @returns {Object} A copy of the instruction names mapping.
     */
    getInstructionNames() {
        return { ...this.#instructionNames };
    }

    /**
     * Sets the name of the instruction associated with the given opcode after validating the opcode and name.
     *
     * @param {number} opCode - The opcode of the instruction to set the name for.
     * @param {string} name - The name of the instruction to set.
     * @throws {Error} Throws an error if the opcode or name is invalid.
     */
    setInstructionName(opCode, name) {
        if (!Number.isInteger(opCode) || opCode < 0 || opCode >= this.MICROCODE_SIZE / 10) { // TODO: Consider making the maximum opcode value dynamic based on MICROCODE_SIZE
            throw new Error(`Opcode out of bounds: ${opCode}`);
        }
        if (typeof name !== "string" || name.trim() === "" || name.length > 5) {
            throw new Error(`Invalid instruction name: "${name}".`);
        }
        this.#instructionNames[opCode] = name;
    }

    /**
     * Returns a copy of the microcode values as an array.
     *
     * @returns {number[]} A copy of the microcode values.
     */
    toArray() {
        return [...this.#microCode];
    }

    /**
     * Returns a JSON representation of the microcode store, including the microcode values and instruction names.
     *
     * @returns {Object} A JSON object containing the microcode values and instruction names.
     */
    toJSON() {
        let lastUsedAddress = this.#microCode.length - 1;
        while (lastUsedAddress >= 0 && this.#microCode[lastUsedAddress] === 0) {
            lastUsedAddress--;
        }

        return {
            microCode: this.#microCode.slice(0, lastUsedAddress + 1),
            instructionNames: this.getInstructionNames()
        };
    }

    /**
     * Validates a microcode address to ensure it is an integer within the allowed range.
     *
     * @param {number} address - The microcode address to validate.
     * @throws {Error} Throws an error if the address is invalid.
     */
    #validateAddress(address) {
        if (!Number.isInteger(address) || address < 0 || address >= this.MICROCODE_SIZE) {
            throw new Error(`Microcode address out of bounds: ${address}`);
        }
    }

    /**
     * Validates a microcode value to ensure it is an integer within the allowed range.
     *
     * @param {number} value - The microcode value to validate.
     * @param {number|null} address - The address associated with the value (optional, for error messages).
     * @throws {Error} Throws an error if the value is invalid.
     */
    #validateValue(value, address = null) {
        if (!Number.isInteger(value) || value < 0 || value > MicroCodeStore.MAX_MICROCODE_VALUE || value === MicroCodeStore.UNUSED_MICROCODE_VALUE) {
            const location = address === null ? "" : ` at address ${address}`;
            throw new Error(`Invalid microcode value${location}: ${value}`);
        }
    }
}
