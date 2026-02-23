/**
 * Generates an empty RAM array of predefined size.
 * 
 * @returns {number[]}
 */
function generateEmptyRam() {
    return new Array(RAM_SIZE).fill(0);
}

/**
 * Saves the current RAM state to localStorage.
 * 
 * @returns {void}
 */
function saveRamToLocalStorage() {
    localStorage.setItem("johnny-ram", JSON.stringify(ram));
    console.debug("RAM saved to localStorage.");
}

/**
 * Finds the last used RAM address (the highest address that contains a non-zero value).
 * If all addresses are zero, it returns -1.
 * 
 * @returns {number}
 */
function getLastUsedRamAddress() {
    let lastUsedAddress = ram.length - 1;
    while (lastUsedAddress >= 0 && ram[lastUsedAddress] === 0) {
        lastUsedAddress--;
    }

    return lastUsedAddress;
}