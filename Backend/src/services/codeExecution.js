import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const tempDir = path.join(process.cwd(), 'temp');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

export const executeCode = (code, language, callback) => {
    const fileId = uuidv4();
    let fileName, command;

    // Use absolute paths to prevent "file not found" errors on Windows
    const getPath = (name) => path.join(tempDir, name);

    switch (language) {
        case 'javascript':
            fileName = `${fileId}.js`;
            command = `node "${getPath(fileName)}"`;
            break;
        case 'python':
            fileName = `${fileId}.py`;
            // Some Windows systems use 'python', some 'python3'
            command = `python "${getPath(fileName)}"`;
            break;
        case 'cpp':
            fileName = `${fileId}.cpp`;
            const exeName = `${fileId}.exe`;
            command = `g++ "${getPath(fileName)}" -o "${getPath(exeName)}" && "${getPath(exeName)}"`;
            break;
        case 'java':
            // Java requires class name to match file name
            const javaClass = `Main${fileId.replace(/-/g, '')}`;
            fileName = `${javaClass}.java`;
            command = `javac "${getPath(fileName)}" && java -cp "${tempDir}" ${javaClass}`;
            break;
        default:
            return callback({ error: 'Unsupported language' });
    }

    const filePath = getPath(fileName);

    try {
        // Step 1: Write file synchronously
        fs.writeFileSync(filePath, code);

        // Step 2: Execute with specific constraints
        const child = exec(command, {
            timeout: 10000, // 10 second limit
            maxBuffer: 1024 * 500 // 500KB output limit
        }, (error, stdout, stderr) => {

            // Step 3: Cleanup - Delete the files immediately
            try {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

                // Clean up Java/CPP leftovers
                const extraFile = language === 'java'
                    ? filePath.replace('.java', '.class')
                    : filePath.replace('.cpp', '.exe');

                if (fs.existsSync(extraFile)) fs.unlinkSync(extraFile);
            } catch (cleanupErr) {
                console.error("Cleanup failed:", cleanupErr);
            }

            // Step 4: Final Callback
            if (error) {
                if (error.killed) {
                    return callback({ error: "Execution Timed Out. Your code took too long to run." });
                }
                return callback({ output: stdout, error: stderr || error.message });
            }

            callback({ output: stdout, error: stderr });
        });

    } catch (err) {
        callback({ error: "Internal Server Error: " + err.message });
    }
};