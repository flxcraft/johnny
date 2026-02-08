/**
 * Executes a single macro step (all micro steps for the current instruction).
 *
 * @returns {void}
 */
function singleMacroStep() {
    do {
        microStep(false);
    } while (microCodeCounter != 0 && !isHlt); // continue until microcode counter resets to 0 (end of instruction) or HLT reached
}

/**
 * Runs the macro program continuously at a speed determined by the speed slider.
 * Stops execution if a HLT instruction is reached or if the macro running flag is cleared.
 * 
 * @returns {void}
 */
function runMacroProgram() {
    if (isHlt) {
        console.warn("Program has reached HLT instruction; cannot run further.");
        return;
    }

    if (isMacroRunning) {
        console.warn("Macro program is already running.");
        return;
    }

    isMacroRunning = true;

    function step() {
        if (!isMacroRunning) return; // stop if macro running flag is cleared
        if (isHlt) {
            console.info("Program has reached HLT instruction; stopping execution.");
            isMacroRunning = false;
            return;
        }

        singleMacroStep();

        // Schedule the next step
        setTimeout(step, macroExecutionDelay);
    }

    // Start the execution loop
    step();
}

/**
 * Pauses the execution of the macro program.
 * 
 * @returns {void}
 */
function stopMacroProgram() {
    isMacroRunning = false;
}