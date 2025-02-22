import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const SEO = ({ 
  title = "Course Generator AI - Create Professional Courses with GPT-4",
  description = "Transform your expertise into professional courses instantly with our GPT-4 powered AI. Create engaging lessons and quizzes effortlessly. Start free today!",
  image = "https://www.coursegeneratorai.online/og-image.jpg",
  url = "https://www.coursegeneratorai.online"
}: SEOProps) => {
  
  useEffect(() => {
    // Update basic meta tags
    document.title = title;
    updateMetaTag('description', description);
    updateMetaTag('robots', 'index, follow');
    
    // Update Open Graph tags
    updateMetaTag('og:title', title);
    updateMetaTag('og:description', description);
    updateMetaTag('og:image', image);
    updateMetaTag('og:url', url);
    updateMetaTag('og:type', 'website');
    
    // Update Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', image);
    
    // Add canonical URL
    updateCanonicalTag(url);
    
    // Add keywords
    updateMetaTag('keywords', 'course generator, AI course creator, GPT-4 education, online course builder, lesson planner, quiz generator');
  }, [title, description, image, url]);
  
  return null;
};

const updateMetaTag = (name: string, content: string) => {
  let element = document.querySelector(`meta[name="${name}"]`) || 
                document.querySelector(`meta[property="${name}"]`);
  
  if (!element) {
    element = document.createElement('meta');
    if (name.startsWith('og:')) {
      element.setAttribute('property', name);
    } else {
      element.setAttribute('name', name);
    }
    document.head.appendChild(element);
  }
  
  element.setAttribute('content', content);
};

const updateCanonicalTag = (url: string) => {
  let canonical = document.querySelector('link[rel="canonical"]');
  
  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.appendChild(canonical);
  }
  
  canonical.setAttribute('href', url);
};

export default SEO;
