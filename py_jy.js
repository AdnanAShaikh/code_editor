const fs = require("fs");
const { exec } = require("child_process");
const { v4: uuid } = require("uuid");
const path = require("path");

const dirCodes = path.join(__dirname, "../python_runner");
const dirJSCodes = path.join(__dirname, "../javascript_runner");

if (!fs.existsSync(dirCodes)) {
  fs.mkdirSync(dirCodes, { recursive: true });
}
if (!fs.existsSync(dirJSCodes)) {
  fs.mkdirSync(dirJSCodes, { recursive: true });
}

const generatePyFile = async (language, content) => {
  const job = uuid();
  const filename = `${job}.${language}`;
  const filepath = path.join(dirCodes, filename);

  fs.writeFileSync(filepath, content);
  return filepath;
};

const generateJsFile = async (language, content) => {
  try {
    const job = uuid();
    const filename = `${job}.${language}`;
    const filepath = path.join(dirJSCodes, filename);

    fs.writeFileSync(filepath, content);
    return filepath;
  } catch (error) {
    console.error("Error generating JS file:", error);
    throw error;
  }
};

const executePyFile = (filepathh) => {
  return new Promise((resolve, reject) => {
    const filename = path.basename(filepathh, ".py");
    const filepath = path.join(__dirname, "../python_runner");

    exec(`cd ${filepath} && python ${filename}.py`, (error, stdout, stderr) => {
      if (error) {
        console.error("Execution error:", error.message);
        reject(error.message);
      } else if (stderr) {
        console.error("Stderr:", stderr);
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
};

const executeJsFile = async (filepathh) => {
  return new Promise((resolve, reject) => {
    const filename = path.basename(filepathh, ".js");
    const filepath = path.join(__dirname, "../javascript_runner");

    exec(`cd ${filepath} && node ${filename}.js`, (error, stdout, stderr) => {
      if (error) {
        console.error("Execution error:", error.message);
        reject(error.message);
      } else if (stderr) {
        console.error("Stderr:", stderr);
        reject(stderr);
      } else {
        resolve(stdout);
      }
    });
  });
};

module.exports = {
  generatePyFile,
  executePyFile,
  generateJsFile,
  executeJsFile,
};
