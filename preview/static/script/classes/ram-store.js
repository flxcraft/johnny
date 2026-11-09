/**
 * Stores and validates the simulator's RAM values.
 */
class RamStore {
    static RAM_SIZE = 1000; // later dynamically changable, but for now it's fixed at 1000
    static MAX_RAM_VALUE = 19999; // later dynamically calculated, but for now it's fixed at 19999

    // Private field to store RAM values
    #ram;

    /**
     * Initializes the RamStore with optional RAM values.
     * If not provided, defaults to an array of zeros.
     * 
     * @param {number[]} [values=[]] - Array of RAM values.
     * @throws {Error} Throws an error if the provided values are invalid.
     */
    constructor(values = []) {
        if (!Array.isArray(values) || values.length > RamStore.RAM_SIZE) {
            throw new Error("Invalid RAM data. Expected an array with at most 1000 values."); // later dynamically generated message based on RAM_SIZE
        }

        this.#ram = new Array(RamStore.RAM_SIZE).fill(0);
        values.forEach((value, address) => this.#validateValue(value, address));
        this.#ram.splice(0, values.length, ...values);
    }

    /**
     * Returns the size of the RAM memory.
     * 
     * @returns {number} The size of the RAM memory (1000).
     */
    get RAM_SIZE() {
        return RamStore.RAM_SIZE;
    }

    /**
     * Returns the maximum value that can be stored in RAM.
     * 
     * @returns {number} The maximum RAM value (19999).
     */
    get MAX_RAM_VALUE() {
        return RamStore.MAX_RAM_VALUE;
    }

    /**
     * Returns the value at the specified RAM address after validating the address.
     *
     * @param {number} address - The address in RAM to retrieve the value from.
     * @returns {number} The RAM value at the specified address.
     * @throws {Error} Throws an error if the address is invalid.
     */
    get(address) {
        this.#validateAddress(address);
        return this.#ram[address];
    }

    /**
     * Sets a value at the specified RAM address after validating the address and value.
     *
     * @param {number} address - The address in RAM to set the value.
     * @param {number} value - The value to set at the specified RAM address.
     * @throws {Error} Throws an error if the address or value is invalid.
     */
    set(address, value) {
        this.#validateAddress(address);
        this.#validateValue(value, address);
        this.#ram[address] = value;
    }

    /**
     * Resets the RAM memory to its default values.
     */
    reset() {
        this.#ram.fill(0);
    }

    /**
     * Returns the last used RAM address (the highest address with a non-zero value).
     * If all addresses are zero, returns -1.
     * 
     * @returns {number} The last used RAM address or -1 if all are zero.
     */
    getLastUsedAddress() {
        for (let address = this.RAM_SIZE - 1; address >= 0; address--) {
            if (this.#ram[address] !== 0) return address;
        }
        return -1;
    }

    /**
     * Returns a copy of the RAM values as an array.
     *
     * @returns {number[]} A copy of the RAM values.
     */
    toArray() {
        return [...this.#ram];
    }

    /**
     * Returns a JSON representation of the RAM store, including only the used values.
     *
     * @returns {number[]} A JSON array containing the used RAM values.
     */
    toJSON() {
        let lastUsedAddress = this.getLastUsedAddress();
        return this.#ram.slice(0, lastUsedAddress + 1);
    }

    /**
     * Validates the provided RAM address.
     *
     * @param {number} address - The RAM address to validate.
     * @throws {Error} Throws an error if the address is invalid.
     */
    #validateAddress(address) {
        if (!Number.isInteger(address) || address < 0 || address >= this.RAM_SIZE) {
            throw new Error(`RAM address out of bounds: ${address}`);
        }
    }

    /**
     * Validates the provided RAM value.
     *
     * @param {number} value - The RAM value to validate.
     * @param {number|null} address - The address associated with the value (optional, for error messages).
     * @throws {Error} Throws an error if the value is invalid.
     */
    #validateValue(value, address = null) {
        if (!Number.isInteger(value) || value < 0 || value > this.MAX_RAM_VALUE) {
            const location = address === null ? "" : ` at address ${address}`;
            throw new Error(`Invalid RAM value${location}: ${value}`);
        }
    }
}
