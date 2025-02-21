import { Document, Packer, Paragraph, TextRun, HeadingLevel, UnderlineType, AlignmentType, Bullet } from 'docx';

const cleanText = (text: string): string => {
  return text
    .replace(/[^\x00-\x7F]/g, '') // Remove non-ASCII characters
    .replace(/\s+/g, ' ')         // Normalize whitespace
    .trim();
};

export const generateDocx = async (content: string, title: string): Promise<void> => {
  try {
    // Split content into sections
    const sections = content.split('\n\n').filter(Boolean);
    
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: cleanText(title),
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: {
              after: 400,
            },
          }),
          
          // Process each section
          ...sections.map(section => {
            const lines = section.split('\n');
            
            return lines.map(line => {
              const cleanLine = cleanText(line);
              
              // Check if it's a bullet point
              if (line.trim().startsWith('-') || line.trim().startsWith('•')) {
                return new Paragraph({
                  text: cleanLine.replace(/^[-•]\s*/, ''),
                  bullet: {
                    level: 0
                  },
                  spacing: {
                    before: 100,
                    after: 100,
                  },
                });
              }
              
              // Check if it's a heading (shorter lines are likely headings)
              if (cleanLine.length < 50 && !cleanLine.endsWith('.')) {
                return new Paragraph({
                  text: cleanLine,
                  heading: HeadingLevel.HEADING_2,
                  spacing: {
                    before: 200,
                    after: 100,
                  },
                });
              }
              
              // Regular paragraph
              return new Paragraph({
                text: cleanLine,
                spacing: {
                  before: 100,
                  after: 100,
                },
              });
            });
          }).flat(),
        ],
      }],
    });

    // Generate and save the document
    const buffer = await Packer.toBuffer(doc);
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating document:', error);
    throw error;
  }
};

// Export the download button component
export const DocxDownloadButton: React.FC<{
  content: string;
  title: string;
  children: React.ReactNode;
}> = ({ content, title, children }) => (
  <button
    onClick={() => generateDocx(content, title)}
    className="inline-flex items-center"
  >
    {children}
  </button>
);
