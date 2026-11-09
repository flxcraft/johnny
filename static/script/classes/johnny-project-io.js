// Copyright (C) 2026 Felix Heidisch (flxcraft)
// This program is free software: you can redistribute it and/or modify it under
// the terms of the GNU Affero General Public License as published by the Free
// Software Foundation, either version 3 of the License, or (at your option) any
// later version. See LICENSE for the full license text.

/**
 * Provides static persistence and file-format operations for simulator stores.
 */
class JohnnyProjectIO {
    static STORAGE_KEY = "johnny:project";
    static RAM_SIZE = RamStore.RAM_SIZE; // move to RamStore.RAM_SIZE for dynamic size in the future
    static MAX_RAM_VALUE = RamStore.MAX_RAM_VALUE; // move to RamStore.MAX_RAM_VALUE for dynamic size in the future
    static MICROCODE_SIZE = MicroCodeStore.MICROCODE_SIZE; // move to MicroCodeStore.MICROCODE_SIZE for dynamic size in the future

    /**
     * Loads the complete project from localStorage.
     *
     * @returns {{ramStore: RamStore, microCodeStore: MicroCodeStore}}
     */
    static loadProjectFromLocalStorage() {
        try {
            const projectData = this.#readStoredProject();
            if (!projectData) {
                console.info("[JohnnyProjectIO.loadProjectFromLocalStorage] No project found in localStorage. Using defaults.");
                return this.#createDefaultStores();
            }

            return this.#storesFromProjectData(projectData);
        } catch (error) {
            console.error("[JohnnyProjectIO.loadProjectFromLocalStorage] Failed to load project:", error);
            return this.#createDefaultStores();
        }
    }

    /**
     * Saves the complete project to localStorage.
     *
     * @param {RamStore} ramStore
     * @param {MicroCodeStore} microCodeStore
     * @returns {boolean} whether the project was saved successfully
     */
    static saveProjectToLocalStorage(ramStore, microCodeStore) {
        try {
            this.#validateStores(ramStore, microCodeStore);
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.#toProjectData(ramStore, microCodeStore)));
            console.debug("[JohnnyProjectIO.saveProjectToLocalStorage] Project saved to localStorage.");
            return true;
        } catch (error) {
            console.error("[JohnnyProjectIO.saveProjectToLocalStorage] Failed to save project:", error);
            return false;
        }
    }

    /**
     * Loads only RAM from localStorage.
     *
     * @returns {RamStore}
     */
    static loadRamFromLocalStorage() {
        const projectData = this.#readStoredProject();
        return new RamStore(projectData?.ram);
    }

    /**
     * Saves only RAM while preserving the stored microcode.
     *
     * @param {RamStore} ramStore
     * @returns {boolean}
     */
    static saveRamToLocalStorage(ramStore) {
        try {
            if (!(ramStore instanceof RamStore)) throw new TypeError("Expected a RamStore.");
            const projectData = this.#readStoredProject() || this.#toProjectData(new RamStore(), new MicroCodeStore()); // Create default stores if no project data exists
            projectData.ram = ramStore.toJSON();
            return this.#writeProjectData(projectData);
        } catch (error) {
            console.error("[JohnnyProjectIO.saveRamToLocalStorage] Failed to save RAM:", error);
            return false;
        }
    }

    /**
     * Loads only microcode and instruction names from localStorage.
     *
     * @returns {MicroCodeStore}
     */
    static loadMicroCodeFromLocalStorage() {
        const projectData = this.#readStoredProject();
        return new MicroCodeStore(projectData?.microCode, projectData?.instructionNames);
    }

    /**
     * Saves only microcode while preserving the stored RAM.
     *
     * @param {MicroCodeStore} microCodeStore
     * @returns {boolean}
     */
    static saveMicroCodeToLocalStorage(microCodeStore) {
        try {
            if (!(microCodeStore instanceof MicroCodeStore)) throw new TypeError("Expected a MicroCodeStore.");
            const projectData = this.#readStoredProject() || this.#toProjectData(new RamStore(), new MicroCodeStore()); // Create default stores if no project data exists
            const microCodeData = microCodeStore.toJSON();
            projectData.microCode = microCodeData.microCode;
            projectData.instructionNames = microCodeData.instructionNames;
            return this.#writeProjectData(projectData);
        } catch (error) {
            console.error("[JohnnyProjectIO.saveMicroCodeToLocalStorage] Failed to save microcode:", error);
            return false;
        }
    }

    /**
     * Loads a complete project from a JSON string.
     *
     * @param {string} jsonString
     * @returns {{ramStore: RamStore, microCodeStore: MicroCodeStore}}
     */
    static parseProjectJSON(jsonString) {
        return this.#storesFromProjectData(JSON.parse(jsonString)); // TODO: validate the parsed object to ensure it has the required properties
    }

