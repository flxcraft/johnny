/**
 * Loads version information into the settings modal.
 * 
 * @returns {void}
 */
function loadVersionInfo() {
    const versionTag = document.getElementById('version-tag');
    const versionFooter = document.getElementById('version-footer');

    try {
        // Validate that the required fields are loaded from the version.js data
        if (!window.BUILD_INFO || !window.BUILD_INFO.version || !window.BUILD_INFO.channel || !window.BUILD_INFO.buildTime) {
            throw new Error('Invalid BUILD_INFO format');
        }

        // If it's a preview build, show only the first 7 characters of the version hash (e.g., "abc1234"), otherwise show the full version (e.g., "1.0.0")
        const displayVersion = window.BUILD_INFO.channel === "preview" ? window.BUILD_INFO.version.substring(0, 7) : window.BUILD_INFO.version;

        // Display version and channel under the settings modal title, e.g., "1.0.0 (stable)" or "abc1234 (preview)"
        versionTag.innerHTML = `${displayVersion} <span>(${window.BUILD_INFO.channel})</span>`;

        // Display build time in the footer of the settings modal, formatted as a local date and time string, e.g., "Build: 6/30/2024, 10:15:30 AM"
        const date = new Date(window.BUILD_INFO.buildTime).toLocaleString();
        versionFooter.textContent = `Build: ${date} (© Felix Heidisch aka flxcraft)`;
    } catch (error) {
        // If there's an error (e.g., version.js not loaded), show a default message indicating it's a local development build
        versionTag.innerHTML = `dev-build <span>(local)</span>`;
        versionFooter.textContent = "Local development environment";
    }
}

/**
 * Populates the settings modal with UI elements for each setting defined in the settings scheme, allowing users to view and modify their settings directly from the modal interface.
 * 
 * @returns {void}
 */
function generateSettingsUI() {
    console.log("Generating settings UI...");
    const settingsContainer = document.getElementById('settings-container');
    settingsContainer.innerHTML = ''; // Clear existing content

    // Ensure that the settings object and its scheme are available before attempting to generate the UI
    if (!settings || !settings.getSettingsScheme()) return;

    // Iterate over the settings scheme and create UI elements for each setting that is marked to be shown in the modal
    for (const [settingKey, settingScheme] of Object.entries(settings.getSettingsScheme())) {
        // Skip settings that are not meant to be shown in the modal
        if (!settingScheme.showInModal) continue;

        // Get the current value of the setting to display in the UI
        const settingValue = settings.get(settingKey);

        // Create a new div element for the setting, with an input field (checkbox for boolean settings, `settingScheme.type` for others) and a label that includes the setting's description
        const settingElement = document.createElement('div');
        settingElement.innerHTML = `
            <input type="${settingScheme.type === "boolean" ? "checkbox" : settingScheme.type}" id="setting-${settingKey}" ${settingScheme.type === "boolean" ? (settingValue ? 'checked' : '') : `value="${settingValue}"`} onchange="updateSetting('${settingKey}', ${settingScheme.type === "boolean" ? 'this.checked' : 'this.value'})">
            <label for="setting-${settingKey}"><b>${settingKey}:</b> ${settingScheme.description}</label>
        `;
        settingsContainer.appendChild(settingElement);
    }
}

/**
 * Updates a specific setting based on user input from the settings modal, with validation to ensure that the input value matches the expected type defined in the settings scheme.
 * If the input value is invalid, an error message is logged and an alert is shown to the user.
 * 
 * @param {string} key The key of the setting to update.
 * @param {*} value The new value for the setting, which should be validated against the expected type defined in the settings scheme.
 * @return {void}
 */
function updateSetting(key, value) {
    try {
        // Get the setting scheme for the specified key to determine the expected type and validate the input value accordingly
        const settingScheme = settings.getSettingsSchemeByKey(key);

        // Validate the input value based on the expected type defined in the settings scheme
        if (settingScheme.type === "boolean") {
            if (typeof value !== "boolean") {
                throw new TypeError(`Invalid value for setting "${key}". Expected a boolean.`);
            }
        } else if (settingScheme.type === "number") {
            const parsedValue = parseFloat(value);
            if (isNaN(parsedValue)) {
                throw new TypeError(`Invalid value for setting "${key}". Expected a number.`);
            }
            value = parsedValue;
        } else {
            throw new TypeError(`Unsupported setting type "${settingScheme.type}" for setting "${key}".`);
        }

        settings.set(key, value);
    } catch (error) {
        console.error(`Failed to update setting "${key}".`, error);
        alert(`Failed to update setting "${key}". Please check console for details.`);
    }
}