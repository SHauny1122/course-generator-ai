import { Document, Page, Text, View, StyleSheet, PDFDownloadLink } from '@react-pdf/renderer';
import { convert } from 'html-to-text';

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  heading: {
    fontSize: 18,
    marginBottom: 10,
    marginTop: 15,
    fontWeight: 'bold',
  },
  subheading: {
    fontSize: 14,
    marginBottom: 5,
    color: '#666666',
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
    lineHeight: 1.5,
  },
  section: {
    marginBottom: 20,
  },
  question: {
    marginBottom: 15,
  },
  questionNumber: {
    fontWeight: 'bold',
    marginRight: 5,
  },
});

interface LessonPDFProps {
  title: string;
  module: string;
  content: string;
}

const LessonPDF = ({ title, module, content }: LessonPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subheading}>Module: {module}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.text}>
          {convert(content, {
            wordwrap: 130,
            preserveNewlines: true,
          })}
        </Text>
      </View>
    </Page>
  </Document>
);

interface QuizPDFProps {
  title: string;
  difficulty: string;
  questions: Array<{
    question: string;
    options?: string[];
    answer?: string;
  }>;
}

const QuizPDF = ({ title, difficulty, questions }: QuizPDFProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subheading}>Difficulty: {difficulty}</Text>
      </View>
      <View style={styles.section}>
        {questions.map((q, index) => (
          <View key={index} style={styles.question}>
            <Text style={styles.text}>
              <Text style={styles.questionNumber}>{index + 1}.</Text>
              {q.question}
            </Text>
            {q.options && (
              <View style={{ marginLeft: 20 }}>
                {q.options.map((option, optIndex) => (
                  <Text key={optIndex} style={styles.text}>
                    {String.fromCharCode(65 + optIndex)}. {option}
                  </Text>
                ))}
              </View>
            )}
            {q.answer && (
              <Text style={[styles.text, { marginTop: 5, fontWeight: 'bold' }]}>
                Answer: {q.answer}
              </Text>
            )}
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export const PDFDownloadButton = ({ 
  type, 
  data, 
  fileName 
}: { 
  type: 'lesson' | 'quiz';
  data: LessonPDFProps | QuizPDFProps;
  fileName: string;
}) => (
  <PDFDownloadLink
    document={
      type === 'lesson' 
        ? <LessonPDF {...(data as LessonPDFProps)} />
        : <QuizPDF {...(data as QuizPDFProps)} />
    }
    fileName={`${fileName}.pdf`}
    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
  >
    {({ loading }) => (loading ? 'Generating PDF...' : 'Download PDF')}
  </PDFDownloadLink>
);
