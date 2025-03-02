const CookiePolicy = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-300">
      <h1 className="text-4xl font-bold mb-8 text-white">Cookie Policy</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">What Are Cookies</h2>
        <p className="mb-4">
          Cookies are small text files that are placed on your device when you visit our website. 
          They help make websites work more efficiently and provide information to website owners.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">How We Use Cookies</h2>
        <p className="mb-4">We use cookies to:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Remember your login status</li>
          <li>Maintain your preferences</li>
          <li>Analyze how you use our service</li>
          <li>Improve our website and service</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">Types of Cookies We Use</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2 text-white">Essential Cookies</h3>
            <p>Required for the website to function. They enable basic features like page navigation and access to secure areas.</p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2 text-white">Authentication Cookies</h3>
            <p>Help us identify you when you log in, ensuring your data remains secure and private.</p>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-2 text-white">Analytics Cookies</h3>
            <p>Help us understand how you use our website, allowing us to improve functionality and user experience.</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">Third-Party Cookies</h2>
        <p className="mb-4">We use services from:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Vercel Analytics (usage tracking)</li>
          <li>PayPal (payment processing)</li>
          <li>Supabase (authentication)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-white">Managing Cookies</h2>
        <p className="mb-4">
          Most web browsers allow you to control cookies through their settings. You can:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>View cookies stored on your device</li>
          <li>Block or allow cookies</li>
          <li>Delete cookies</li>
          <li>Set cookie preferences for different websites</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4 text-white">Changes to Cookie Policy</h2>
        <p>
          We may update this Cookie Policy to reflect changes in our practices or for operational, 
          legal, or regulatory reasons. We encourage you to review this policy periodically.
        </p>
      </section>
    </div>
  );
};

export default CookiePolicy;
