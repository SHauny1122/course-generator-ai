const TermsOfService = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-300">
      <h1 className="text-4xl font-bold mb-8 text-white">Terms of Service</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing and using Course Generator AI, you agree to be bound by these Terms of Service. 
          If you do not agree to these terms, please do not use our service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">2. Service Description</h2>
        <p className="mb-4">
          Course Generator AI provides AI-powered course generation services. We use GPT-4 technology 
          to help users create educational content, quizzes, and learning materials.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">3. User Accounts</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>You must provide accurate information when creating an account</li>
          <li>You are responsible for maintaining the security of your account</li>
          <li>You must not share your account credentials</li>
          <li>We reserve the right to terminate accounts that violate our terms</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">4. Subscription and Payments</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Subscription fees are billed in advance</li>
          <li>All payments are processed securely through PayPal</li>
          <li>Refunds are handled on a case-by-case basis</li>
          <li>We reserve the right to modify pricing with notice</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">5. Content Generation</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Generated content is for educational purposes only</li>
          <li>You retain ownership of your generated content</li>
          <li>You are responsible for reviewing and verifying generated content</li>
          <li>We do not guarantee the accuracy of AI-generated content</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">6. Prohibited Uses</h2>
        <p className="mb-4">You agree not to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Generate harmful or malicious content</li>
          <li>Violate intellectual property rights</li>
          <li>Attempt to reverse engineer our service</li>
          <li>Use the service for illegal purposes</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">7. Limitation of Liability</h2>
        <p className="mb-4">
          Course Generator AI is provided "as is" without warranties. We are not liable for 
          any damages arising from the use of our service.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-white">8. Changes to Terms</h2>
        <p className="mb-4">
          We reserve the right to modify these terms at any time. Continued use of the service 
          after changes constitutes acceptance of new terms.
        </p>
      </section>
    </div>
  );
};

export default TermsOfService;
