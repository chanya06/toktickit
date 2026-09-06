import fs from "fs";
import path from "path";
import { execSync } from "child_process";

async function main() {
  const mdPath = path.resolve("docs/lab-02/submission-report.md");
  const tempHtmlPath = path.resolve("docs/lab-02/temp-submission-report.html");
  const pdfPath = path.resolve("docs/lab-02/submission-report.pdf");

  let md = fs.readFileSync(mdPath, "utf-8");

  let htmlBody = md;

  // Code blocks
  htmlBody = htmlBody.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
    const escaped = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `<div class="code-container"><pre><code class="language-${lang || 'text'}">${escaped}</code></pre></div>`;
  });

  // Blockquotes (Callout boxes for placeholders & notes)
  htmlBody = htmlBody.replace(/^> (.*$)/gim, '<blockquote class="callout-box">$1</blockquote>');

  // Images
  htmlBody = htmlBody.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
    let absoluteImgPath = src;
    if (src.startsWith("../../")) {
      absoluteImgPath = path.resolve("docs/lab-02", src);
    }
    const fileUrl = "file:///" + absoluteImgPath.replace(/\\/g, "/");
    return `<div class="img-container"><img src="${fileUrl}" alt="${alt}"><p class="img-caption"><em>${alt}</em></p></div>`;
  });

  // Headers
  htmlBody = htmlBody.replace(/^# (.*$)/gim, '<h1 class="doc-title">$1</h1>');
  htmlBody = htmlBody.replace(/^## (.*$)/gim, '<h2 class="part-header">$1</h2>');
  htmlBody = htmlBody.replace(/^### (.*$)/gim, '<h3 class="section-header">$1</h3>');
  htmlBody = htmlBody.replace(/^#### (.*$)/gim, '<h4 class="subsection-header">$1</h4>');

  // Bold & Italic
  htmlBody = htmlBody.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  htmlBody = htmlBody.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Inline code
  htmlBody = htmlBody.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');

  // Checkboxes
  htmlBody = htmlBody.replace(/- \[x\] (.*$)/gim, '<div class="checkbox-item checked">✓ $1</div>');
  htmlBody = htmlBody.replace(/- \[ \] (.*$)/gim, '<div class="checkbox-item unchecked">☐ $1</div>');

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
        let tableHtml = '<div class="table-container"><table class="custom-table">';
        tableBuffer.forEach((rowStr, idx) => {
          if (rowStr.includes("---")) return;
          const cells = rowStr.split("|").slice(1, -1).map(c => c.trim());
          if (idx === 0) {
            tableHtml += '<thead><tr>';
            cells.forEach(c => tableHtml += `<th>${c}</th>`);
            tableHtml += '</tr></thead><tbody>';
          } else {
            tableHtml += `<tr>`;
            cells.forEach(c => {
              let cellContent = c;
              if (cellContent === "Pass" || cellContent === "Approved" || cellContent === "Merged") {
                cellContent = `<span class="badge badge-success">${cellContent}</span>`;
              }
              tableHtml += `<td>${cellContent}</td>`;
            });
            tableHtml += '</tr>';
          }
        });
        tableHtml += '</tbody></table></div>';
        processedLines.push(tableHtml);
      }
      processedLines.push(line);
    }
  }
  if (inTable) {
    let tableHtml = '<div class="table-container"><table class="custom-table">';
    tableBuffer.forEach((rowStr, idx) => {
      if (rowStr.includes("---")) return;
      const cells = rowStr.split("|").slice(1, -1).map(c => c.trim());
      if (idx === 0) {
        tableHtml += '<thead><tr>';
        cells.forEach(c => tableHtml += `<th>${c}</th>`);
        tableHtml += '</tr></thead><tbody>';
      } else {
        tableHtml += `<tr>`;
        cells.forEach(c => {
          let cellContent = c;
          if (cellContent === "Pass" || cellContent === "Approved" || cellContent === "Merged") {
            cellContent = `<span class="badge badge-success">${cellContent}</span>`;
          }
          tableHtml += `<td>${cellContent}</td>`;
        });
        tableHtml += '</tr>';
      }
    });
    tableHtml += '</tbody></table></div>';
    processedLines.push(tableHtml);
  }

  htmlBody = processedLines.join("\n");
  htmlBody = htmlBody.replace(/\n\n/g, "<p></p>");

  const fullHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>TokTickIT Lab 2 Submission Report</title>
    <style>
      @page {
        margin: 12mm 15mm;
        size: A4;
      }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        font-size: 11px;
        line-height: 1.5;
        color: #24292e;
        background-color: #ffffff;
        padding: 0;
        margin: 0;
      }
      .doc-title {
        color: #006B3C;
        font-size: 19px;
        font-weight: 700;
        border-bottom: 3px solid #006B3C;
        padding-bottom: 6px;
        margin-top: 0;
        margin-bottom: 12px;
      }
      .part-header {
        color: #006B3C;
        font-size: 14.5px;
        font-weight: 700;
        border-bottom: 1.5px solid #0B7A46;
        padding-bottom: 4px;
        margin-top: 20px;
        margin-bottom: 10px;
        page-break-before: always;
        break-before: page;
        page-break-after: avoid;
        break-after: avoid;
      }
      .part-header:first-of-type {
        page-break-before: avoid !important;
        break-before: avoid !important;
      }
      .section-header {
        color: #1b1f23;
        font-size: 12.5px;
        font-weight: 600;
        margin-top: 14px;
        margin-bottom: 6px;
        page-break-after: avoid;
        break-after: avoid;
      }
      .subsection-header {
        color: #333333;
        font-size: 11.5px;
        font-weight: 600;
        margin-top: 10px;
        margin-bottom: 4px;
        page-break-after: avoid;
        break-after: avoid;
      }
      p {
        margin-top: 0;
        margin-bottom: 6px;
      }
      a {
        color: #006B3C;
        text-decoration: none;
        font-weight: 500;
      }
      .inline-code {
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        padding: 1px 4px;
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
        font-size: 0.88em;
        color: #111827;
      }
      .callout-box {
        background-color: #fffbeb;
        border-left: 4px solid #f59e0b;
        color: #92400e;
        padding: 8px 12px;
        margin: 8px 0;
        font-size: 10.5px;
        border-radius: 0 4px 4px 0;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .code-container {
        margin: 8px 0;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      pre {
        background: #1e293b;
        color: #f8fafc;
        padding: 10px 12px;
        border-radius: 5px;
        overflow-x: auto;
        font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
        font-size: 10px;
        line-height: 1.4;
      }
      .table-container {
        margin: 8px 0;
        page-break-inside: avoid;
        break-inside: avoid;
      }
      .custom-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 10px;
      }
      .custom-table th {
        background-color: #006B3C;
        color: #ffffff;
        font-weight: 600;
        padding: 5px 8px;
        border: 1px solid #00522e;
        text-align: left;
      }
      .custom-table td {
        padding: 4px 8px;
        border: 1px solid #d1d5db;
        vertical-align: top;
      }
      .custom-table tr:nth-child(even) {
        background-color: #f9fafb;
      }
      .badge {
        display: inline-block;
        padding: 1.5px 5.5px;
        font-size: 9px;
        font-weight: 600;
        border-radius: 4px;
        text-align: center;
      }
      .badge-success {
        background-color: #dcfce7;
        color: #15803d;
        border: 1px solid #bbf7d0;
      }
      .img-container {
        text-align: center;
        margin: 8px 0 14px 0;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
      .img-container img {
        max-width: 82%;
        max-height: 380px;
        object-fit: contain;
        border: 1px solid #cbd5e1;
        border-radius: 5px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      }
      .img-caption {
        font-size: 9.5px;
        color: #64748b;
        margin-top: 4px;
        margin-bottom: 0;
      }
      .checkbox-item {
        font-size: 11px;
        margin: 3px 0;
      }
      .checkbox-item.checked {
        color: #15803d;
        font-weight: 600;
      }
      .checkbox-item.unchecked {
        color: #64748b;
      }
      hr {
        border: none;
        border-top: 1px solid #e2e8f0;
        margin: 14px 0;
      }
    </style>
  </head>
  <body>
    ${htmlBody}
  </body>
  </html>
  `;

  fs.writeFileSync(tempHtmlPath, fullHtml, "utf-8");

  console.log("Generating submission PDF via Headless Edge...");
  const edgePath = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
  const tempHtmlUrl = "file:///" + tempHtmlPath.replace(/\\/g, "/");

  const cmd = `"${edgePath}" --headless --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${tempHtmlUrl}"`;
  execSync(cmd, { stdio: "inherit" });

  if (fs.existsSync(tempHtmlPath)) {
    fs.unlinkSync(tempHtmlPath);
  }

  const stats = fs.statSync(pdfPath);
  console.log(`${stats.size} bytes written to file ${pdfPath}`);
  console.log(`PDF successfully generated at: ${pdfPath}`);
}

main().catch((err) => {
  console.error("PDF generation failed:", err);
  process.exit(1);
});
