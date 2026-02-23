let addressBus = 0;
let dataBus = 0;
let accumulator = 0;
let programCounter = 0;
let instructionRegister = 0;
let microCodeCounter = 0;

let selectedRamAddress = 0; // yellow
let lastAccessedRamAddress = null; // green | null means no address

let settings; // instance of the Settings class to manage user settings
const RAM_SIZE = 1000;
const MICROCODE_SIZE = 200;
const RAM_MAX_VALUE = (MICROCODE_SIZE * 100) - 1; // 19999
let microCode = []; // 200 microcode entries; then names of macro instructions
let instructionNames = {}; // mapping of opcodes to their names, e.g., {1: "TAKE", 2: "ADD", ...}
let ram = []; // 1000 RAM entries

let isHlt = false; // indicates if the program has reached a HLT instruction
let isMacroRunning = false; // indicates if the macro program is currently running
let macroExecutionDelay = 500; // default delay between macro steps in ms
let initialized = false; // indicates if the simulator has been initialized

let isRecording = false; // indicates if a macro recording is in progress
let recordMicroCodeAddress = null; // the current microcode address being recorded to

let fixRamAfterShift = true; // flag to indicate if RAM needs to be fixed after a shift operation

function initialize() {
    // Initialize settings first to ensure they are available for other components
    settings = new Settings();

    // Update the control unit visibility based on the loaded settings
    updateControlUnitVisibility();

    // Load RAM and microcode from localStorage or initialize with defaults
    ram = JSON.parse(localStorage.getItem("johnny-ram")) || generateEmptyRam();
    importMicroCodeArray(JSON.parse(localStorage.getItem("johnny-microCode"))); // loads default if null

    // Generate the tables in the UI based on the loaded data
    generateRamTable();
    generateMicroCodeTable();

    // Load version information for the settings modal
    loadVersionInfo();

    initialized = true;
    console.info("Simulator initialized.");
}

/**
 * Show data movement animation for the given animation id.
 * 
 * @param {string} animation the id of the animation element
 * @returns {void}
 */
function showDataMovementAnimation(animation) {
    const animationElement = document.getElementById(animation);
    if (animationElement) {
        // Only trigger the animation if it's not already active
        if (!animationElement.classList.contains("active")) {
            // Trigger the animation by adding an "active" class
            animationElement.classList.add("active");
            setTimeout(() => {
                animationElement.classList.remove("active");
            }, 800); // show for 800ms
        }
    } else {
        console.warn("Animation element not found for:", animation);
    }
}

/**
 * Downloads the given data as a text file with the specified filename.
 * 
 * @param {string} filename the name of the file to be downloaded
 * @param {string[]} data the data to be included in the file
 * @returns {void}
 */
function downloadData(filename, data) {
    // Join data array into a single string with newlines
    const content = data.join('\n'); // TODO: maybe add a header line(s)

    // Create a blob with the data
    const blob = new Blob([content], { type: 'text/plain' });

    // Create a URL for the blob
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a); // TODO: maybe use setTimeout 0
    URL.revokeObjectURL(url);
}