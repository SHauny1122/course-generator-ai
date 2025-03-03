import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const SEO = ({ 
  title = "AI Mini Course Generator - Create Professional Courses Quickly",
  description = "Transform your expertise into engaging mini-courses in minutes. Quick course generator with smart AI technology. Create teachable content effortlessly. Start free today!",
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
    updateMetaTag('keywords', 'AI mini course generator, teachable AI course creator, quick course generator, professional mini courses, course builder, mini course creator, online course maker, teachable content creator, quick lesson planner, interactive course builder, AI teaching assistant, course creation tool, educational content generator, instant course creator, rapid course development, smart content generator, mini course platform, course automation tool, knowledge sharing platform, interactive learning system');
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
