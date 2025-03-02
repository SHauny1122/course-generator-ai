import { FaXTwitter } from 'react-icons/fa6';
import { SiOpenai } from 'react-icons/si';

const Footer = () => {
  return (
    <footer className="w-full bg-[#1E1E1E] border-t border-gray-800 py-8">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center sm:space-x-4 text-gray-400 text-sm">
          <div className="flex items-center space-x-2">
            <span>{new Date().getFullYear()} Course Generator AI</span>
            <span className="hidden sm:inline">•</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:space-x-4">
            <a
              href="/privacy-policy"
              className="hover:text-white transition-colors hover:underline mt-2 sm:mt-0"
            >
              Privacy Policy
            </a>
            <span className="hidden sm:inline">•</span>
            <a
              href="/terms-of-service"
              className="hover:text-white transition-colors hover:underline mt-2 sm:mt-0"
            >
              Terms of Service
            </a>
            <span className="hidden sm:inline">•</span>
            <a
              href="/cookie-policy"
              className="hover:text-white transition-colors hover:underline mt-2 sm:mt-0"
            >
              Cookie Policy
            </a>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <a
            href="https://x.com/poweroverthink"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Follow us on X (Twitter)"
          >
            <FaXTwitter className="w-5 h-5" />
          </a>
          
          <div className="flex items-center text-gray-400">
            <SiOpenai className="w-4 h-4 mr-2" />
            <span className="text-sm">Powered by GPT-4</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
