const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf-8');

// Extract the sections
const startIdx = html.indexOf('<!-- Hero Section -->');
const endIdx = html.indexOf('<!-- Footer -->');

let content = html.substring(startIdx, endIdx);

// Basic JSX conversions
content = content.replace(/class="/g, 'className="');
content = content.replace(/tabindex="/g, 'tabIndex="');
content = content.replace(/for="/g, 'htmlFor="');
content = content.replace(/viewBox="/g, 'viewBox="');
content = content.replace(/fill-rule="/g, 'fillRule="');
content = content.replace(/clip-rule="/g, 'clipRule="');
content = content.replace(/stroke-width="/g, 'strokeWidth="');
content = content.replace(/stroke-linecap="/g, 'strokeLinecap="');
content = content.replace(/stroke-linejoin="/g, 'strokeLinejoin="');
content = content.replace(/<img([^>]*)>/g, '<img$1 />');
content = content.replace(/<input([^>]*)>/g, '<input$1 />');
content = content.replace(/<br>/g, '<br />');
content = content.replace(/<hr>/g, '<hr />');

// some HTML attributes might be unclosed
// make sure all <img > ends with /> 

const finalJSX = `import Link from "next/link";

export default function Home() {
  return (
    <>
      ${content}
    </>
  );
}
`;

fs.writeFileSync('app/(main)/page.js', finalJSX);
console.log('Migrated page.js');
