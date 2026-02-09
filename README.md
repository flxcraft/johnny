# Johnny – Von Neumann Computer Simulator (Web)
This project is a **web-based simulator of a simple Von Neumann computer.**
It visualizes RAM, microcode and execution flow step by step and is mainly intended for **learning, teaching, and understanding basic computer architecture.**

The design and behavior of this simulator are inspired by the following projects:
- [https://github.com/Laubersheini/johnny](https://github.com/Laubersheini/johnny)
- [https://github.com/TobisMa/johnny](https://github.com/TobisMa/johnny)

Many thanks to the original authors for their work and inspiration. This project is a complete rewrite of the original codebase to improve code quality, maintainability and add new features. It also incorporates some ideas from other similar projects and adds some of my own ideas to enhance the learning experience.

The whole project is implemented in **HTML, CSS and JavaScript** and runs entirely in the browser, so no installation is required. Just open the `index.html` file in a modern web browser to get started.

## Features
- Simulation of a simple Von Neumann computer with RAM, a control unit (with microcode) and an ALU (Arithmetic Logic Unit)
- Visualization of RAM and microcode tables
- Step-by-step execution (micro steps and macro steps)
- Editable RAM and microcode tables with manual input and file loading
- Support for loading RAM and microcode from `.ram` and `.mc` files
- Clear and intuitive user interface with buttons and visual feedback
- Insert and delete RAM rows **at arbitrary positions** to restructure programs, including automatic shifting and operand adjustment
- Error handling and warnings for invalid inputs
- Persistence of RAM and microcode state in the browser's local storage
- Predefined standard microcode for basic operations (fetch, take, add, sub, save, jmp, tst, inc, dec, null, hlt)
- Responsive design for different screen sizes

## File Format Specifications
The simulator supports loading RAM and microcode from text files with specific formats. Below are the specifications for the `.ram` and `.mc` file formats.

### `.ram` File Format
A `.ram` file defines the initial contents of the main memory (RAM).

#### Basic Rules
- **One number per line**
- Each line corresponds to **one RAM address**, starting at address `0`
- Only **non-negative integers** are allowed
- The value range is: `0 ≤ value ≤ RAM_MAX_VALUE (default: 0-19999)`

#### Comments & Empty Lines
- **Empty lines** are ignored
- Lines starting with `#` are considered **comments** and are ignored
- In-line comments are also supported: any text after a `#` on a line is ignored, allowing for comments at the end of lines with values

#### File Length
- The file may be **shorter than the RAM size** - missing addresses are automatically filled with `0`
- If the file contains **more lines than RAM addresses**, the excess lines are ignored

#### Invalid Values
- Invalid values (non-integers or out of the valid range) are replaced with `0` and a warning is issued in the console

#### Example
<details>
<summary>Example RAM file</summary>

```text
# This is an example comment line
9006
1005 # This is an in-line comment
2005
4006
# The nex line is empty and will be ignored

0
42

# Remaining RAM is filled with 0 automatically
```
</details>

### `.mc` File Format
A `.mc` file describes the initial contents of the microprogram (microcode).

#### Basic Rules
- **One number per line**
- Each line corresponds to **one microinstruction**, starting at address `0`
- Only **non-negative integers** are allowed
- The valid value range is: `0-5` and `7-19` (6 is not assigned)

#### Comments & Empty Lines
- **Empty lines** are ignored
- Lines starting with `#` are considered **comments** and are ignored
- In-line comments are also supported: any text after a `#` on a line is ignored, allowing for comments at the end of lines with values

#### File Length
- The file may **not be shorter than the microcode size**, as the names of the macro instructions are stored at the end
- Microcode may only be defined up to address `MICROCODE_SIZE - 1 (default: 199)`, as the addresses after that are reserved for the names of the macro instructions

#### Invalid Values
- Invalid values (non-integers or out of the valid range) are replaced with `0` and a warning is issued in the console

#### Example
<details>
<summary>Example Microcode File (Default Micro Code)</summary>
```text
8
2
3
5
0
0
0
0
0
0
4
2
18
9
7
0
0
0
0
0
4
2
13
9
7
0
0
0
0
0
4
2
14
9
7
0
0
0
0
0
4
15
1
9
7
0
0
0
0
0
11
7
0
0
0
0
0
0
0
0
4
2
18
10
9
7
0
0
0
0
4
2
18
16
15
1
9
7
0
0
4
2
18
17
15
1
9
7
0
0
4
12
15
1
9
7
0
0
0
0
19
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
0
FETCH
TAKE
ADD
SUB
SAVE
JMP
TST
INC
DEC
NULL
HLT
```
</details>

## Notes & Limitations
- This simulator is designed for educational purposes, not performance
- RAM and microcode changes are persisted using `localStorage`, but there is no versioning or backup, so be careful when editing
- The RAM and microcode sizes are fixed (default: 1000 RAM addresses, 200 Micro Code Addresses), but can be changed in the code if needed (see `RAM_SIZE` and `MICROCODE_SIZE` constants in `main.js` - **Warning:** Changing these values has not been thoroughly tested and may cause unexpected issues.

### Styling
The project uses SCSS for styling, which is compiled to CSS for production (hosting on GitHub Pages) using GitHub Actions. The SCSS source file is located at `static/style/style.scss`, and the compiled CSS file is at `static/style/style.scss`. For development, I use the `Live Sass Compiler` extension in VS Code to automatically compile SCSS to CSS on save. The compiled CSS file is included in the `index.html` file.

## Motivation & Future Plans
The motivation for this project was to create a more modern, user-friendly and feature-rich version of the original Johnny simulator, which was a great learning tool but had some limitations in terms of code quality, maintainability and user experience. I wanted to rewrite the codebase from scratch to improve these aspects and add new features that I think would enhance the learning experience.

In the future, I plan to add more features such as:
- Support for importing and exporting RAM and microcode as a single project file (e.g. JSON format) to allow saving and sharing complete setups
- Some predefined example RAM and microcode files for common algorithms (e.g. addition, multiplication, loops, etc.) to provide ready-to-use examples for learning and testing
- Settings to to customize some aspects of the simulator without changing the code