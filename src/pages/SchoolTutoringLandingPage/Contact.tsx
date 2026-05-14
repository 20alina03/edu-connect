import { LandingPageNavbar } from "@/components/LandingPageNavbar/LandingPageNavbar";
import { EnvelopeSimple, Phone, MapPin, Clock, PaperPlaneRight } from "@phosphor-icons/react";
import "../SchoolTutoringLandingPage/school-contact.css";

const SchoolContact = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50/30">
      <LandingPageNavbar baseRoute="/schooltutoringLandingPage" portalName="School Tutoring" />

      <div className="max-w-5xl mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Get In Touch
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Questions about our school tutoring services? We're here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-display font-bold mb-8 text-slate-800">Contact Info</h2>

            <div className="space-y-6">
              {[
                { icon: EnvelopeSimple, title: "Email", lines: ["support@educonnect.com", "school@educonnect.com"] },
                { icon: Phone, title: "Phone", lines: ["+44 (0) 203 XXX XXXX", "9 AM - 6 PM GMT"] },
                { icon: MapPin, title: "Location", lines: ["London, United Kingdom", "Support Nationwide"] },
                { icon: Clock, title: "Hours", lines: ["Mon-Fri: 9 AM - 6 PM GMT", "Weekend: Limited Support"] },
              ].map((item, idx) => (
                <div key={idx} className="group perspective">
                  <div className="relative flex gap-4 p-5 rounded-2xl bg-gradient-to-br from-white to-blue-50/30 border-2 border-blue-100/60 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-1">{item.title}</h3>
                      {item.lines.map((line, i) => (
                        <p key={i} className="text-sm text-slate-600">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Response Times Card */}
            <div className="mt-8 group perspective">
              <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200/60 rounded-2xl p-6 hover:border-blue-400 transition-all duration-300 hover:shadow-lg">
                <div className="absolute -top-3 -left-3 w-6 h-6 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full"></div>
                <h3 className="font-semibold text-slate-800 mb-4">Response Times</h3>
                <ul className="space-y-3 text-sm">
                  {[
                    { label: "Email Support", time: "24-48 hours" },
                    { label: "Technical Issues", time: "4 hours priority" },
                    { label: "Tutor Inquiries", time: "24 hours" },
                    { label: "General Questions", time: "48 hours" },
                  ].map((item, i) => (
                    <li key={i} className="flex justify-between items-center text-slate-600 hover:text-blue-600 transition-colors">
                      <span>{item.label}</span>
                      <span className="font-semibold text-blue-600">{item.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-display font-bold mb-8 text-slate-800">Send us a Message</h2>

            <form className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="group">
                  <label className="block text-sm font-semibold mb-2 text-slate-800">Full Name *</label>
                  <input
                    type="text"
                    className="w-full px-5 py-3 rounded-lg border-2 border-blue-100/60 bg-white hover:border-blue-300 focus:border-blue-500 focus:outline-none transition-all duration-300 text-slate-800 placeholder-slate-400"
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-semibold mb-2 text-slate-800">Email *</label>
                  <input
                    type="email"
                    className="w-full px-5 py-3 rounded-lg border-2 border-blue-100/60 bg-white hover:border-blue-300 focus:border-blue-500 focus:outline-none transition-all duration-300 text-slate-800 placeholder-slate-400"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold mb-2 text-slate-800">Subject *</label>
                <select className="w-full px-5 py-3 rounded-lg border-2 border-blue-100/60 bg-white hover:border-blue-300 focus:border-blue-500 focus:outline-none transition-all duration-300 text-slate-800 font-medium">
                  <option>-- Select a subject --</option>
                  <option>General Inquiry</option>
                  <option>Tutor Application</option>
                  <option>Technical Support</option>
                  <option>Student Enrollment</option>
                  <option>Partnership Opportunities</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="group">
                <label className="block text-sm font-semibold mb-2 text-slate-800">Message *</label>
                <textarea
                  rows={6}
                  className="w-full px-5 py-3 rounded-lg border-2 border-blue-100/60 bg-white hover:border-blue-300 focus:border-blue-500 focus:outline-none transition-all duration-300 text-slate-800 placeholder-slate-400 resize-none"
                  placeholder="Tell us how we can help you..."
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold text-lg hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                Send Message
                <PaperPlaneRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mb-20">
          <h2 className="text-3xl font-display font-bold mb-12 text-center text-slate-800">Frequently Asked Questions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { q: "How do I book a tutor?", a: "Sign up on our platform, browse available tutors, check their profiles and reviews, then book a trial lesson." },
              { q: "Are tutors DBS checked?", a: "Yes, all tutors undergo comprehensive DBS checks and background verification for your child's safety." },
              { q: "What payment methods do you accept?", a: "We accept all major credit cards, debit cards, and bank transfers with secure encryption." },
              { q: "Can I get a refund?", a: "Yes, 100% money-back guarantee within 7 days if unsatisfied with your first trial lesson." },
              { q: "How are lessons structured?", a: "Lessons are typically 1 hour but fully customizable. We tailor content to your child's needs." },
              { q: "Do you offer group classes?", a: "Currently one-on-one tutoring. Group classes may become available in the future." },
            ].map((item, idx) => (
              <div key={idx} className="group perspective">
                <div className="relative bg-white border-2 border-blue-100/60 rounded-2xl p-6 hover:border-blue-400 transition-all duration-300 hover:shadow-lg">
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-start gap-3">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white font-bold text-sm flex-shrink-0 mt-0.5">
                      ?
                    </span>
                    {item.q}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SchoolContact;