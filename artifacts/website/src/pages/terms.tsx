export default function TermsPage() {
  const sections = [
    { title: "1. Acceptance of Terms", content: "By accessing and using the Cargo platform, you accept and agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services." },
    { title: "2. Use of the Platform", content: "You may use Cargo only for lawful purposes and in accordance with these Terms. You agree not to:\n\n- Use the platform in any way that violates applicable laws or regulations\n- Engage in fraudulent activities or misrepresent your identity\n- Interfere with or disrupt the operation of our platform\n- Attempt to gain unauthorized access to any part of the platform\n- Post or transmit harmful, offensive, or inappropriate content" },
    { title: "3. Account Registration", content: "To access certain features, you must create an account. You are responsible for:\n\n- Maintaining the confidentiality of your account credentials\n- All activities that occur under your account\n- Providing accurate and complete information during registration\n- Notifying us immediately of any unauthorized use of your account" },
    { title: "4. Purchases and Payments", content: "When you make a purchase through Cargo:\n\n- You agree to pay all charges at the prices in effect at the time of purchase\n- Payment is processed securely by our payment partners\n- You represent that you have the legal right to use the payment method provided\n- All sales are subject to our Return and Refund Policy" },
    { title: "5. Merchant Responsibilities", content: "Merchants on the Cargo platform agree to:\n\n- Provide accurate product descriptions and pricing\n- Fulfill orders in a timely manner\n- Comply with all applicable laws and regulations\n- Maintain appropriate inventory levels\n- Handle customer inquiries professionally" },
    { title: "6. Intellectual Property", content: "All content on the Cargo platform, including text, graphics, logos, and software, is the property of Cargo or its content suppliers and is protected by intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission." },
    { title: "7. Limitation of Liability", content: "To the fullest extent permitted by law, Cargo shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the platform, even if we have been advised of the possibility of such damages." },
    { title: "8. Termination", content: "We reserve the right to terminate or suspend your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties." },
    { title: "9. Governing Law", content: "These Terms shall be governed by and construed in accordance with applicable law, without regard to conflict of law principles." },
    { title: "10. Changes to Terms", content: "We reserve the right to modify these Terms at any time. We will provide notice of significant changes. Your continued use of the platform after such changes constitutes your acceptance of the new Terms." },
    { title: "11. Contact", content: "For questions about these Terms, please contact us at legal@cargo.app." },
  ];

  return (
    <div>
      <section className="bg-gradient-to-br from-primary/5 to-purple-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-extrabold mb-3">Terms & Conditions</h1>
          <p className="text-muted-foreground">Last updated: January 1, 2025</p>
        </div>
      </section>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <p className="text-muted-foreground leading-relaxed">
          Please read these Terms and Conditions carefully before using the Cargo platform. By using our services, you agree to be bound by these terms.
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
