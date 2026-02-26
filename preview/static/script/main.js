let addressBus = 0;
let dataBus = 0;
let accumulator = 0;
let programCounter = 0;
let instructionRegister = 0;
let microCodeCounter = 0;

let selectedRamAddress = 0; // yellow
let lastAccessedRamAddress = null; // green | null means no address

let settings; // instance of the Settings class to manage user settings
let project; // instance of the JohnnyProject class to manage project state (RAM + microcode)
let initialized = false; // indicates if the simulator has been initialized

let isHlt = false; // indicates if the program has reached a HLT instruction
let isMacroRunning = false; // indicates if the macro program is currently running
let macroExecutionDelay = 500; // default delay between macro steps in ms

let isRecording = false; // indicates if a macro recording is in progress
let recordMicroCodeAddress = null; // the current microcode address being recorded to

function initialize() {
    // Initialize settings first to ensure they are available for other components
    settings = new Settings();
    generateSettingsUI(); // Populate the settings UI based on the loaded settings
    updateControlUnitVisibility(); // Update the control unit visibility based on the loaded settings

    // Initialize the project, which will load RAM and microcode from localStorage or set defaults
    project = new JohnnyProject();

    // Generate the tables in the UI based on the loaded data
    generateRamTable();
    generateMicroCodeTable();

    // Load version information for the settings modal
    loadVersionInfo();

    // Reset the simulator to ensure all displays are updated with the initial state in the correct format
    resetSimulator();

    // Mark the simulator as initialized to allow other functions to check this state if needed
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