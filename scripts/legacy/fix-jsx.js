const fs = require('fs');

let content = fs.readFileSync('app/(main)/page.js', 'utf-8');

// fix comments
content = content.replace(/<!--(.*?)-->/g, '{/*$1*/}');

// fix broken double slash tags
content = content.replace(/\/ \/>/g, '/>');
content = content.replace(/"\/ \/>/g, '"/>');

fs.writeFileSync('app/(main)/page.js', content);
console.log('Fixed JSX syntax');
