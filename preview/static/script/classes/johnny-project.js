class JohnnyProject {
    // Constant values
    RAM_SIZE = 1000;
    MICROCODE_SIZE = 200;
    MAX_RAM_VALUE = (this.MICROCODE_SIZE * 100) - 1; // 19999

    // Data structures for instruction and micro-instruction name mappings
    #instructionNames = {}; // mapping of opcodes to their names, e.g., {1: "TAKE", 2: "ADD", ...}

    // Actual data structures
    #ram = []; // 1000 RAM entries
    #microCode = []; // 200 microcode entries

    constructor() {
        this.#init();
        this.#loadProject(); // Load project from localStorage if it exists, otherwise stay with defaults
    }

    /**
     * Initialize the project with default values (e.g., empty RAM, default microcode, etc.)
     * 
     * @returns {void}
     */
    #init() {
        this.#initRam();
        this.#initMicroCode();
    }

    /**
     * Initialize RAM with default values (0 for all addresses).
     * Can be called to reset RAM to default state.
     * 
     * @returns {void}
     */
    #initRam() {
        this.#ram = new Array(this.RAM_SIZE).fill(0);
    }

    /**
     * Initialize microcode with default values (default microcode values).
     * Can be called to reset microcode to default state.
     * 
     * @returns {void}
     */
    #initMicroCode() {
        // The default microcode values are defined here. The other addresses that are not explicitly set will be initialized to 0 by default.
        let newMicroCode = [8, 2, 3, 5, 0, 0, 0, 0, 0, 0, 4, 2, 18, 9, 7, 0, 0, 0, 0, 0, 4, 2, 13, 9, 7, 0, 0, 0, 0, 0, 4, 2, 14, 9, 7, 0, 0, 0, 0, 0,
            4, 15, 1, 9, 7, 0, 0, 0, 0, 0, 11, 7, 0, 0, 0, 0, 0, 0, 0, 0, 4, 2, 18, 10, 9, 7, 0, 0, 0, 0, 4, 2, 18, 16, 15, 1, 9, 7, 0, 0, 4, 2, 18,
            17, 15, 1, 9, 7, 0, 0, 4, 12, 15, 1, 9, 7, 0, 0, 0, 0, 19, 0, 0, 0, 0, 0, 0, 0, 0, 0];

        // If the default microcode array is shorter than MICROCODE_SIZE, we need to pad it with zeros to ensure it has the correct size
        while (newMicroCode.length < this.MICROCODE_SIZE) {
            newMicroCode.push(0);
        }

        this.#microCode = newMicroCode; // Set the microcode to the default values
        this.#initInstructionNames(); // Initialize the instruction name mappings for the default macro instructions (opcodes 0-10)
    }

    /**
     * Initialize the instruction name mappings with default values.
     * Is called by the initMicroCode() method to set up the default instruction names for opcodes 0-10, which are the default macro instructions.
     * 
     * @returns {void}
     */
    #initInstructionNames() {
        this.#instructionNames = {
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
        };
    }

    /**
     * Get the value at a specific RAM address.
     * 
     * @param {number} address the RAM address to read from
     * @returns {number} the value at the specified RAM address
     * @throws {Error} if the address is out of bounds
     */
    getRam(address) {
        // Validate address range
        if (address < 0 || address >= this.RAM_SIZE) {
            throw new Error(`RAM address out of bounds: ${address}`);
        }

        // Return the value at the specified RAM address
        return this.#ram[address];
    }

    /**
     * Set the value at a specific RAM address.
     * 
     * @param {number} address the RAM address to update
     * @param {number} value the new value to set at the specified RAM address
     * @param {boolean} save whether to save the updated project state to localStorage after setting the RAM value (default: true)
     * @returns {void}
     * @throws {Error} if the address is out of bounds or if the value is out of bounds
     */
    setRam(address, value, save = true) {
        // Validate address range
        if (address < 0 || address >= this.RAM_SIZE) {
            throw new Error(`RAM address out of bounds: ${address}`);
        }

        // Validate value type (to ensure it's a number)
        if (typeof value !== "number") {
            throw new Error(`RAM value must be a number: ${value}`);
        }

        // Validate value range (to ensure values are within 0 and MAX_RAM_VALUE)
        if (value < 0 || value > this.MAX_RAM_VALUE) {
            throw new Error(`RAM value out of bounds: ${value}`);
        }

        // Update the value at the specified RAM address
        this.#ram[address] = value;

        // Save the updated project state to localStorage after changing RAM
        if (save) this.#saveProject();
    }

    /**
     * Reset RAM to default state (all 0s). This can be called to clear the RAM and start fresh.
     * After resetting RAM, it also saves the updated project state to localStorage to ensure the reset is persisted.
     * 
     * @return {void}
     */
    resetRam() {
        this.#initRam();
        this.#saveProject(); // Save the reset RAM state to localStorage
    }

    /**
     * Get the microcode value at a specific microcode address.
     * 
     * @param {number} address the microcode address to read from
     * @returns {number} the value at the specified microcode address
     * @throws {Error} if the address is out of bounds
     */
    getMicroCode(address) {
        // Validate address range
        if (address < 0 || address >= this.MICROCODE_SIZE) {
            throw new Error(`Microcode address out of bounds: ${address}`);
        }

        // Return the value at the specified microcode address
        return this.#microCode[address];
    }

    /**
     * Set the value at a specific microcode address.
     * 
     * @param {number} address the microcode address to update
     * @param {number} value the new value to set at the specified microcode address
     * @param {boolean} save whether to save the updated project state to localStorage after setting the microcode value (default: true)
     * @returns {void}
     * @throws {Error} if the address is out of bounds or if the value is out of bounds
     */
    setMicroCode(address, value, save = true) {
        // Validate address range
        if (address < 0 || address >= this.MICROCODE_SIZE) {
            throw new Error(`Microcode address out of bounds: ${address}`);
        }

        // Validate value type (to ensure it's a number)
        if (typeof value !== "number") {
            throw new Error(`Microcode value must be a number: ${value}`);
        }

        // Validate value range (to ensure microcode values are within 0 and 19, and not equal to 6 which is not used)
        if (value < 0 || value > 19 || value === 6) {
            throw new Error(`Microcode value out of bounds: ${value}`);
        }

        // Update the value at the specified microcode address
        this.#microCode[address] = value;

        // Save the updated project state to localStorage after changing microcode
        if (save) this.#saveProject();
    }

    /**
     * Reset microcode to default state. This can be called to clear the microcode and start fresh with the default microcode values.
     * After resetting microcode, it also saves the updated project state to localStorage to ensure the reset is persisted.
     * 
     * @return {void}
     */
    resetMicroCode() {
        this.#initMicroCode();
        this.#saveProject(); // Save the reset microcode state to localStorage
    }

    /**
     * Get the last used RAM address (the highest address that has a non-zero value).
     * Returns -1 if all RAM addresses contain 0.
     * 
     * @returns {number} the last used RAM address, or -1 if RAM is empty
     */
    getLastUsedRamAddress() {
        for (let i = this.RAM_SIZE - 1; i >= 0; i--) {
            if (this.#ram[i] !== 0) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Get the entire mapping of opcodes to instruction names. This can be used to populate the instruction select dropdown in the UI or for other purposes where the full mapping is needed.
     * 
     * @returns {object} the mapping of opcodes to instruction names, e.g., {1: "TAKE", 2: "ADD", ...}
     */
    getInstructionNames() {
        return this.#instructionNames;
    }

    /**
     * Get the name of a macro instruction based on its opcode.
     * 
     * @param {number} opCode the opcode of the macro instruction
     * @returns {string|null} the name of the macro instruction, or null if the opcode does not have a corresponding instruction name
     */
    getInstructionName(opCode) {
        return this.#instructionNames[opCode] || null;
    }

    /**
     * Set the name of a macro instruction for a specific opcode. This is used for recording own macro instructions.
     * After setting the instruction name, it also saves the updated project state to localStorage to ensure the change is persisted.
     * 
     * @param {number} opCode the opcode of the macro instruction to set the name for
     * @param {string} name the name to assign to the macro instruction for the specified opcode
     * @return {void}
     * @throws {Error} if the opcode is out of bounds or if the name is invalid (e.g., empty string, too long, etc.)
     */
    setInstructionName(opCode, name) {
        // Validate opcode type and range
        if (typeof opCode !== "number" || opCode < 0 || opCode >= this.MICROCODE_SIZE / 10) {
            throw new Error(`Opcode out of bounds: ${opCode}`);
        }

        // Validate name type
        if (typeof name !== "string" || name.trim() === "" || name.length > 5) {
            throw new Error(`Invalid instruction name: "${name}". Name must be a non-empty string with a maximum length of 5 characters.`);
        }

        this.#instructionNames[opCode] = name;
        this.#saveProject(); // Save the updated instruction names to localStorage
    }

    /**
     * Remove trailing zeros from an array.
     * 
     * @param {number[]} array the array to trim
     * @returns {number[]} the array with trailing zeros removed
     */
    #trimTrailingZeros(array) {
        let lastNonZeroIndex = -1;
        for (let i = array.length - 1; i >= 0; i--) {
            if (array[i] !== 0) {
                lastNonZeroIndex = i;
                break;
            }
        }
        return array.slice(0, lastNonZeroIndex + 1);
    }

    /**
     * Convert the current project state to a JSON object for saving or exporting. Includes RAM, microcode, and instruction name mappings.
     * Trailing zeros in RAM and microcode arrays are omitted to reduce file size.
     * 
     * @returns {object} a JSON representation of the current project state
     */
    #toJSON() {
        return {
            // RAM_SIZE: this.RAM_SIZE,
            // MICROCODE_SIZE: this.MICROCODE_SIZE,
            ram: this.#trimTrailingZeros(this.#ram),
            microCode: this.#trimTrailingZeros(this.#microCode),
            instructionNames: this.#instructionNames,
        };
    }

    /**
     * Load the project state from a JSON object. This can be used for loading from localStorage or importing from a file.
     * It updates the RAM, microcode, and instruction name mappings based on the provided JSON data. These values are required and must be valid otherwise an error is thrown.
     * For RAM and microcode, if the provided arrays are shorter than RAM_SIZE or MICROCODE_SIZE, they will be padded with zeros to ensure they have the correct size. If they are longer, an error is thrown.
     * 
     * @param {object} json the JSON object containing the project state to load
     * @returns {void}
     * @throws {Error} if the JSON data is invalid or if any of the values are out of bounds
     */
    #fromJSON(json) {
        // // Validate and set RAM_SIZE
        // if (json.RAM_SIZE && typeof json.RAM_SIZE === "number" && json.RAM_SIZE > 0) {
        //     this.RAM_SIZE = json.RAM_SIZE;
        // }

        // // Validate and set MICROCODE_SIZE
        // if (json.MICROCODE_SIZE && typeof json.MICROCODE_SIZE === "number" && json.MICROCODE_SIZE > 0) {
        //     this.MICROCODE_SIZE = json.MICROCODE_SIZE;
        // }

        // Validate and set RAM
        if (json.ram && Array.isArray(json.ram)) {
            // Pad with zeros if the array is shorter than RAM_SIZE
            const paddedRam = [...json.ram];
            while (paddedRam.length < this.RAM_SIZE) {
                paddedRam.push(0);
            }
            
            if (paddedRam.length === this.RAM_SIZE && paddedRam.every(val => typeof val === "number" && val >= 0 && val <= this.MAX_RAM_VALUE)) {
                this.#ram = paddedRam;
            } else {
                throw new Error("Invalid RAM values in imported data.");
            }
        } else {
            throw new Error("Invalid RAM data in imported JSON. Expected an array.");
        }

        // Validate and set microcode
        if (json.microCode && Array.isArray(json.microCode)) {
            // Pad with zeros if the array is shorter than MICROCODE_SIZE
            const paddedMicroCode = [...json.microCode];
            while (paddedMicroCode.length < this.MICROCODE_SIZE) {
                paddedMicroCode.push(0);
            }
            
            if (paddedMicroCode.length === this.MICROCODE_SIZE && paddedMicroCode.every(val => typeof val === "number" && val >= 0 && val <= 19 && val !== 6)) {
                this.#microCode = paddedMicroCode;
            } else {
                throw new Error("Invalid microcode values in imported data.");
            }
        } else {
            throw new Error("Invalid microcode data in imported JSON. Expected an array.");
        }

        // Validate and set instruction names
        if (json.instructionNames && typeof json.instructionNames === "object") {
            this.#instructionNames = json.instructionNames;
        } else {
            throw new Error("Invalid instruction names in imported JSON.");
        }
    }

    /**
     * Save the current project state to localStorage. This includes RAM, microcode, and instruction name mappings.
     * The project state is saved under the key "johnnyProject" as a JSON string.
     * 
     * @returns {void}
     */
    #saveProject() {
        try {
            const projectData = this.#toJSON();
            localStorage.setItem("johnnyProject", JSON.stringify(projectData));
            console.debug("Project saved to localStorage.");
        } catch (error) {
            console.error("Failed to save project to localStorage:", error);
        }
    }

    /**
     * Load the project state from localStorage. This includes RAM, microcode, and instruction name mappings.
     * The project state is loaded from the key "johnnyProject" which is expected to be a JSON string.
     * If a project is found in localStorage, it updates the current project state with the loaded data.
     * If no project is found, it logs a warning message. If there is an error during parsing, it logs an error message.
     * 
     * @returns {void}
     */
    #loadProject() {
        try {
            const projectData = JSON.parse(localStorage.getItem("johnnyProject"));
            if (projectData) {
                this.#fromJSON(projectData);
                console.debug("Project loaded from localStorage.");
            } else {
                console.warn("No project found in localStorage to load.");
            }
        } catch (error) {
            console.error("Failed to load project from localStorage:", error);
        }
    }

    /**
     * Import the complete project state (RAM, microcode, and instruction name mappings) from a JSON string. This can be used for importing from a file or user input.
     * The JSON string is expected to contain the same structure as the one produced by the #toJSON() method, which includes RAM, microcode, instruction names, and optionally RAM_SIZE and MICROCODE_SIZE.
     * If the JSON string is valid and contains the required data, it updates the current project state with the imported data. If there is an error during parsing or if the data is invalid, it logs an error message.
     * 
     * @param {string} jsonString the JSON string containing the project state to import
     * @returns {void}
     */
    import(jsonString) {
        try {
            const projectData = JSON.parse(jsonString);
            this.#fromJSON(projectData);
            console.debug("Project imported from JSON string.");

            // After importing, we should save the imported project to localStorage
            this.#saveProject();
        } catch (error) {
            console.error("Failed to import project from JSON string:", error);
        }
    }

    /**
     * Export the complete project state (RAM, microcode, and instruction name mappings) as a JSON string. This can be used for saving to a file or copying to clipboard.
     * The exported JSON string contains the same structure as the one produced by the #toJSON() method, which includes RAM, microcode, instruction names, and optionally RAM_SIZE and MICROCODE_SIZE.
     * If there is an error during the conversion to JSON, it logs an error message and returns null.
     * 
     * @returns {string|null} the JSON string representing the current project state, or null if there was an error during conversion
     */
    export() {
        try {
            const projectData = this.#toJSON();
            return JSON.stringify(projectData);
        } catch (error) {
            console.error("Failed to export project to JSON string:", error);
            return null;
        }
    }

    /**
     * Import RAM contents from a string in the legacy format. The legacy format is expected to have one RAM value per line, with optional comments starting with #.
     * This method parses the input string, extracts the RAM values, and updates the RAM state of the project accordingly. It also validates the RAM values to ensure they are within the allowed range.
     * After importing the RAM data, it saves the updated project state to localStorage to ensure the changes are persisted.
     * 
     * @param {string} fileContent the string containing the RAM data in legacy format
     * @returns {void}
     */
    importLegacyRam(fileContent) {
        try {
            const lines = fileContent.split(/\r?\n/)
                .map(line => line.split('#')[0].trim()) // Remove in-line comments and trim whitespace
                .filter(line => line); // Remove empty lines

            if (lines.length > this.RAM_SIZE) {
                console.warn(`Too many lines in legacy RAM import: expected at most ${this.RAM_SIZE}, got ${lines.length}.`);
            }

            this.#initRam(); // Clear existing RAM before importing new data

            // Import RAM values line by line, up to the RAM_SIZE limit
            for (let i = 0; i < lines.length && i < this.RAM_SIZE; i++) {
                const line = lines[i];
                const value = Number(line);
                if (!Number.isInteger(value) || value < 0 || value > this.MAX_RAM_VALUE) {
                    console.warn(`Invalid legacy RAM value at line ${i + 1}: "${line}" → 0`);
                    this.setRam(i, 0, false);
                } else {
                    this.setRam(i, value, false);
                }
            }

            this.#saveProject(); // Save the imported RAM data to localStorage
            console.debug("Legacy RAM imported from string.");
        } catch (error) {
            console.error("Failed to import legacy RAM from string:", error);
        }
    }

    /**
     * Export RAM contents as a string in the legacy format. The legacy format has one RAM value per line, with optional comments starting with #.
     * This method converts the current RAM state of the project into a string format that can be saved to a file or copied to clipboard.
     * 
     * @returns {string} the string representing the RAM contents in legacy format
     */
    exportLegacyRam() {
        return this.#ram.join("\n");
    }

    /**
     * Import microcode contents from a string in the legacy format. The legacy format is expected to have one microcode value per line, with optional comments starting with #.
     * This method parses the input string, extracts the microcode values, and updates the microcode state of the project accordingly. It also validates the microcode values to ensure they are within the allowed range.
     * After importing the microcode data, it saves the updated project state to localStorage to ensure the changes are persisted.
     * 
     * @param {string} fileContent the string containing the microcode data in legacy format
     * @returns {void}
     */
    importLegacyMicroCode(fileContent) {
        try {
            const lines = fileContent.split(/\r?\n/)
                .map(line => line.split('#')[0].trim()) // Remove in-line comments and trim whitespace
                .filter(line => line); // Remove empty lines

            if (lines.length < this.MICROCODE_SIZE) {
                console.error(`Invalid legacy microcode file: expected at least ${this.MICROCODE_SIZE} lines, but got ${lines.length}.`);
                return;
            }

            this.#initMicroCode(); // Clear existing microcode before importing new data

            // Import microcode values
            for (let i = 0; i < this.MICROCODE_SIZE; i++) {
                const line = lines[i];
                const value = Number(line);

                if (!Number.isInteger(value) || value < 0 || value > 19 || value === 6) {
                    console.warn(`Invalid microcode value at line ${i + 1}: "${line}" → 0`);
                    this.setMicroCode(i, 0, false);
                } else {
                    this.setMicroCode(i, value, false);
                }
            }

            // Import instruction names (macro instructions)
            for (let i = this.MICROCODE_SIZE; i < lines.length; i++) {
                if (lines[i]) {
                    this.#instructionNames[i - this.MICROCODE_SIZE] = lines[i];
                }
            }

            this.#saveProject(); // Save the imported microcode data to localStorage
            console.debug("Legacy microcode imported from string.");
        } catch (error) {
            console.error("Failed to import legacy microcode from string:", error);
        }
    }

    /**
     * Export microcode contents as a string in the legacy format. The legacy format has one microcode value per line, with optional comments starting with #.
     * This method converts the current microcode state of the project into a string format that can be saved to a file or copied to clipboard.
     * 
     * @returns {string} the string representing the microcode contents in legacy format
     */
    exportLegacyMicroCode() {
        const microCodeData = [...this.#microCode, ...Object.values(this.#instructionNames)].join('\n');
        return microCodeData;
    }
}