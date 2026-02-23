async function loadVersionInfo() {
    const versionTag = document.getElementById('version-tag');
    const versionFooter = document.getElementById('version-footer');

    try {
        const response = await fetch('version.json');
        if (!response.ok) throw new Error('Not found');
        const data = await response.json();

        // Validate that the required fields are present in the version.json data
        if (!data.version || !data.channel || !data.build_time) {
            throw new Error('Invalid version.json format');
        }

        // If it's a preview build, show only the first 7 characters of the version hash (e.g., "abc1234"), otherwise show the full version (e.g., "1.0.0")
        const displayVersion = data.channel == "preview" ? data.version.substring(0, 7) : data.version;

        // Display version and channel under the settings modal title, e.g., "1.0.0 (stable)" or "abc1234 (preview)"
        versionTag.innerHTML = `${displayVersion} <span>(${data.channel})</span>`;

        // Display build time in the footer of the settings modal, formatted as a local date and time string, e.g., "Build: 6/30/2024, 10:15:30 AM"
        if (versionFooter) {
            const date = new Date(data.build_time).toLocaleString();
            versionFooter.textContent = `Build: ${date}`;
        }
    } catch (error) {
        // If there's an error (e.g., version.json not found), show a default message indicating it's a local development build
        versionTag.innerHTML = `dev-build <span>(local)</span>`;
        if (versionFooter) versionFooter.textContent = "Local development environment";
    }
}