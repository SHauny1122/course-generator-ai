const PrivacyPolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-300">
      <h1 className="text-4xl font-bold mb-8 text-white">Privacy Policy</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">Overview</h2>
        <p className="mb-4">
          Course Generator AI is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">Information We Collect</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Account information (email, name)</li>
          <li>Course generation data and preferences</li>
          <li>Usage statistics</li>
          <li>Payment information (processed securely through PayPal)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">How We Use Your Information</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>To provide and improve our course generation service</li>
          <li>To process your payments and manage your subscription</li>
          <li>To communicate with you about your account and updates</li>
          <li>To analyze usage patterns and improve our service</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">Data Security</h2>
        <p className="mb-4">
          We use industry-standard security measures to protect your data. Your content is stored securely, and we never share your personal information with third parties without your consent.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-white">Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us on{' '}
          <a 
            href="https://x.com/poweroverthink"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            X (Twitter)
          </a>.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
