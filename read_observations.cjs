const fs = require('fs');
const readline = require('readline');

const pathFull = 'C:\\Users\\LENOVO\\.gemini\\antigravity-cli\\brain\\80afafa6-d635-47e9-a19d-ab9f18b65f5e\\.system_generated\\logs\\transcript_full.jsonl';

const rlFull = readline.createInterface({
  input: fs.createReadStream(pathFull),
  crlfDelay: Infinity
});

rlFull.on('line', (line) => {
  if (line.includes('"type":"USER_INPUT"') && line.includes('observaciones:')) {
    const data = JSON.parse(line);
    console.log("FOUND IN FULL TRANSCRIPT:");
    console.log(data.content);
  }
});
