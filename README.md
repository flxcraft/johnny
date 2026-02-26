# Johnny – Von Neumann Computer Simulator (Web)
This project is a **web-based simulator of a simple Von Neumann computer.**
It visualizes RAM, microcode and execution flow step by step and is mainly intended for **learning, teaching, and understanding basic computer architecture.**

The design and behavior of this simulator are inspired by the following projects:
- [https://github.com/Laubersheini/johnny](https://github.com/Laubersheini/johnny)
- [https://github.com/TobisMa/johnny](https://github.com/TobisMa/johnny)

Many thanks to the original authors for their work and inspiration. This project is a complete rewrite of the original codebase to improve code quality, maintainability and add new features. It also incorporates some ideas from other similar projects and adds some of my own ideas to enhance the learning experience.

The whole project is implemented in **HTML, SCSS and JavaScript** and runs entirely in the browser, so no installation is required. If you want to run it locally you can simply download the zip from any release and open the `index.html` file in your browser. Alternatively, you can also clone the repository and run it with a local development server (e.g. using the `Live Server` extension in VS Code) to get live reloading during development.

## Table of Contents
- [Live Demo & Versions](#live-demo--versions)
- [Features](#features)
- [File Format Specifications](#file-format-specifications)
    - [`.johnny` File Format](#johnny-file-format)
    - [`.ram` File Format](#ram-file-format)
    - [`.mc` File Format](#mc-file-format)
- [Notes & Limitations](#notes--limitations)
    - [Styling](#styling)
- [Motivation & Future Plans](#motivation--future-plans)

## Live Demo & Versions
The project is hosted on GitHub Pages and is available in different versions. Note that the Beta version is only updated during pre-releases and may not always be available or differ from the stable version.

| Version | Description | URL |
|---------|-------------|-----|
| Stable  | The latest stable version with all tested features and bug fixes. Updated regularly. | [https://flxcraft.github.io/johnny/](https://flxcraft.github.io/johnny/) |
| Beta    | The latest beta version with new features and changes that are still being tested. May contain bugs and is updated less frequently. | [https://flxcraft.github.io/johnny/beta/](https://flxcraft.github.io/johnny/beta/) |
| Preview | The latest preview version with the most recent changes and features that are still in development. May contain significant bugs and is updated very frequently. | [https://flxcraft.github.io/johnny/preview/](https://flxcraft.github.io/johnny/preview/) |

## Features
- Simulation of a simple Von Neumann computer with RAM, a control unit (with microcode) and an ALU (Arithmetic Logic Unit)
- Visualization of RAM and microcode tables with clear highlighting of the current instruction and execution flow
- Step-by-step execution (micro steps and macro steps) with visual feedback
- Support for loading complete projects from `.johnny` files or individual RAM and microcode from `.ram` and `.mc` files
- Insert and delete RAM rows **at arbitrary positions** to restructure programs, including automatic shifting and operand adjustment
- Editing RAM values by clicking on the row and using the input field in the arrow (double-clicking on the row also inserts the current RAM value into the input field for smoother editing)
- **Recording own macro instructions** by simply executing a sequence of microinstructions after clicking the "Record Macro" button
- Editing single microcode rows directly in the microcode table with **a double-click**
- Persistence of RAM and microcode state in the browser's local storage
- Predefined standard microcode for basic operations (fetch, take, add, sub, save, jmp, tst, inc, dec, null, hlt)
- Responsive design for different screen sizes

## File Format Specifications
The simulator supports loading RAM and microcode from text files with specific formats, as well as complete project files. Below are the specifications for the `.johnny`, `.ram` and `.mc` file formats.

### `.johnny` File Format
A `.johnny` file is a JSON-based project file that contains the complete state of a simulator project, including RAM contents, microcode, and macro instruction names. This format allows you to save and load entire projects in a single file.

#### Basic Rules
- The file must be valid **JSON**
- The file contains three main objects: `ram` (array), `microCode` (array), and `instructionNames` (object)
- `ram`: An array of non-negative integers representing the RAM contents, indexed from `0` (missing addresses at the end of the array are filled with `0`)
- `microCode`: An array of non-negative integers representing the microcode instructions, indexed from `0` (missing addresses at the end of the array are filled with `0`)
- `instructionNames`: An object mapping instruction indices to their display names (e.g., `{"0": "FETCH", "1": "TAKE", ...}`)

#### File Structure

```json
{
  "ram": [9006, 1005, 2005, 4006, 0, 42, ...],
  "microCode": [8, 2, 3, 5, 0, 0, ...],
  "instructionNames": {
    "0": "FETCH",
    "1": "TAKE",
    "2": "ADD",
    "3": "SUB",
    "4": "SAVE",
    "5": "JMP",
    "6": "TST",
    "7": "INC",
    "8": "DEC",
    "9": "NULL",
    "10": "HLT"
  }
}
```

#### Usage
- The `.johnny` format allows you to save and share complete project configurations
- Use the "Download Project" button in the simulator to export your current project as a `.johnny` file
- Use the "Upload Project" button to import a previously saved `.johnny` file, which will restore both RAM and microcode state
- This is the recommended format for sharing and backing up complete simulator projects

### `.ram` File Format
A `.ram` file defines the initial contents of the RAM. Each line corresponds to a RAM address, starting from `0`. The value on each line represents the content of that RAM address.

#### Basic Rules
- **One number per line**
- Each line corresponds to **one RAM address**, starting at address `0`
- Only **non-negative integers** are allowed
- The value range is: `0 ≤ value ≤ RAM_MAX_VALUE (default: 0-19999)`

#### Comments & Empty Lines
- **Empty lines** are ignored
- Lines starting with `#` are considered **comments** and are ignored
- **In-line comments are also supported:** any text after a `#` on a line is ignored, allowing for comments at the end of lines with values

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
# The next line is empty and will be ignored

0
42

# Remaining RAM is filled with 0 automatically
```
</details>

### `.mc` File Format
A `.mc` file describes the initial contents of the microcode. Each line corresponds to a microinstruction, starting from address `0`. The value on each line represents the control signals for that microinstruction, encoded as a non-negative integer. The valid values correspond to specific combinations of control signals, which are defined in the simulator's code. The valid value range is `0-5` and `7-19` (6 is not assigned to any combination of control signals). After the microcode instructions, the file contains the names of the macro instructions, which are then displayed in the microcode table for better readability. The names of the macro instructions are stored at the end of the microcode, starting from address `MICROCODE_SIZE (default: 200)`, so the microcode instructions can only be defined up to address `MICROCODE_SIZE - 1 (default: 199)`.

<details>
<summary>Control Signal Mapping</summary>

| Value | Micro instruction               |
|-------|---------------------------------|
| 0     | No control signals active (NOP) |
| 1     | db ---> ram                     |
| 2     | ram ---> db                     |
| 3     | db ---> ins                     |
| 4     | ins ---> ab                     |
| 5     | ins ---> mc                     |
| 7     | mc := 0                         |
| 8     | pc ---> ab                      |
| 9     | pc++                            |
| 10    | acc=0? -> pc++                  |
| 11    | ins ---> pc                     |
| 12    | acc := 0                        |
| 13    | plus                            |
| 14    | minus                           |
| 15    | acc ---> db                     |
| 16    | acc++                           |
| 17    | acc--                           |
| 18    | db ---> acc                     |
| 19    | stop (halt)                     |

</details>

#### Basic Rules
- **One number per line**
- Each line corresponds to **one microinstruction**, starting at address `0`
- Only **non-negative integers** are allowed
- The valid value range is: `0-5` and `7-19` (don't know why 6 is not used, but I want to keep it consistent with the original version)

#### Comments & Empty Lines
- **Empty lines** are ignored
- Lines starting with `#` are considered **comments** and are ignored
- In-line comments are also supported: any text after a `#` on a line is ignored, allowing for comments at the end of lines with values

#### File Length
- The file may **not be shorter than the microcode size**, as the **names of the macro instructions are stored at the end**
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
- RAM and microcode changes are persisted using `localStorage`. While there is no built-in versioning, you can easily create backups by regularly exporting your projects as `.johnny` files
- The RAM and microcode sizes are fixed (default: 1000 RAM addresses, 200 Micro Code Addresses), but can be changed in the code if needed (see `RAM_SIZE` and `MICROCODE_SIZE` constants in `main.js` - ***Warning:** Changing these values has not been thoroughly tested and may cause unexpected issues. Maybe you also need to adjust some places in the code where these constants aren't used)*

### Styling
The project uses SCSS for styling, which is compiled to CSS for production (hosting on GitHub Pages) using GitHub Actions. The SCSS source files are located at `./static/style/`, and the production CSS files is generated in the same directory. For development, I use the `Live Sass Compiler` extension in VS Code to automatically compile SCSS to CSS on save.

## Motivation & Future Plans
The motivation for this project was to create a more modern, user-friendly and feature-rich version of the original Johnny simulator, which was a great learning tool but had some limitations in terms of code quality, maintainability and user experience. I wanted to rewrite the codebase from scratch to improve these aspects and add new features that I think would enhance the learning experience.

I'm very proud that my entire computer science advanced course (LK) uses my version of this simulator, and everyone in my class used it for their exam. It's incredibly rewarding to see how this rewrite helps students understand computer architecture in a more intuitive and interactive way.

In the future, I plan to add more features such as:
- **✅ Implemented:** Support for importing and exporting RAM and microcode as a single project file (e.g. JSON format) to allow saving and sharing complete setups
- Some predefined example RAM and microcode files for common algorithms (e.g. addition, multiplication, loops, etc.) to provide ready-to-use examples for learning and testing
- **✅ Implemented (more following):** Settings to to customize some aspects of the simulator without changing the code