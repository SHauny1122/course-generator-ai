import { FaXTwitter } from 'react-icons/fa6';
import { SiOpenai } from 'react-icons/si';

const Footer = () => {
  return (
    <footer className="w-full bg-[#1E1E1E] border-t border-gray-800 py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center space-x-2 text-gray-400 text-sm">
          <span> {new Date().getFullYear()} Course Generator AI</span>
          <span className="hidden sm:inline">•</span>
          <a
            href="/privacy"
            className="hover:text-white transition-colors"
          >
            Privacy Policy
          </a>
        </div>
        
        <div className="flex items-center space-x-4 mt-4 sm:mt-0">
          <a
            href="https://x.com/poweroverthink"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Follow us on X (Twitter)"
          >
            <FaXTwitter className="w-5 h-5" />
          </a>
          
          <div className="flex items-center text-gray-400 text-sm">
            <SiOpenai className="w-4 h-4 mr-1" />
            <span>Powered by GPT-4</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
