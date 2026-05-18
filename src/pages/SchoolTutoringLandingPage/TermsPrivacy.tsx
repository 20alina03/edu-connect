import { LandingPageNavbar } from "@/components/LandingPageNavbar/LandingPageNavbar";
import { Shield, Lock, Eye, CheckCircle, WarningCircle } from "@phosphor-icons/react";
import "../SchoolTutoringLandingPage/school-terms.css";

const SchoolTermsPrivacy = () => {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, hsl(213 70% 16% / 0.03) 0%, white 30%, hsl(213 70% 16% / 0.03) 100%)' }}>
      <LandingPageNavbar baseRoute="/schooltutoringLandingPage" portalName="School Tutoring" />

      <div className="max-w-5xl mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6" style={{ background: 'linear-gradient(to right, hsl(213 70% 16%), hsl(213 70% 20%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Terms & Privacy
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Your trust and your child's safety are our highest priorities.
          </p>
        </div>

        {/* Quick Links Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
          {[
            { icon: Shield, title: "Terms of Service", color: "hsl(213 70% 16%)" },
            { icon: Lock, title: "Privacy Policy", color: "hsl(213 70% 20%)" },
            { icon: Eye, title: "GDPR Compliance", color: "hsl(213 70% 26%)" },
          ].map((item, idx) => (
            <a
              key={idx}
              href={`#${item.title.toLowerCase().replace(" ", "-")}`}
              className="group perspective"
            >
              <div className="relative bg-transparent rounded-2xl p-6 transition-all duration-300 hover:shadow-lg cursor-pointer" style={{ border: '2px solid hsl(213 70% 16% / 0.1)', transform: 'translate(0)' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'hsl(213 70% 16% / 0.4)'; e.currentTarget.style.transform = 'translate(0, -8px)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'hsl(213 70% 16% / 0.1)'; e.currentTarget.style.transform = 'translate(0)'; }}>
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
              <Shield className="w-8 h-8" style={{ color: 'hsl(213 70% 16%)' }} />
              Terms of Service
            </h2>
            <p className="text-slate-600 text-lg">Last updated: May 2026</p>
          </div>

          <div className="space-y-6">
            {[
              {
                num: 1,
                title: "Acceptance of Terms",
                content: "By using Ilmrise School Tutoring, you accept and agree to these terms. If you disagree, do not use this service.",
              },
              {
                num: 2,
                title: "Age & Parental Consent",
                content: "Students under 18 require parental/guardian consent. Parents are responsible for supervising sessions.",
              },
              {
                num: 3,
                title: "Use License",
                content: "You may use the service for personal, non-commercial purposes only. No reproduction, commercial use, or reverse engineering allowed.",
              },
              {
                num: 4,
                title: "Tutor Verification",
                content: "All tutors are DBS-verified. However, we cannot guarantee absolute accuracy of all background information.",
              },
              {
                num: 5,
                title: "Cancellation Policy",
                content: "Cancellations must be made 24 hours in advance. Late cancellations may incur charges.",
              },
              {
                num: 6,
                title: "Tutor-Student Agreements",
                content: "Tutor-student interactions must remain professional. Direct payments outside the platform are prohibited.",
              },
              {
                num: 7,
                title: "Modifications",
                content: "We may revise these terms at any time. Continued use constitutes acceptance of updated terms.",
              },
              {
                num: 8,
                title: "Governing Law",
                content: "These terms are governed by UK law. Disputes fall under exclusive jurisdiction of London courts.",
              },
            ].map((item) => (
              <div key={item.num} className="group perspective">
                <div className="relative bg-transparent border-2 border-blue-100/60 rounded-2xl p-6 hover:border-blue-400 transition-all duration-300 hover:shadow-lg">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
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
              <Lock className="w-8 h-8 text-indigo-600" />
              Privacy Policy
            </h2>
            <p className="text-slate-600 text-lg">How we collect, use, and protect your information</p>
          </div>

          <div className="space-y-6">
            {[
              {
                title: "1. Information We Collect",
                items: [
                  "Student/Parent name, email, phone",
                  "Payment information",
                  "Student age and learning level",
                  "Subject preferences",
                  "Device and usage data",
                ],
              },
              {
                title: "2. How We Use Your Information",
                items: [
                  "Match students with suitable tutors",
                  "Process payments securely",
                  "Send lesson updates and notifications",
                  "Improve our services",
                  "Comply with legal requirements",
                ],
              },
              {
                title: "3. Data Security",
                items: [
                  "Encrypted connections (SSL/TLS)",
                  "Secure payment processing",
                  "Regular security audits",
                  "Access controls and authentication",
                  "Data backup and recovery systems",
                ],
              },
              {
                title: "4. Information Sharing",
                items: [
                  "Tutors matched with your child",
                  "Payment processors only",
                  "Legal authorities when required",
                  "Service providers assisting us",
                  "Never sold to third parties",
                ],
              },
              {
                title: "5. Parental Controls & Rights",
                items: [
                  "Right to access your child's data",
                  "Right to request corrections",
                  "Right to delete account/data",
                  "Right to manage communications",
                  "Requests processed within 30 days",
                ],
              },
            ].map((section, idx) => (
              <div key={idx} className="group perspective">
                <div className="relative bg-gradient-to-br from-white to-indigo-50/30 border-2 border-indigo-100/60 rounded-2xl p-6 hover:border-indigo-400 transition-all duration-300 hover:shadow-lg">
                  <h3 className="font-semibold text-lg text-slate-800 mb-4 flex items-center gap-2">
                    <CheckCircle size={20} className="text-indigo-600" />
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex gap-3 text-slate-600">
                        <span className="text-indigo-500 font-bold">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Safeguarding & GDPR */}
        <section id="gdpr-compliance" className="mb-20">
          <div className="mb-12">
            <h2 className="text-3xl font-display font-bold mb-4 flex items-center gap-3 text-slate-800">
              <Eye className="w-8 h-8 text-cyan-600" />
              Safeguarding & GDPR Compliance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Safeguarding */}
            <div className="relative bg-gradient-to-br from-red-50 to-orange-50/30 border-2 border-red-200/60 rounded-3xl p-8">
              <h3 className="font-semibold text-lg text-slate-800 mb-6 flex items-center gap-2">
                <WarningCircle className="w-6 h-6 text-red-600" />
                Child Safeguarding
              </h3>
              <ul className="space-y-4">
                {[
                  "All tutors DBS-verified and checked",
                  "Regular safeguarding training required",
                  "Reporting procedures in place",
                  "Child protection policies",
                  "Secure, monitored lesson environment",
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-slate-600">
                    <CheckCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* GDPR */}
            <div className="relative bg-gradient-to-br from-cyan-50 to-blue-50/30 border-2 border-cyan-200/60 rounded-3xl p-8">
              <h3 className="font-semibold text-lg text-slate-800 mb-6 flex items-center gap-2">
                <Shield className="w-6 h-6 text-cyan-600" />
                GDPR Compliance
              </h3>
              <ul className="space-y-4">
                {[
                  "Consent-based data processing",
                  "Right to access your data",
                  "Right to data deletion",
                  "Data portability guarantee",
                  "Regular compliance audits",
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 text-slate-600">
                    <CheckCircle className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Last Updated Footer */}
        <div className="text-center py-8 border-t-2 border-blue-200/40">
          <p className="text-slate-600 mb-2">Last Updated: May 2026</p>
          <p className="text-sm text-slate-500">These terms and policies may be updated. We'll notify you of material changes.</p>
        </div>
      </div>
    </div>
  );
};

export default SchoolTermsPrivacy;