import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const SEO = ({ 
  title = 'Course Generator AI - Create Courses with GPT-4 | Free to Start',
  description = 'Generate professional courses, lessons, and quizzes instantly with GPT-4 AI. Start free, upgrade to Pro for unlimited content. Perfect for educators and creators.',
  image = '/og-image.png',
  url = 'https://coursegeneratorai.online'
}: SEOProps) => {
  useEffect(() => {
    // Update the document title
    document.title = title;

    // Update meta tags
    updateMetaTag('description', description);
    updateMetaTag('og:type', 'website');
    updateMetaTag('og:url', url);
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:url', url);
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('keywords', 'GPT-4 course generator, AI education, online course creator, quiz generator, lesson planner, education technology, AI teaching assistant, custom courses, free course generator');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');
    updateMetaTag('author', 'Course Generator AI');
    updateMetaTag('application-name', 'Course Generator AI');

    // Update canonical link
    let canonicalElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.rel = 'canonical';
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.href = url;
  }, [title, description, image, url]);

  return null;
};

function updateMetaTag(name: string, content: string) {
  let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement;
  if (!element) {
    element = document.createElement('meta');
    element.name = name;
    document.head.appendChild(element);
  }
  element.content = content;

  // Also update property meta tags for Open Graph
  if (name.startsWith('og:')) {
    let propertyElement = document.querySelector(`meta[property="${name}"]`) as HTMLMetaElement;
    if (!propertyElement) {
      propertyElement = document.createElement('meta');
      propertyElement.setAttribute('property', name);
      document.head.appendChild(propertyElement);
    }
    propertyElement.content = content;
  }
}

export default SEO;
