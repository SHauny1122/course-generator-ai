import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const SEO = ({ 
  title = 'Course Generator AI - Create Custom Courses Instantly',
  description = 'Generate custom courses, quizzes, and lessons instantly with AI. Perfect for educators, trainers, and content creators.',
  image = '/og-image.png', // We'll create this later
  url = 'https://coursegeneratorai.online'
}: SEOProps) => {
  return (
    <Helmet>
      {/* Basic meta tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="keywords" content="course generator, AI education, online learning, quiz maker, lesson planner, education technology, AI teaching assistant, custom courses" />
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEO;
