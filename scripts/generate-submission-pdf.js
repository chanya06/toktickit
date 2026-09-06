import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { marked } from "marked";

async function main() {
  const mdPath = path.resolve("docs/lab-02/submission-report.md");
  const tempHtmlPath = path.resolve("docs/lab-02/temp-submission-report.html");
  const pdfPath = path.resolve("docs/lab-02/submission-report.pdf");

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
      absoluteImgPath = path.resolve("docs/lab-02", src);
    }
    const fileUrl = "file:///" + absoluteImgPath.replace(/\\/g, "/");
    return `<div class="img-container"><img src="${fileUrl}" alt="${alt}">${alt ? `<p class="img-caption"><em>${alt}</em></p>` : ''}</div>`;
  });

  // Post-process badges in tables
  htmlBody = htmlBody.replace(/<td>(Pass|Approved|Merged)<\/td>/gi, '<td><span class="badge badge-success">$1</span></td>');

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>LAB 02 : TokTickIT Requester Ticketing MVP with UI Foundation</title>
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
      font-size: 11.5px;
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
      font-size: 21px;
      font-weight: 700;
      border-bottom: 3px solid #006B3C;
      padding-bottom: 6px;
      margin-top: 0;
      margin-bottom: 12px;
    }
    h2 {
      color: #006B3C;
      font-size: 16px;
      font-weight: 700;
      border-bottom: 1.5px solid #0B7A46;
      padding-bottom: 4px;
      margin-top: 22px;
      margin-bottom: 12px;
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
      font-size: 13.5px;
      font-weight: 600;
      margin-top: 16px;
      margin-bottom: 8px;
      page-break-after: avoid;
      break-after: avoid;
    }
    h4 {
      color: #334155;
      font-size: 12.5px;
      font-weight: 600;
      margin-top: 12px;
      margin-bottom: 6px;
      page-break-after: avoid;
      break-after: avoid;
    }
    p {
      margin-top: 0;
      margin-bottom: 8px;
      line-height: 1.55;
    }
    a {
      color: #006B3C;
      text-decoration: none;
      font-weight: 500;
      word-break: break-all;
      overflow-wrap: anywhere;
    }
    ul, ol {
      margin-top: 0;
      margin-bottom: 10px;
      padding-left: 20px;
    }
    li {
      margin-bottom: 4px;
      line-height: 1.5;
    }
    code {
      background-color: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 1px 5px;
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
      font-size: 0.9em;
      color: #0f172a;
      word-break: break-word;
      white-space: normal;
    }
    pre {
      background-color: #1e293b;
      color: #f8fafc;
      padding: 10px 12px;
      border-radius: 6px;
      overflow-x: auto;
      margin: 10px 0 14px 0;
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
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
      font-size: 10.5px;
      line-height: 1.45;
      display: block;
    }
    blockquote {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      color: #78350f;
      padding: 8px 12px;
      margin: 10px 0;
      font-size: 11.5px;
      border-radius: 0 4px 4px 0;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    blockquote p {
      margin: 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
      margin: 10px 0 14px 0;
      page-break-inside: avoid;
      break-inside: avoid;
      table-layout: auto;
    }
    th {
      background-color: #006B3C;
      color: #ffffff;
      font-weight: 600;
      padding: 6px 9px;
      border: 1px solid #00522e;
      text-align: left;
    }
    td {
      padding: 5px 9px;
      border: 1px solid #cbd5e1;
      vertical-align: top;
      word-break: break-word;
    }
    tr:nth-child(even) {
      background-color: #f8fafc;
    }
    .badge {
      display: inline-block;
      padding: 1.5px 5.5px;
      font-size: 9.5px;
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
      margin: 10px 0 16px 0;
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .img-container img {
      max-width: 85%;
      max-height: 380px;
      object-fit: contain;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .img-caption {
      font-size: 10px;
      color: #64748b;
      margin-top: 5px;
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
