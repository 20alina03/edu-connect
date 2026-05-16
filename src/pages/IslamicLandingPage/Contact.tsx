import { LandingPageNavbar } from "@/components/LandingPageNavbar/LandingPageNavbar";
import { EnvelopeSimple, Phone, MapPin, Clock, PaperPlaneRight, ArrowRight } from "@phosphor-icons/react";
import "../IslamicLandingPage/islamic-contact.css";

const IslamicContact = () => {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, hsl(153 56% 11% / 0.03) 0%, white 30%, hsl(153 56% 11% / 0.03) 100%)' }}>
      <LandingPageNavbar baseRoute="/islamiclandingpage" portalName="Islamic Learning" />

      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-12 lg:py-20">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-3 sm:mb-4 lg:mb-6" style={{ background: 'linear-gradient(to right, hsl(153 56% 11%), hsl(153 55% 9%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            Get In Touch
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Have questions about our Islamic learning platform? We're here to help!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10 mb-14 sm:mb-18 lg:mb-20">
          {/* Contact Information */}
          <div>
            <h2 className="text-lg sm:text-xl lg:text-2xl font-display font-bold mb-6 sm:mb-8 text-slate-800">Contact Info</h2>

            <div className="space-y-4 sm:space-y-5 lg:space-y-6">
              {[
                { icon: EnvelopeSimple, title: "Email", lines: ["support@educonnect.com", "islamic@educonnect.com"] },
                { icon: Phone, title: "Phone", lines: ["+44 (0) 203 XXX XXXX", "9 AM - 6 PM GMT"] },
                { icon: MapPin, title: "Location", lines: ["London, United Kingdom", "Virtual Support Worldwide"] },
                { icon: Clock, title: "Hours", lines: ["Mon-Fri: 9 AM - 6 PM GMT", "Weekend: Limited Support"] },
              ].map((item, idx) => (
                <div key={idx} className="group perspective">
                  <div className="relative flex gap-2 sm:gap-3 lg:gap-4 p-3 sm:p-4 lg:p-5 rounded-lg sm:rounded-xl lg:rounded-2xl transition-all duration-300 hover:shadow-lg" style={{ background: 'linear-gradient(to bottom right, transparent, hsl(153 56% 11% / 0.03))', border: '2px solid hsl(153 56% 11% / 0.1)' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'hsl(153 56% 11% / 0.3)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'hsl(153 56% 11% / 0.1)'}>
                    <div className="w-9 sm:w-10 lg:w-12 h-9 sm:h-10 lg:h-12 rounded-lg sm:rounded-lg lg:rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg" style={{ background: 'linear-gradient(to bottom right, hsl(153 56% 11%), hsl(153 56% 20%))' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
                      <item.icon className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800 mb-0.5 sm:mb-1 text-xs sm:text-sm lg:text-base">{item.title}</h3>
                      {item.lines.map((line, i) => (
                        <p key={i} className="text-[10px] sm:text-xs lg:text-sm text-slate-600 leading-relaxed">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Response Times Card */}
            <div className="mt-6 sm:mt-8 group perspective">
              <div className="relative rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 transition-all duration-300 hover:shadow-lg" style={{ background: 'linear-gradient(to bottom right, hsl(153 56% 11% / 0.04), hsl(153 56% 11% / 0.02))', border: '2px solid hsl(153 56% 11% / 0.1)' }}>
                <div className="absolute -top-2 sm:-top-2.5 lg:-top-3 -left-2 sm:-left-2.5 lg:-left-3 w-5 sm:w-5 lg:w-6 h-5 sm:h-5 lg:h-6 rounded-full" style={{ background: 'linear-gradient(to bottom right, hsl(153 56% 11%), hsl(153 56% 20%))' }}></div>
                <h3 className="font-semibold text-slate-800 mb-2 sm:mb-3 lg:mb-4 text-xs sm:text-sm lg:text-base">Response Times</h3>
                <ul className="space-y-1.5 sm:space-y-2 lg:space-y-3 text-[10px] sm:text-xs lg:text-sm">
                  {[
                    { label: "Email Support", time: "24-48 hours" },
                    { label: "Technical Issues", time: "4 hours priority" },
                    { label: "Teacher Inquiries", time: "24 hours" },
                    { label: "General Questions", time: "48 hours" },
                  ].map((item, i) => (
                    <li key={i} className="flex justify-between items-center text-slate-600 transition-colors" onMouseEnter={(e) => e.currentTarget.style.color = 'hsl(153 56% 11%)'} onMouseLeave={(e) => e.currentTarget.style.color = 'hsl(0 0% 45%)'}> 
                      <span>{item.label}</span>
                      <span className="font-semibold" style={{ color: 'hsl(153 56% 11%)' }}>{item.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-display font-bold mb-6 sm:mb-8 text-slate-800">Send us a Message</h2>

            <form className="space-y-3 sm:space-y-4 lg:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-5">
                <div className="group">
                  <label className="block text-[10px] sm:text-xs lg:text-sm font-semibold mb-1.5 sm:mb-2 text-slate-800">Full Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 rounded-lg border-2 border-emerald-100/60 bg-white hover:border-emerald-300 focus:border-emerald-500 focus:outline-none transition-all duration-300 text-xs sm:text-sm lg:text-base text-slate-800 placeholder-slate-400"
                    placeholder="Your full name"
                    required
                  />
                </div>

                <div className="group">
                  <label className="block text-[10px] sm:text-xs lg:text-sm font-semibold mb-1.5 sm:mb-2 text-slate-800">Email *</label>
                  <input
                    type="email"
                    className="w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 rounded-lg border-2 border-emerald-100/60 bg-white hover:border-emerald-300 focus:border-emerald-500 focus:outline-none transition-all duration-300 text-xs sm:text-sm lg:text-base text-slate-800 placeholder-slate-400"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-[10px] sm:text-xs lg:text-sm font-semibold mb-1.5 sm:mb-2 text-slate-800">Subject *</label>
                <select className="w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 rounded-lg bg-white transition-all duration-300 text-xs sm:text-sm lg:text-base text-slate-800 font-medium" style={{ border: '2px solid hsl(153 56% 11% / 0.1)' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'hsl(153 56% 11% / 0.3)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'hsl(153 56% 11% / 0.1)'} onFocus={(e) => e.currentTarget.style.borderColor = 'hsl(153 56% 11% / 0.5)'} onBlur={(e) => e.currentTarget.style.borderColor = 'hsl(153 56% 11% / 0.1)'}>
                  <option>-- Select a subject --</option>
                  <option>General Inquiry</option>
                  <option>Teacher Application</option>
                  <option>Technical Support</option>
                  <option>Student Enrollment</option>
                  <option>Partnership Opportunities</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="group">
                <label className="block text-[10px] sm:text-xs lg:text-sm font-semibold mb-1.5 sm:mb-2 text-slate-800">Message *</label>
                <textarea
                  rows={6}
                  className="w-full px-3 sm:px-4 lg:px-5 py-2 sm:py-2.5 lg:py-3 rounded-lg bg-white transition-all duration-300 text-xs sm:text-sm lg:text-base text-slate-800 placeholder-slate-400 resize-none"
                  style={{ border: '2px solid hsl(153 56% 11% / 0.1)' }}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = 'hsl(153 56% 11% / 0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = 'hsl(153 56% 11% / 0.1)'}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'hsl(153 56% 11% / 0.5)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'hsl(153 56% 11% / 0.1)'}
                  placeholder="Tell us how we can help you..."
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full px-4 sm:px-6 py-2.5 sm:py-3 lg:py-4 rounded-lg text-white font-semibold text-xs sm:text-sm lg:text-base transition-all duration-300 flex items-center justify-center gap-2 group"
                style={{ background: 'linear-gradient(to right, hsl(153 56% 11%), hsl(153 56% 20%))' }}
              >
                Send Message
                <PaperPlaneRight size={16} className="sm:w-5 sm:h-5 lg:w-5 lg:h-5 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold mb-8 sm:mb-10 lg:mb-12 text-center text-slate-800">Frequently Asked Questions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {[
              { q: "How do I enroll as a student?", a: "Visit our signup page and complete the registration process. You can then browse teachers and book your first trial lesson." },
              { q: "How are teachers verified?", a: "All teachers undergo rigorous verification including credential checks, teaching assessments, and background verification." },
              { q: "What payment methods do you accept?", a: "We accept all major credit cards, debit cards, and bank transfers. All payments are secure and encrypted." },
              { q: "Can I get a refund?", a: "Yes, we offer a 100% refund guarantee within 7 days if you're not satisfied with your trial lesson." },
              { q: "How long are lessons?", a: "Lessons are typically 1 hour, but you can customize the duration based on your needs and teacher availability." },
              { q: "Do you offer group classes?", a: "Currently, we focus on one-on-one personalized tutoring. Group classes may be available in the future." },
            ].map((item, idx) => (
              <div key={idx} className="group perspective">
                <div className="relative bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 transition-all duration-300 hover:shadow-lg" style={{ border: '2px solid hsl(153 56% 11% / 0.1)' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'hsl(153 56% 11% / 0.4)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'hsl(153 56% 11% / 0.1)'}>
                  <h3 className="font-semibold text-slate-800 mb-2 sm:mb-2.5 lg:mb-3 flex items-start gap-2 sm:gap-2.5 lg:gap-3 text-xs sm:text-sm lg:text-base">
                    <span className="inline-flex items-center justify-center w-5 sm:w-5 lg:w-6 h-5 sm:h-5 lg:h-6 rounded-full text-white font-bold text-[10px] sm:text-xs lg:text-sm flex-shrink-0 mt-0.5" style={{ background: 'linear-gradient(to bottom right, hsl(153 56% 11%), hsl(153 56% 20%))' }}>
                      ?
                    </span>
                    {item.q}
                  </h3>
                  <p className="text-slate-600 text-[10px] sm:text-xs lg:text-sm leading-relaxed">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default IslamicContact;
