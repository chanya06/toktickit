import fs from "fs";
import path from "path";
import { execSync } from "child_process";

async function main() {
  const mdPath = path.resolve("docs/lab-02/final-deliverable.md");
  const tempHtmlPath = path.resolve("docs/lab-02/temp-final-deliverable.html");
  const pdfPath = path.resolve("docs/lab-02/final-deliverable.pdf");

  let md = fs.readFileSync(mdPath, "utf-8");

  let htmlBody = md;

  // Code blocks
  htmlBody = htmlBody.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<pre><code class="language-${lang || 'text'}">${escaped}</code></pre>`;
  });

  // Images
  htmlBody = htmlBody.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
    let absoluteImgPath = src;
    if (src.startsWith("../../")) {
      absoluteImgPath = path.resolve("docs/lab-02", src);
    }
    const fileUrl = "file:///" + absoluteImgPath.replace(/\\/g, "/");
    return `<div style="text-align: center; margin: 15px 0;"><img src="${fileUrl}" alt="${alt}" style="max-width: 90%; border: 1px solid #ccc; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);"><p style="font-size: 11px; color: #555; margin-top: 4px;"><em>${alt}</em></p></div>`;
  });

  // Headers
  htmlBody = htmlBody.replace(/^# (.*$)/gim, '<h1 style="color: #006B3C; border-bottom: 2px solid #006B3C; padding-bottom: 6px; margin-top: 24px;">$1</h1>');
  htmlBody = htmlBody.replace(/^## (.*$)/gim, '<h2 style="color: #0B7A46; border-bottom: 1px solid #ddd; padding-bottom: 4px; margin-top: 20px;">$1</h2>');
  htmlBody = htmlBody.replace(/^### (.*$)/gim, '<h3 style="color: #222; margin-top: 16px;">$1</h3>');

  // Bold & Italic
  htmlBody = htmlBody.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  htmlBody = htmlBody.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Inline code
  htmlBody = htmlBody.replace(/`([^`]+)`/g, '<code style="background: #f4f4f4; border: 1px solid #ddd; border-radius: 3px; padding: 2px 5px; font-family: monospace; font-size: 0.9em;">$1</code>');

  // Tables
  const lines = htmlBody.split("\n");
  let inTable = false;
  let tableBuffer = [];
  let processedLines = [];

  for (let line of lines) {
    if (line.trim().startsWith("|")) {
      if (!inTable) {
        inTable = true;
        tableBuffer = [];
      }
      tableBuffer.push(line.trim());
    } else {
      if (inTable) {
        inTable = false;
        let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 12px;">';
        tableBuffer.forEach((rowStr, idx) => {
          if (rowStr.includes("---")) return;
          const cells = rowStr.split("|").slice(1, -1).map(c => c.trim());
          if (idx === 0) {
            tableHtml += '<thead style="background: #006B3C; color: white;"><tr>';
            cells.forEach(c => tableHtml += `<th style="padding: 8px; border: 1px solid #ccc; text-align: left;">${c}</th>`);
            tableHtml += '</tr></thead><tbody>';
          } else {
            const bg = idx % 2 === 0 ? '#f9f9f9' : '#ffffff';
            tableHtml += `<tr style="background: ${bg};">`;
            cells.forEach(c => tableHtml += `<td style="padding: 8px; border: 1px solid #ccc;">${c}</td>`);
            tableHtml += '</tr>';
          }
        });
        tableHtml += 'tbody></table>';
        processedLines.push(tableHtml);
      }
      processedLines.push(line);
    }
  }
  if (inTable) {
    let tableHtml = '<table style="width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 12px;">';
    tableBuffer.forEach((rowStr, idx) => {
      if (rowStr.includes("---")) return;
      const cells = rowStr.split("|").slice(1, -1).map(c => c.trim());
      if (idx === 0) {
        tableHtml += '<thead style="background: #006B3C; color: white;"><tr>';
        cells.forEach(c => tableHtml += `<th style="padding: 8px; border: 1px solid #ccc; text-align: left;">${c}</th>`);
        tableHtml += '</tr></thead><tbody>';
      } else {
        const bg = idx % 2 === 0 ? '#f9f9f9' : '#ffffff';
        tableHtml += `<tr style="background: ${bg};">`;
        cells.forEach(c => tableHtml += `<td style="padding: 8px; border: 1px solid #ccc;">${c}</td>`);
        tableHtml += '</tr>';
      }
    });
    tableHtml += 'tbody></table>';
    processedLines.push(tableHtml);
  }

  htmlBody = processedLines.join("\n");
  htmlBody = htmlBody.replace(/\n\n/g, "<p></p>");

  const fullHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>TokTickIT Lab 2 — Final Engineering Deliverable</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 13px;
        line-height: 1.6;
        color: #333;
        padding: 20px;
      }
      pre {
        background: #282c34;
        color: #abb2bf;
        padding: 12px;
        border-radius: 6px;
        overflow-x: auto;
        font-size: 11px;
      }
      hr {
        border: none;
        border-top: 1px solid #e0e0e0;
        margin: 20px 0;
      }
      @page {
        margin: 15mm;
      }
    </style>
  </head>
  <body>
    ${htmlBody}
  </body>
  </html>
  `;

  fs.writeFileSync(tempHtmlPath, fullHtml, "utf-8");

  console.log("Generating PDF via Headless Edge...");
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const tempHtmlUrl = "file:///" + tempHtmlPath.replace(/\\/g, "/");

  const cmd = `"${edgePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${tempHtmlUrl}"`;
  execSync(cmd, { stdio: "inherit" });

  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }

  console.log(`PDF successfully generated at: ${pdfPath}`);
}

main().catch((err) => {
  console.error("PDF generation failed:", err);
  process.exit(1);
});
