import { Document, Page, Text, View, StyleSheet, pdf, Font } from '@react-pdf/renderer';
import React from 'react';

// Register fonts
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf'
});

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Roboto',
  },
  section: {
    margin: 10,
    padding: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: '#000000',
  },
  heading: {
    fontSize: 18,
    marginTop: 15,
    marginBottom: 10,
    color: '#000000',
  },
  subheading: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 8,
    color: '#000000',
  },
  paragraph: {
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 10,
    color: '#000000',
  },
  listItem: {
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 5,
    marginLeft: 15,
    color: '#000000',
  }
});

const formatContent = (content: string): string => {
  // Replace common markdown patterns with plain text
  return content
    .replace(/#{1,6}\s+/g, '') // Remove heading markers
    .replace(/\*\*/g, '') // Remove bold markers
    .replace(/\*/g, '') // Remove italic markers
    .replace(/`/g, '') // Remove code markers
    .replace(/\n\s*\n/g, '\n\n') // Normalize line breaks
    .trim();
};

const splitIntoSections = (content: string): string[] => {
  return content.split(/\n{2,}/); // Split on double line breaks
};

// PDF Document component
const PDFDocument = ({ title, content }: { title: string, content: string }) => {
  const formattedContent = formatContent(content);
  const sections = splitIntoSections(formattedContent);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>{title}</Text>
          {sections.map((section, index) => {
            const lines = section.split('\n');
            return (
              <View key={index} style={styles.section}>
                {lines.map((line, lineIndex) => {
                  if (line.startsWith('•') || line.startsWith('-')) {
                    return (
                      <Text key={lineIndex} style={styles.listItem}>
                        {line.replace(/^[•-]\s*/, '• ')}
                      </Text>
                    );
                  }
                  if (line.length > 50) {
                    return (
                      <Text key={lineIndex} style={styles.paragraph}>
                        {line}
                      </Text>
                    );
                  }
                  if (line.length > 30) {
                    return (
                      <Text key={lineIndex} style={styles.subheading}>
                        {line}
                      </Text>
                    );
                  }
                  return (
                    <Text key={lineIndex} style={styles.heading}>
                      {line}
                    </Text>
                  );
                })}
              </View>
            );
          })}
        </View>
      </Page>
    </Document>
  );
};

export const generatePDF = async (content: string, title: string): Promise<void> => {
  try {
    const blob = await pdf(<PDFDocument title={title} content={content} />).toBlob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

// Export the PDFDownloadLink component for direct use in components
export const PDFDownloadButton: React.FC<{
  content: string;
  title: string;
  children: React.ReactNode;
}> = ({ content, title, children }) => (
  <button
    onClick={() => generatePDF(content, title)}
    className="inline-flex items-center"
  >
    {children}
  </button>
);
