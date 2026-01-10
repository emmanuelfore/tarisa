const fs = require('fs');

try {
    const content = fs.readFileSync('server/routes.ts', 'utf8');
    let openBraces = 0;
    let tryCount = 0;
    let catchCount = 0;
    let finallyCount = 0;

    // Clean comments/strings for better accuracy
    const cleanContent = content.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1').replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, '');

    for (let i = 0; i < cleanContent.length; i++) {
        if (cleanContent[i] === '{') openBraces++;
        if (cleanContent[i] === '}') openBraces--;
    }

    tryCount = (cleanContent.match(/\btry\b/g) || []).length;
    catchCount = (cleanContent.match(/\bcatch\b/g) || []).length;
    finallyCount = (cleanContent.match(/\bfinally\b/g) || []).length;

    console.log(`Open braces (should be 0): ${openBraces}`);
    console.log(`Try blocks: ${tryCount}`);
    console.log(`Catch blocks: ${catchCount}`);
    console.log(`Finally blocks: ${finallyCount}`);
    console.log(`Try - (Catch + Finally): ${tryCount - (catchCount + finallyCount)}`);

} catch (e) {
    console.error(e);
}
