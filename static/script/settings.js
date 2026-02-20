class Settings {
    #values = {};
    static STORAGE_KEY = "johnny-settings";
    static SETTINGS_SCHEME = {
        showControlUnit: {
            type: "boolean",
            default: false,
            description: "Show the control unit in the UI"
        }
    }

    constructor() {
        this.#loadDefaultSettings(); // Initialize settings with default values
        this.#load(); // Attempt to load settings from localStorage; only if they are valid, otherwise keep defaults
    }

    /**
     * Loads default settings based on the SETTINGS_SCHEME, ensuring all settings are initialized to their default values.
     * 
     * @returns {void}
     * @private
     */
    #loadDefaultSettings() {
        for (const [settingKey, settingScheme] of Object.entries(Settings.SETTINGS_SCHEME)) {
            this.#values[settingKey] = settingScheme.default;
        }
    }

    /**
     * Loads settings from localStorage, with comprehensive error handling for various failure scenarios (e.g., unavailable storage, invalid JSON, missing or invalid settings).
     * If any issues are encountered during loading, the method will log appropriate messages and keep the default settings intact.
     * 
     * @returns {void}
     * @private
     */
    #load() {
        // Attempt to access localStorage, with error handling for environments where it is unavailable or access is denied
        let rawSettings;
        try {
            rawSettings = localStorage.getItem(Settings.STORAGE_KEY);
            if (!rawSettings) {
                console.info("No settings found in localStorage. Keeping default settings.");
                return; // No settings to load, keep defaults
            }
        } catch (error) {
            console.error("Failed to access localStorage. Keeping default settings.", error);
            return;
        }

        // Attempt to parse the JSON string from localStorage, with error handling for invalid JSON format
        let parsedSettings;
        try {
            parsedSettings = JSON.parse(rawSettings);
        } catch (error) {
            console.error("Failed to parse settings from localStorage. Keeping default settings.", error);
            return;
        }

        // Validate that the parsed settings is an object, with error handling for unexpected data types
        if (typeof parsedSettings !== "object" || parsedSettings === null) {
            console.error("Loaded settings from localStorage is not a valid object. Keeping default settings.");
            return;
        }

        // Validate each setting against the SETTINGS_SCHEME, with warnings for missing or invalid settings and fallback to default values
        for (const [settingKey, settingScheme] of Object.entries(Settings.SETTINGS_SCHEME)) {
            const loadedValue = parsedSettings[settingKey];

            if (loadedValue === undefined) continue; // Missing setting, keep default
            if (typeof loadedValue !== settingScheme.type) {
                console.warn(`Invalid type for setting "${settingKey}". Expected ${settingScheme.type} but got ${typeof loadedValue}. Keeping default value.`);
                continue; // Invalid type, keep default
            }

            this.#values[settingKey] = loadedValue; // Valid setting, apply loaded value
        }
    }

    /**
     * Saves the current settings to localStorage as a JSON string, with error handling for storage issues.
     * 
     * @returns {void}
     */
    #save() {
        const outputSettings = {};
        for (const settingKey of Object.keys(Settings.SETTINGS_SCHEME)) {
            outputSettings[settingKey] = this.#values[settingKey];
        }

        // Attempt to save the settings to localStorage, with error handling for storage issues or other exceptions
        try {
            localStorage.setItem(Settings.STORAGE_KEY, JSON.stringify(outputSettings));
        } catch (error) {
            console.error("Failed to save settings to localStorage.", error);
            alert("Failed to save settings. Please check console for details.");
        }
    }

    /**
     * Retrieves the value of a setting by its key.
     *
     * @param {string} key The key of the setting to retrieve.
     * @returns {*} The value of the setting, or undefined if the setting does not exist.
     * @throws {Error} If the setting key does not exist in the SETTINGS_SCHEME.
     */
    get(key) {
        if (!(key in Settings.SETTINGS_SCHEME)) {
            throw new Error(`Setting "${key}" does not exist`);
        }
        return this.#values[key];
    }

    /**
     * Updates the value of a setting by its key, with validation against the SETTINGS_SCHEME to ensure type correctness and existence of the setting.
     *
     * @param {string} key The key of the setting to update.
     * @param {*} value The new value for the setting, which must match the expected type defined in SETTINGS_SCHEME.
     * @throws {Error} If the setting key does not exist or if the value is undefined.
     * @throws {TypeError} If the value does not match the expected type defined in SETTINGS_SCHEME.
     */
    set(key, value) {
        if (!(key in Settings.SETTINGS_SCHEME)) {
            throw new Error(`Setting "${key}" does not exist`);
        }
        if (value === undefined) {
            throw new Error(`Setting "${key}" cannot be undefined`);
        }
        if (typeof value !== Settings.SETTINGS_SCHEME[key].type) {
            throw new TypeError(`Setting "${key}" must be of type ${Settings.SETTINGS_SCHEME[key].type}`);
        }

        this.#values[key] = value;
        this.#save(); // Save the updated settings to localStorage
    }
}