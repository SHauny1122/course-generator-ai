export const exportToText = (content: string, title: string) => {
  try {
    if (!content || !title) {
      throw new Error('Content and title are required for export');
    }

    // Format the content
    const formattedContent = `${title}\n\n${content}`;
    
    // Create blob with the text content
    const blob = new Blob([formattedContent], { type: 'text/plain;charset=utf-8' });
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Safely format the filename
    const safeTitle = title.toString().replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.download = `${safeTitle}.txt`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting text:', error);
    throw error;
  }
};

// Export button component
export const TextExportButton: React.FC<{
  content: string;
  title: string;
  children: React.ReactNode;
}> = ({ content, title, children }) => (
  <button
    onClick={() => exportToText(content, title)}
    className="inline-flex items-center"
  >
    {children}
  </button>
);
