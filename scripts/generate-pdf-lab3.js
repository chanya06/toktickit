import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { marked } from "marked";

async function main() {
  const mdPath = path.resolve("docs/lab-03/final-deliverable.md");
  const tempHtmlPath = path.resolve("docs/lab-03/temp-final-deliverable.html");
  const pdfPath = path.resolve("docs/lab-03/final-deliverable.pdf");

  let md = fs.readFileSync(mdPath, "utf-8");

  marked.setOptions({
    gfm: true,
    breaks: false,
  });

  let htmlBody = marked.parse(md);

  // Post-process HTML for custom image styling and captions
  htmlBody = htmlBody.replace(/<img src="([^"]+)" alt="([^"]*)">/g, (match, src, alt) => {
    let absoluteImgPath = src;
    if (src.startsWith("../../")) {
      absoluteImgPath = path.resolve("docs/lab-03", src);
    }
    const fileUrl = "file:///" + absoluteImgPath.replace(/\\/g, "/");
    return `<div class="img-container"><img src="${fileUrl}" alt="${alt}">${alt ? `<p class="img-caption"><em>${alt}</em></p>` : ''}</div>`;
  });

  // Post-process badges in tables
  htmlBody = htmlBody.replace(/<td>(Pass|Approved|Merged|100% Pass)<\/td>/gi, '<td><span class="badge badge-success">$1</span></td>');

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>TokTickIT Lab 3 — Final Engineering Deliverable</title>
  <style>
    @page {
      margin: 12mm 15mm;
      size: A4;
    }
    *, *:before, *:after {
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 11px;
      line-height: 1.55;
      color: #1e293b;
      background-color: #ffffff;
      padding: 0;
      margin: 0;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    h1 {
      color: #006B3C;
      font-size: 20px;
      font-weight: 700;
      border-bottom: 3px solid #006B3C;
      padding-bottom: 6px;
      margin-top: 0;
      margin-bottom: 12px;
    }
    h2 {
      color: #006B3C;
      font-size: 15px;
      font-weight: 700;
      border-bottom: 1.5px solid #0B7A46;
      padding-bottom: 4px;
      margin-top: 22px;
      margin-bottom: 10px;
      page-break-before: always;
      break-before: page;
      page-break-after: avoid;
      break-after: avoid;
    }
    h2:first-of-type {
      page-break-before: avoid !important;
      break-before: avoid !important;
    }
    h3 {
      color: #0f172a;
      font-size: 13px;
      font-weight: 600;
      margin-top: 14px;
      margin-bottom: 6px;
      page-break-after: avoid;
      break-after: avoid;
    }
    h4 {
      color: #334155;
      font-size: 12px;
      font-weight: 600;
      margin-top: 10px;
      margin-bottom: 4px;
      page-break-after: avoid;
      break-after: avoid;
    }
    p {
      margin-top: 0;
      margin-bottom: 8px;
    }
    ul, ol {
      margin-top: 0;
      margin-bottom: 8px;
      padding-left: 20px;
    }
    li {
      margin-bottom: 3px;
    }
    a {
      color: #006B3C;
      text-decoration: none;
      font-weight: 500;
    }
    code {
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
      font-size: 0.9em;
      background-color: #f1f5f9;
      color: #0f172a;
      padding: 1px 4px;
      border-radius: 3px;
      border: 1px solid #e2e8f0;
    }
    pre {
      background-color: #1e293b;
      color: #f8fafc;
      padding: 10px 12px;
      border-radius: 6px;
      overflow-x: auto;
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
      font-size: 10px;
      line-height: 1.4;
      margin: 10px 0;
      page-break-inside: avoid;
      break-inside: avoid;
      white-space: pre-wrap;
      word-break: break-all;
    }
    pre code {
      background-color: transparent !important;
      border: none !important;
      padding: 0 !important;
      border-radius: 0 !important;
      color: #f8fafc !important;
      display: block;
    }
    blockquote {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      color: #78350f;
      padding: 8px 12px;
      margin: 10px 0;
      font-size: 11px;
      border-radius: 0 4px 4px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    blockquote p {
      margin: 4px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
      margin: 10px 0 14px 0;
      page-break-inside: avoid;
      break-inside: avoid;
      table-layout: auto;
    }
    th {
      background-color: #006B3C;
      color: #ffffff;
      font-weight: 600;
      padding: 6px 8px;
      border: 1px solid #00522e;
      text-align: left;
    }
    td {
      padding: 5px 8px;
      border: 1px solid #cbd5e1;
      vertical-align: top;
    }
    tr:nth-child(even) {
      background-color: #f8fafc;
    }
    .badge {
      display: inline-block;
      padding: 2px 6px;
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
      margin: 12px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    .img-container img {
      max-width: 90%;
      height: auto;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .img-caption {
      font-size: 9.5px;
      color: #64748b;
      margin-top: 3px;
      margin-bottom: 0;
    }
    hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 16px 0;
    }
  </style>
</head>
<body>
  ${htmlBody}
</body>
</html>`;

  fs.writeFileSync(tempHtmlPath, fullHtml, "utf-8");

  console.log("Generating Lab 3 PDF via Headless Edge...");
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
