/**
 * Downloads the given data as a text file with the specified filename.
 * 
 * @param {string} filename the name of the file to be downloaded
 * @param {string} content the content to be included in the downloaded file
 * @param {string} contentType the MIME type of the file content (default is 'text/plain')
 * @returns {void}
 */
function downloadData(filename, content, contentType = 'text/plain') {
    // Create a blob with the data
    const blob = new Blob([content], { type: contentType });

    // Create a temporary link element to trigger the download
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;

    // Click the link to trigger the download
    link.click();

    // Clean up the temporary URL object
    URL.revokeObjectURL(link.href);
}

/**
 * Uploads a file and reads its content, passing the content to the provided callback function.
 * 
 * @param {string} fileAccept the accepted file types for the upload (e.g., ".txt,.json")
 * @param {function} callback the function to be called with the file content once it's read ((content, filename) => void)
 * @returns {void}
 */
function uploadData(fileAccept, callback) {
    // Create a file input element to allow the user to select a file
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = fileAccept;
    fileInput.onchange = (event) => {
        // Get the selected file from the file input
        const file = event.target.files[0];
        if (!file) {
            console.warn("No file selected for upload.");
            return;
        }

        // Use FileReader to read the content of the selected file
        const reader = new FileReader();
        reader.onload = (e) => {
            callback(e.target.result, file.name);
        };

        // Handle errors that may occur during file reading
        reader.onerror = (e) => {
            console.error("Error reading file:", e);
            alert("An error occurred while reading the file. Please try again.");
        };
        reader.readAsText(file);
    };
    fileInput.click();
}