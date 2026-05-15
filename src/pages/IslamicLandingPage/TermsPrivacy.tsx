import { LandingPageNavbar } from "@/components/LandingPageNavbar/LandingPageNavbar";
import { Shield, Lock, Eye, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import "../IslamicLandingPage/islamic-terms.css";

const IslamicTermsPrivacy = () => {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, hsl(153 56% 11% / 0.03) 0%, white 30%, hsl(153 56% 11% / 0.03) 100%)' }}>
      <LandingPageNavbar baseRoute="/islamiclandingpage" portalName="Islamic Learning" />

      <div className="max-w-5xl mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6" style={{ background: 'linear-gradient(to right, hsl(153 56% 11%), hsl(153 55% 9%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Terms & Privacy
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Your trust is important to us. Learn how we protect and respect your data.
          </p>
        </div>

        {/* Quick Links Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
          {[
            { icon: Shield, title: "Terms of Service", color: "hsl(153 56% 11%)" },
            { icon: Lock, title: "Privacy Policy", color: "hsl(153 56% 15%)" },
            { icon: Eye, title: "GDPR Compliance", color: "hsl(153 56% 20%)" },
          ].map((item, idx) => (
            <a
              key={idx}
              href={`#${item.title.toLowerCase().replace(" ", "-")}`}
              className="group perspective"
            >
              <div className="relative bg-transparent rounded-2xl p-6 transition-all duration-300 hover:shadow-lg cursor-pointer" style={{ border: '2px solid hsl(153 56% 11% / 0.1)', transform: 'translate(0)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'hsl(153 56% 11% / 0.4)'; e.currentTarget.style.transform = 'translate(0, -8px)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'hsl(153 56% 11% / 0.1)'; e.currentTarget.style.transform = 'translate(0)'; }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg" style={{ background: `linear-gradient(to bottom right, ${item.color}, ${item.color})` }}>
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-slate-800">{item.title}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Terms of Service */}
        <section id="terms-of-service" className="mb-20">
          <div className="mb-12">
            <h2 className="text-3xl font-display font-bold mb-4 flex items-center gap-3 text-slate-800">
              <Shield className="w-8 h-8" style={{ color: 'hsl(153 56% 11%)' }} />
              Terms of Service
            </h2>
            <p className="text-slate-600 text-lg">Last updated: May 2026</p>
          </div>

          <div className="space-y-6">
            {[
              {
                num: 1,
                title: "Acceptance of Terms",
                content: "By accessing and using EduConnect Islamic, you accept and agree to be bound by these terms. If you do not agree, please do not use this service.",
              },
              {
                num: 2,
                title: "Use License",
                content: "You may temporarily download materials for personal, non-commercial viewing. You may not modify, copy, distribute, or use our materials for commercial purposes.",
              },
              {
                num: 3,
                title: "Disclaimer",
                content: "Materials are provided 'as is'. We make no warranties, expressed or implied, regarding merchantability, fitness, or non-infringement of rights.",
              },
              {
                num: 4,
                title: "Limitations of Liability",
                content: "EduConnect Islamic and its suppliers shall not be liable for any damages arising from your use or inability to use our services.",
              },
              {
                num: 5,
                title: "Accuracy of Materials",
                content: "We do not warrant that materials are accurate, complete, or current. Technical errors may exist.",
              },
              {
                num: 6,
                title: "Third-Party Links",
                content: "We are not responsible for third-party websites linked from our platform. Use them at your own risk.",
              },
              {
                num: 7,
                title: "Modifications",
                content: "We may revise these terms at any time. Continued use constitutes acceptance of updated terms.",
              },
              {
                num: 8,
                title: "Governing Law",
                content: "These terms are governed by laws of the United Kingdom. Disputes fall under exclusive jurisdiction of London courts.",
              },
            ].map((item) => (
              <div key={item.num} className="group perspective">
                <div className="relative bg-transparent border-2 border-emerald-100/60 rounded-2xl p-6 hover:border-emerald-400 transition-all duration-300 hover:shadow-lg">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg">
                      {item.num}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-slate-800 mb-2">{item.title}</h3>
                      <p className="text-slate-600 leading-relaxed">{item.content}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy Policy */}
        <section id="privacy-policy" className="mb-20">
          <div className="mb-12">
            <h2 className="text-3xl font-display font-bold mb-4 flex items-center gap-3 text-slate-800">
              <Lock className="w-8 h-8 text-teal-600" />
              Privacy Policy
            </h2>
            <p className="text-slate-600 text-lg">How we collect, use, and protect your information</p>
          </div>

          <div className="space-y-6">
            {[
              {
                title: "1. Information We Collect",
                items: [
                  "Name, email, and phone number",
                  "Payment information",
                  "Profile and learning preferences",
                  "Communication history",
                  "Device and usage data",
                ],
              },
              {
                title: "2. How We Use Your Information",
                items: [
                  "Provide and maintain our services",
                  "Process payments and transactions",
                  "Match you with appropriate teachers",
                  "Send updates and notifications",
                  "Respond to inquiries",
                  "Analyze usage patterns",
                  "Comply with legal obligations",
                ],
              },
              {
                title: "3. Data Security",
                items: [
                  "Technical encryption measures",
                  "Organizational safeguards",
                  "Secure payment processing",
                  "Regular security audits",
                  "Access controls and authentication",
                ],
              },
              {
                title: "4. Information Sharing",
                items: [
                  "Teachers matched with you",
                  "Payment processors",
                  "Legal authorities (when required)",
                  "Service providers assisting us",
                  "Never sold to third parties",
                ],
              },
              {
                title: "5. Your Data Rights",
                items: [
                  "Right to access your data",
                  "Right to correct information",
                  "Right to delete your data",
                  "Right to data portability",
                  "Requests processed within 30 days",
                ],
              },
            ].map((section, idx) => (
              <div key={idx} className="group perspective">
                <div className="relative bg-gradient-to-br from-white to-teal-50/30 border-2 border-teal-100/60 rounded-2xl p-6 hover:border-teal-400 transition-all duration-300 hover:shadow-lg">
                  <h3 className="font-semibold text-lg text-slate-800 mb-4 flex items-center gap-2">
                    <CheckCircle size={20} className="text-teal-600" />
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex gap-3 text-slate-600">
                        <span className="text-teal-500 font-bold">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* GDPR Compliance */}
        <section id="gdpr-compliance" className="mb-20">
          <div className="mb-12">
            <h2 className="text-3xl font-display font-bold mb-4 flex items-center gap-3 text-slate-800">
              <Eye className="w-8 h-8 text-green-600" />
              GDPR & Data Protection Compliance
            </h2>
          </div>

          <div className="relative bg-gradient-to-br from-green-50 to-emerald-50/30 border-2 border-green-200/60 rounded-3xl p-8 md:p-12">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-green-200 to-emerald-300 rounded-full opacity-20 blur-2xl"></div>
            <div className="relative">
              <p className="text-slate-600 mb-8 leading-relaxed">
                EduConnect Islamic is fully compliant with GDPR and international data protection regulations. Your privacy is our highest priority.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    icon: CheckCircle,
                    title: "Consent-Based Processing",
                    desc: "We only process data with your explicit consent",
                  },
                  {
                    icon: Lock,
                    title: "Data Access & Export",
                    desc: "You can access and export your data anytime",
                  },
                  {
                    icon: WarningCircle,
                    title: "Right to Deletion",
                    desc: "Request permanent deletion of your data",
                  },
                  {
                    icon: Shield,
                    title: "Data Transfer Security",
                    desc: "All transfers are encrypted and secure",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="group perspective">
                    <div className="bg-white border-2 border-green-100/60 rounded-xl p-5 hover:border-green-400 transition-all duration-300 hover:shadow-lg">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mb-3 shadow-lg">
                        <item.icon className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="font-semibold text-slate-800 mb-2">{item.title}</h4>
                      <p className="text-sm text-slate-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Last Updated Footer */}
        <div className="text-center py-8 border-t-2 border-emerald-200/40">
          <p className="text-slate-600 mb-2">Last Updated: May 2026</p>
          <p className="text-sm text-slate-500">These terms and policies may be updated. We'll notify you of material changes.</p>
        </div>
      </div>
    </div>
  );
};

export default IslamicTermsPrivacy;