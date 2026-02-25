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