    /**
     * Exports a complete project to a JSON string.
     *
     * @param {RamStore} ramStore
     * @param {MicroCodeStore} microCodeStore
     * @returns {string}
     */
    static serializeProjectJSON(ramStore, microCodeStore) {
        this.#validateStores(ramStore, microCodeStore);
        return JSON.stringify(this.#toProjectData(ramStore, microCodeStore));
    }

    /**
     * Loads RAM from the legacy text format.
     *
     * @param {string} fileContent
     * @returns {RamStore}
     */
    static parseLegacyRam(fileContent) {
        const values = this.#parseLines(fileContent).map((line, index) => {
            const value = Number(line);
            if (!Number.isInteger(value) || value < 0 || value > RamStore.MAX_RAM_VALUE) {
                throw new Error(`Invalid RAM value at line ${index + 1}: "${line}".`);
            }
            return value;
        });
        return new RamStore(values);
    }

    /**
     * Exports RAM to the legacy text format.
     *
     * @param {RamStore} ramStore
     * @returns {string}
     */
    static serializeLegacyRam(ramStore) {
        if (!(ramStore instanceof RamStore)) throw new TypeError("Expected a RamStore.");
        return ramStore.toArray().join("\n");
    }

    /**
     * Loads microcode and instruction names from the legacy text format.
     *
     * @param {string} fileContent
     * @returns {MicroCodeStore}
     */
    static parseLegacyMicroCode(fileContent) {
        const lines = this.#parseLines(fileContent);
        if (lines.length < MicroCodeStore.MICROCODE_SIZE) { // TODO: also care for instruction names
            throw new Error(`Legacy microcode file has too few lines: expected at least ${MicroCodeStore.MICROCODE_SIZE}, received ${lines.length}.`);
        }

        const values = lines.slice(0, MicroCodeStore.MICROCODE_SIZE).map((line, index) => {
            const value = Number(line);
            if (!Number.isInteger(value) || value < 0 || value > MicroCodeStore.MAX_MICROCODE_VALUE || value === MicroCodeStore.UNUSED_MICROCODE_VALUE) {
                throw new Error(`Invalid microcode value at line ${index + 1}: "${line}".`);
            }
            return value;
        });

        const instructionNames = { ...MicroCodeStore.DEFAULT_INSTRUCTION_NAMES }; // TODO: what if not all are overwritten? Should we throw an error or just use defaults for missing ones?
        lines.slice(MicroCodeStore.MICROCODE_SIZE).forEach((name, index) => {
            instructionNames[index] = name;
        });
        return new MicroCodeStore(values, instructionNames);
    }

    /**
     * Exports microcode and instruction names to the legacy text format.
     *
     * @param {MicroCodeStore} microCodeStore
     * @returns {string}
     */
    static serializeLegacyMicroCode(microCodeStore) {
        if (!(microCodeStore instanceof MicroCodeStore)) throw new TypeError("Expected a MicroCodeStore.");
        const microCodeData = microCodeStore.toJSON();
        const values = microCodeStore.toArray();
        return [...values, ...Object.values(microCodeData.instructionNames)].join("\n");
    }

    /**
     * Creates default RAM and microcode stores.
     *
     * @returns {{ramStore: RamStore, microCodeStore: MicroCodeStore}}
     */
    static #createDefaultStores() {
        return {
            ramStore: new RamStore(), // Create a new RamStore with default values
            microCodeStore: new MicroCodeStore() // Create a new MicroCodeStore with default values
        };
    }

    /**
     * Creates RAM and microcode stores from given project data.
     *
     * @param {object} projectData - The project data containing RAM and microcode information.
     * @returns {{ramStore: RamStore, microCodeStore: MicroCodeStore}}
     */
    static #storesFromProjectData(projectData) { // TODO: check if projectData is valid and has the required properties
        // Validate that projectData is an object and not null
        if (!projectData || typeof projectData !== "object") {
            throw new Error("Invalid project data. Expected an object.");
        }

        // Create new RamStore and MicroCodeStore instances using the provided project data
        return {
            ramStore: new RamStore(projectData.ram),
            microCodeStore: new MicroCodeStore(projectData.microCode, projectData.instructionNames)
        };
    }

    /**
     * Converts RAM and microcode stores into a project data object.
     *
     * @param {RamStore} ramStore - The RAM store to convert.
     * @param {MicroCodeStore} microCodeStore - The microcode store to convert.
     * @returns {object} An object containing the RAM and microcode data.
     */
    static #toProjectData(ramStore, microCodeStore) {
        const microCodeData = microCodeStore.toJSON();
        return {
            ram: ramStore.toJSON(),
            microCode: microCodeData.microCode,
            instructionNames: microCodeData.instructionNames
        };
    }

    /**
     * Validates that the provided stores are instances of RamStore and MicroCodeStore.
     *
     * @param {RamStore} ramStore - The RAM store to validate.
     * @param {MicroCodeStore} microCodeStore - The microcode store to validate.
     * @throws {TypeError} Throws an error if either store is not of the expected type.
     */
    static #validateStores(ramStore, microCodeStore) {
        if (!(ramStore instanceof RamStore)) throw new TypeError("Expected a RamStore.");
        if (!(microCodeStore instanceof MicroCodeStore) || !microCodeStore) throw new TypeError("Expected a MicroCodeStore.");
    }

    /**
     * Reads the stored project data from localStorage.
     *
     * @returns {object|null} The parsed project data object or null if not found.
     */
    static #readStoredProject() {
        const storedProject = localStorage.getItem(this.STORAGE_KEY);
        return storedProject ? JSON.parse(storedProject) : null;
    }

    /**
     * Writes the project data to localStorage.
     *
     * @param {object} projectData - The project data to be stored.
     * @returns {boolean} True if the data was successfully written, false otherwise.
     */
    static #writeProjectData(projectData) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(projectData));
        return true;
    }

    /**
     * Parses the content of a legacy file format into an array of lines, ignoring comments and empty lines.
     *
     * @param {string} fileContent - The content of the file to parse.
     * @returns {string[]} An array of non-empty, non-comment lines.
     */
    static #parseLines(fileContent) {
        if (typeof fileContent !== "string") throw new TypeError("Expected file content as a string.");
        return fileContent.split(/\r?\n/)
            .map(line => line.split("#")[0].trim())
            .filter(line => line);
    }
}
