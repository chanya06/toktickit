const docx = require('docx');
const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, BorderStyle, WidthType, ImageRun } = docx;

async function convertMarkdownToDocx() {
  const markdownPath = path.join('c:', 'Users', 'chany', 'Documents', 'GitHub', 'toktickit', 'docs', 'lab-02', 'submission-report.md');
  const docxPath = path.join('c:', 'Users', 'chany', 'Documents', 'GitHub', 'toktickit', 'docs', 'lab-02', 'submission-report.docx');
  
  const markdown = fs.readFileSync(markdownPath, 'utf-8');
  const tokens = marked.lexer(markdown);

  const children = [];

  for (const token of tokens) {
    if (token.type === 'heading') {
      let level = HeadingLevel.HEADING_1;
      if (token.depth === 2) level = HeadingLevel.HEADING_2;
      if (token.depth === 3) level = HeadingLevel.HEADING_3;
      if (token.depth === 4) level = HeadingLevel.HEADING_4;

      children.push(
        new Paragraph({
          text: token.text,
          heading: level,
          spacing: { before: 200, after: 100 },
        })
      );
    } else if (token.type === 'paragraph') {
      // Check if paragraph contains an image markdown token
      if (token.tokens && token.tokens.length === 1 && token.tokens[0].type === 'image') {
        const imgToken = token.tokens[0];
        let imgRelPath = imgToken.href;
        if (imgRelPath.startsWith('../../')) {
          imgRelPath = imgRelPath.replace('../../', '');
        }
        const imgAbsPath = path.join('c:', 'Users', 'chany', 'Documents', 'GitHub', 'toktickit', imgRelPath);
        if (fs.existsSync(imgAbsPath)) {
          try {
            const imgData = fs.readFileSync(imgAbsPath);
            children.push(
              new Paragraph({
                children: [
                  new ImageRun({
                    data: imgData,
                    transformation: { width: 550, height: 350 },
                  }),
                ],
                spacing: { before: 150, after: 150 },
              })
            );
          } catch (e) {
            children.push(new Paragraph({ children: [new TextRun({ text: `[Image: ${imgToken.alt}]`, italic: true })] }));
          }
        } else {
          children.push(new Paragraph({ children: [new TextRun({ text: `[Image: ${imgToken.alt}]`, italic: true })] }));
        }
      } else {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: token.text })],
            spacing: { before: 100, after: 100 },
          })
        );
      }
    } else if (token.type === 'blockquote') {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: token.text, italic: true, color: '374151' })],
          spacing: { before: 100, after: 100 },
        })
      );
    } else if (token.type === 'code') {
      children.push(
        new Paragraph({
          children: [new TextRun({ text: token.text, font: 'Consolas', size: 18, color: '1F2937' })],
          spacing: { before: 100, after: 100 },
        })
      );
    } else if (token.type === 'table') {
      const rows = [];
      // Header row
      const headerCells = token.header.map(
        h =>
          new TableCell({
            children: [new Paragraph({ children: [new TextRun({ text: h.text, bold: true, color: '006B3C' })] })],
            shading: { fill: 'EAF6EF' },
          })
      );
      rows.push(new TableRow({ children: headerCells }));

      // Data rows
      for (const row of token.rows) {
        const cells = row.map(
          c =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: c.text })] })],
            })
        );
        rows.push(new TableRow({ children: cells }));
      }

      children.push(
        new Table({
          rows: rows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      );
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(docxPath, buffer);
  console.log(`DOCX file created successfully (${buffer.length} bytes) at: ${docxPath}`);
}

convertMarkdownToDocx().catch(console.error);
