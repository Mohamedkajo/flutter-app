export default function PrivacyPage() {
  const sections = [
    { title: "1. Information We Collect", content: `We collect information you provide directly to us, such as when you create an account, place an order, or contact us for support. This may include:\n\n- Name, email address, and password\n- Billing and shipping addresses\n- Payment information (processed securely by our payment partners)\n- Phone number\n- Order history and preferences\n- Device information and usage data (IP address, browser type, pages visited)` },
    { title: "2. How We Use Your Information", content: `We use the information we collect to:\n\n- Process and fulfill your orders\n- Communicate with you about orders, promotions, and support\n- Personalize your experience on our platform\n- Improve our services and develop new features\n- Detect, prevent, and address fraud and security issues\n- Comply with legal obligations` },
    { title: "3. Information Sharing", content: `We do not sell your personal information. We may share your information with:\n\n- Merchant partners to fulfill your orders\n- Delivery partners to ship your purchases\n- Payment processors to handle transactions\n- Service providers who help us operate our platform\n- Law enforcement when required by law` },
    { title: "4. Data Security", content: `We implement industry-standard security measures to protect your personal information, including encryption in transit and at rest, access controls, and regular security audits. However, no method of transmission over the internet is 100% secure.` },
    { title: "5. Cookies", content: `We use cookies and similar tracking technologies to enhance your experience. You can control cookies through your browser settings. Some features of our platform may not function properly if cookies are disabled.` },
    { title: "6. Your Rights", content: `You have the right to:\n\n- Access the personal information we hold about you\n- Request correction of inaccurate data\n- Request deletion of your account and associated data\n- Opt out of marketing communications\n- Data portability\n\nTo exercise these rights, contact us at privacy@cargo.app.` },
    { title: "7. Children's Privacy", content: `Our services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13.` },
    { title: "8. Changes to This Policy", content: `We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the effective date.` },
    { title: "9. Contact Us", content: `If you have questions about this Privacy Policy, please contact us at:\n\nEmail: privacy@cargo.app\nAddress: 123 Commerce St, Tech City, TC 00000` },
  ];

  return (
    <div>
      <section className="bg-gradient-to-br from-primary/5 to-purple-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: January 1, 2025</p>
        </div>
      </section>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        <p className="text-muted-foreground leading-relaxed">
          At Cargo, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
        </p>
        {sections.map(s => (
          <div key={s.title} className="border rounded-2xl p-6 bg-white">
            <h2 className="font-bold text-lg mb-3">{s.title}</h2>
            <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{s.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
