import { LandingPageNavbar } from "@/components/LandingPageNavbar/LandingPageNavbar";
import { CheckCircle, Trophy, Users, Book, Lightning, Target, Lock } from "@phosphor-icons/react";
import "../SchoolTutoringLandingPage/school-about.css";

const SchoolAbout = () => {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, hsl(213 70% 16% / 0.03) 0%, white 30%, hsl(213 70% 16% / 0.03) 100%)' }}>
      <LandingPageNavbar baseRoute="/schooltutoringLandingPage" portalName="School Tutoring" />

      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-12 lg:py-20">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-3 sm:mb-4 lg:mb-6 animate-fade-in" style={{ background: 'linear-gradient(to right, hsl(213 70% 16%), hsl(213 70% 20%), hsl(213 70% 16%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            About Us
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8">
            EduConnect School Tutoring is dedicated to transforming academic outcomes through personalized, expert tuition.
            We connect students with qualified, verified tutors who are passionate about their success.
          </p>
          <div className="w-24 h-1 mx-auto rounded-full" style={{ background: 'linear-gradient(to right, hsl(213 70% 16%), hsl(213 70% 26%))' }}></div>
        </div>

        {/* What is EduConnect School Section */}
        <section className="mb-14 sm:mb-18 lg:mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Mission Card */}
            <div className="group perspective">
              <div className="relative bg-gradient-to-br from-transparent to-transparent border-2 border-blue-100/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 hover:border-blue-300 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-200/50 transform group-hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-11 sm:w-12 lg:w-14 h-11 sm:h-12 lg:h-14 rounded-lg sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg" style={{ background: 'linear-gradient(to bottom right, hsl(213 70% 16%), hsl(213 70% 26%))' }}>
                    <Target className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-display font-bold mb-2 sm:mb-3 lg:mb-4 text-slate-800">Our Mission</h2>
                  <p className="text-xs sm:text-sm lg:text-base text-slate-600 mb-4 sm:mb-5 lg:mb-6 leading-relaxed">
                    To provide accessible, high-quality tutoring that empowers students to excel academically.
                  </p>
                  <ul className="space-y-2 sm:space-y-2.5 lg:space-y-3">
                    {[
                      "Expert tutors who truly care",
                      "Thoroughly verified & DBS-checked",
                      "Online or in-home tutoring",
                      "Exam prep: GCSE, A-Level, Primary",
                      "Personalized learning plans",
                    ].map((point, idx) => (
                      <li key={idx} className="flex gap-2 sm:gap-2.5 lg:gap-3 text-slate-600">
                    <CheckCircle className="w-4 sm:w-4.5 lg:w-5 h-4 sm:h-4.5 lg:h-5 flex-shrink-0 mt-0.5" style={{ color: 'hsl(213 70% 16%)' }} />
                        <span className="text-[11px] sm:text-xs lg:text-sm leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Commitment Card */}
            <div className="group perspective">
              <div className="relative bg-gradient-to-br from-transparent to-transparent border-2 border-indigo-100/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 hover:border-indigo-300 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-200/50 transform group-hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/10 to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-11 sm:w-12 lg:w-14 h-11 sm:h-12 lg:h-14 rounded-lg sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg" style={{ background: 'linear-gradient(to bottom right, hsl(213 70% 16%), hsl(213 70% 26%))' }}>
                    <Lock className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-display font-bold mb-2 sm:mb-3 lg:mb-4 text-slate-800">Our Commitment to Excellence</h2>
                  <p className="text-xs sm:text-sm lg:text-base text-slate-600 mb-4 sm:mb-5 lg:mb-6 leading-relaxed">
                    Every student deserves access to excellent tutoring. We're built on principles of:
                  </p>
                  <ul className="space-y-2 sm:space-y-2.5 lg:space-y-3">
                    {[
                      "Quality - Top qualified tutors",
                      "Safety - Comprehensive DBS checks",
                      "Transparency - Verified profiles",
                      "Personalization - Custom learning",
                      "Success - Proven grade improvement",
                    ].map((point, idx) => (
                      <li key={idx} className="flex gap-2 sm:gap-2.5 lg:gap-3 text-slate-600">
                        <CheckCircle className="w-4 sm:w-4.5 lg:w-5 h-4 sm:h-4.5 lg:h-5 flex-shrink-0 mt-0.5" style={{ color: 'hsl(213 70% 16%)' }} />
                        <span className="text-[11px] sm:text-xs lg:text-sm leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tutor Qualifications Section */}
        <section className="mb-14 sm:mb-18 lg:mb-24">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold mb-2 sm:mb-3 lg:mb-4 text-slate-800">Our Highly Qualified Tutors</h2>
            <p className="text-xs sm:text-sm lg:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">Every tutor is thoroughly verified and certified to ensure excellence</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[
              { icon: Trophy, title: "Degree Qualified", desc: "University degrees in their subject", color: "from-blue-400 to-blue-600" },
              { icon: Lock, title: "DBS Checked", desc: "Enhanced security clearance", color: "from-indigo-400 to-indigo-600" },
              { icon: Book, title: "Exam Specialists", desc: "GCSE & A-Level experts", color: "from-cyan-400 to-cyan-600" },
              { icon: Lightning, title: "Proven Results", desc: "Track record of grade improvement", color: "from-sky-400 to-sky-600" },
            ].map((item, idx) => (
              <div key={idx} className="group perspective h-full">
                <div className="relative bg-white border-2 border-slate-100/60 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 hover:border-slate-300 transition-all duration-300 hover:shadow-xl transform group-hover:scale-105 h-full">
                  <div className={`w-9 sm:w-10 lg:w-12 h-9 sm:h-10 lg:h-12 rounded-lg sm:rounded-lg lg:rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-2 sm:mb-3 lg:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-4 sm:w-5 lg:w-6 h-4 sm:h-5 lg:h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-xs sm:text-sm lg:text-lg mb-1 sm:mb-1.5 lg:mb-2 text-slate-800">{item.title}</h3>
                  <p className="text-slate-600 text-[10px] sm:text-xs lg:text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tutor Verification Process */}
        <section className="mb-14 sm:mb-18 lg:mb-24">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold mb-8 sm:mb-10 lg:mb-12 text-center text-slate-800">Tutor Verification Process</h2>
          <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border-2 border-blue-200/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 xl:p-12">
            <div className="relative space-y-4 sm:space-y-5 lg:space-y-6">
              {[
                { step: 1, title: "Application Screening", desc: "Initial review of qualifications and experience" },
                { step: 2, title: "Degree Verification", desc: "Confirm university qualifications and credentials" },
                { step: 3, title: "DBS Check", desc: "Enhanced background and safeguarding check" },
                { step: 4, title: "Interview & Assessment", desc: "Teaching demonstration and tutor interview" },
                { step: 5, title: "Approval & Training", desc: "Platform training and approval to teach" },
              ].map((item) => (
                <div key={item.step} className="flex gap-3 sm:gap-4 lg:gap-6 group">
                  <div className="flex flex-col items-center">
                    <div className="w-8 sm:w-9 lg:w-10 h-8 sm:h-9 lg:h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {item.step}
                    </div>
                    {item.step < 5 && <div className="w-0.5 sm:w-1 h-10 sm:h-12 bg-gradient-to-b from-blue-200 to-indigo-200 mt-1 sm:mt-2\"></div>}
                  </div>
                  <div className="pb-4 sm:pb-6">
                    <h4 className="font-semibold text-slate-800 mb-0.5 sm:mb-1 text-xs sm:text-sm lg:text-base">{item.title}</h4>
                    <p className="text-slate-600 text-[10px] sm:text-xs lg:text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="mb-14 sm:mb-18 lg:mb-24">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold mb-8 sm:mb-10 lg:mb-12 text-center text-slate-800">Student Success Stories</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {[
              {
                name: "Emma Thompson",
                role: "GCSE Student",
                text: "My tutor helped me improve from a D to an A in Maths within 6 months. The personalized approach made all the difference!",
                rating: 5,
              },
              {
                name: "James Chen",
                role: "A-Level Physics",
                text: "Excellent tutor! Complex concepts became simple. My confidence has skyrocketed and my grades reflect that.",
                rating: 5,
              },
              {
                name: "Sophia Patel",
                role: "Parent",
                text: "The tutor has been amazing with my son. His understanding of maths has completely transformed. Highly recommended!",
                rating: 5,
              },
              {
                name: "Marcus Johnson",
                role: "Primary Student",
                text: "Tutoring is fun! I enjoy learning now. My mum says my reading has improved so much in just a few weeks.",
                rating: 5,
              },
            ].map((review, idx) => (
              <div key={idx} className="group perspective">
                <div className="relative bg-white border-2 border-blue-100/60 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 hover:border-blue-400 transition-all duration-300 hover:shadow-xl hover:shadow-blue-200/30 transform group-hover:-translate-y-1">
                  <div className="absolute -left-0.5 -top-0.5 w-10 sm:w-11 lg:w-12 h-10 sm:h-11 lg:h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-10"></div>
                  <div className="flex gap-1.5 sm:gap-2 mb-2 sm:mb-3 lg:mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <span key={i} className="text-amber-400 text-sm sm:text-base lg:text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-slate-700 italic mb-2 sm:mb-3 lg:mb-4 text-xs sm:text-sm lg:text-base leading-relaxed">"{review.text}"</p>
                  <div className="border-t border-slate-100 pt-2 sm:pt-3 lg:pt-4">
                    <p className="font-semibold text-slate-800 text-xs sm:text-sm lg:text-base">{review.name}</p>
                    <p className="text-[10px] sm:text-xs text-slate-500">{review.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Statistics Section */}
        <section className="mb-12 sm:mb-16 lg:mb-20">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold mb-8 sm:mb-10 lg:mb-12 text-center text-slate-800">By The Numbers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[
              { number: "5,000+", label: "Verified Tutors" },
              { number: "45,000+", label: "Active Students" },
              { number: "4.8★", label: "Average Rating" },
              { number: "89% Grade", label: "Improvement Rate" },
            ].map((stat, idx) => (
              <div key={idx} className="group perspective">
                <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200/60 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 text-center hover:border-blue-400 transition-all duration-300 hover:shadow-lg transform group-hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-300/5 to-transparent rounded-lg sm:rounded-xl lg:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ background: 'linear-gradient(to right, hsl(213 70% 16%), hsl(213 70% 20%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                      {stat.number}
                    </div>
                    <p className="text-[10px] sm:text-xs lg:text-sm text-slate-600 leading-relaxed">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default SchoolAbout;
