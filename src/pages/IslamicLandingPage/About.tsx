import { LandingPageNavbar } from "@/components/LandingPageNavbar/LandingPageNavbar";
import { CheckCircle, Trophy, Users, Book, Sparkle, Heart, Shield } from "@phosphor-icons/react";
import "../IslamicLandingPage/islamic-about.css";

const IslamicAbout = () => {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom, hsl(153 56% 11% / 0.03) 0%, white 30%, hsl(153 56% 11% / 0.03) 100%)' }}>
      <LandingPageNavbar baseRoute="/islamiclandingpage" portalName="Islamic Learning" />

      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-12 lg:py-20">
        {/* Hero Section */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-3 sm:mb-4 lg:mb-6 animate-fade-in" style={{ background: 'linear-gradient(to right, hsl(153 56% 11%), hsl(153 55% 9%), hsl(153 56% 11%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            About Us
          </h1>
          <p className="text-xs sm:text-sm lg:text-base text-slate-600 max-w-3xl mx-auto leading-relaxed mb-6 sm:mb-8">
            EduConnect Islamic is a platform dedicated to making authentic Islamic education accessible to learners worldwide.
            We believe that learning the Quran and Islamic studies should be guided by qualified, verified teachers.
          </p>
          <div className="w-24 h-1 mx-auto rounded-full" style={{ background: 'linear-gradient(to right, hsl(153 56% 11%), hsl(153 56% 20%))' }}></div>
        </div>

        {/* What is EduConnect Islamic Section */}
        <section className="mb-14 sm:mb-18 lg:mb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Mission Card */}
            <div className="group perspective">
              <div className="relative bg-gradient-to-br from-transparent to-transparent border-2 border-emerald-100/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 hover:border-emerald-300 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-200/50 transform group-hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-11 sm:w-12 lg:w-14 h-11 sm:h-12 lg:h-14 rounded-lg sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg" style={{ background: 'linear-gradient(to bottom right, hsl(153 56% 11%), hsl(153 56% 20%))' }}>
                    <Sparkle className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-display font-bold mb-2 sm:mb-3 lg:mb-4 text-slate-800">Our Mission</h2>
                  <p className="text-xs sm:text-sm lg:text-base text-slate-600 mb-4 sm:mb-5 lg:mb-6 leading-relaxed">
                    To bridge sincere learners with authentic Islamic knowledge from qualified, Ijazah-certified teachers.
                  </p>
                  <ul className="space-y-2 sm:space-y-2.5 lg:space-y-3">
                    {[
                      "Accessible to everyone, anywhere",
                      "Authentic Islamic credentials",
                      "Personalized learning paths",
                      "Safe, respectful environment",
                      "Confident practice of Islam",
                    ].map((point, idx) => (
                      <li key={idx} className="flex gap-2 sm:gap-2.5 lg:gap-3 text-slate-600">
                        <CheckCircle className="w-4 sm:w-4.5 lg:w-5 h-4 sm:h-4.5 lg:h-5 flex-shrink-0 mt-0.5" style={{ color: 'hsl(153 56% 11%)' }} />
                        <span className="text-[11px] sm:text-xs lg:text-sm leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Values Card */}
            <div className="group perspective">
              <div className="relative bg-gradient-to-br from-transparent to-transparent border-2 border-teal-100/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 hover:border-teal-300 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-200/50 transform group-hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400/10 to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-11 sm:w-12 lg:w-14 h-11 sm:h-12 lg:h-14 rounded-lg sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 shadow-lg" style={{ background: 'linear-gradient(to bottom right, hsl(153 56% 11%), hsl(153 56% 20%))' }}>
                    <Heart className="w-5 sm:w-6 lg:w-7 h-5 sm:h-6 lg:h-7 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-display font-bold mb-2 sm:mb-3 lg:mb-4 text-slate-800">Islamic Foundation & Values</h2>
                  <p className="text-xs sm:text-sm lg:text-base text-slate-600 mb-4 sm:mb-5 lg:mb-6 leading-relaxed">
                    Built on solid Islamic principles from the Quran and Sunnah.
                  </p>
                  <ul className="space-y-2 sm:space-y-2.5 lg:space-y-3">
                    {[
                      "طلب العلم - Seeking knowledge",
                      "السند - Authenticity & verification",
                      "الإحسان - Excellence in teaching",
                      "الصبر - Patience & compassion",
                      "الأمة - Community support",
                    ].map((point, idx) => (
                      <li key={idx} className="flex gap-2 sm:gap-2.5 lg:gap-3 text-slate-600">
                    <CheckCircle className="w-4 sm:w-4.5 lg:w-5 h-4 sm:h-4.5 lg:h-5 flex-shrink-0 mt-0.5" style={{ color: 'hsl(153 56% 11%)' }} />
                        <span className="text-[11px] sm:text-xs lg:text-sm leading-relaxed">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Highly Qualified Teachers Section */}
        <section className="mb-14 sm:mb-18 lg:mb-24">
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold mb-2 sm:mb-3 lg:mb-4 text-slate-800">Our Highly Qualified Teachers</h2>
            <p className="text-xs sm:text-sm lg:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">Every teacher undergoes rigorous verification to ensure the highest standards</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[
              { icon: Trophy, title: "Ijazah Certified", desc: "Authentic Quran recitation certification", color: "from-emerald-400 to-emerald-600" },
              { icon: CheckCircle, title: "Verified Credentials", desc: "Multiple source verification", color: "from-teal-400 to-teal-600" },
              { icon: Book, title: "Continuous Learning", desc: "Regular knowledge updates", color: "from-green-400 to-green-600" },
              { icon: Users, title: "Student-Centered", desc: "Personalized teaching approach", color: "from-cyan-400 to-cyan-600" },
            ].map((item, idx) => (
              <div key={idx} className="group perspective h-full">
                <div className="relative bg-transparent border-2 border-slate-100/60 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 hover:border-slate-300 transition-all duration-300 hover:shadow-xl transform group-hover:scale-105 h-full">
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

        {/* Teacher Verification Process */}
        <section className="mb-14 sm:mb-18 lg:mb-24">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold mb-8 sm:mb-10 lg:mb-12 text-center text-slate-800">Teacher Verification Process</h2>
          <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border-2 border-emerald-200/60 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 xl:p-12">
            <div className="relative space-y-6">
              {[
                { step: 1, title: "Application & Initial Review", desc: "Teachers submit credentials and experience" },
                { step: 2, title: "Islamic Credential Verification", desc: "Verify Ijazah with issuing institutions" },
                { step: 3, title: "Teaching Assessment", desc: "Teaching demonstration and evaluation" },
                { step: 4, title: "Background Check", desc: "Thorough background verification" },
                { step: 5, title: "Approval & Onboarding", desc: "Training program and platform onboarding" },
              ].map((item) => (
                <div key={item.step} className="flex gap-6 group">
                  <div className="flex flex-col items-center">
                    <div className="w-8 sm:w-9 lg:w-10 h-8 sm:h-9 lg:h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {item.step}
                    </div>
                    {item.step < 5 && <div className="w-0.5 sm:w-1 h-10 sm:h-12 bg-gradient-to-b from-emerald-200 to-teal-200 mt-1 sm:mt-2"></div>}
                  </div>
                  <div className="pb-4 sm:pb-6">
                    <h4 className="font-semibold text-slate-800 mb-0.5 sm:mb-1 text-xs sm:text-sm lg:text-base">{item.title}</h4>
                    <p className="text-slate-600 text-[11px] sm:text-xs lg:text-sm leading-relaxed">{item.desc}</p>
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
                name: "Aisha Muhammad",
                role: "Parent of 2 Students",
                text: "Alhamdulillah, both my children have made remarkable progress in Quran memorization. The teachers are incredibly patient and knowledgeable.",
                rating: 5,
              },
              {
                name: "Hassan Ali",
                role: "Quran Student",
                text: "Within 3 months, I can read the entire Quran with proper Tajweed. My teacher is amazing!",
                rating: 5,
              },
              {
                name: "Zainab Khan",
                role: "Parent",
                text: "My daughter is on track to memorize the entire Quran. The tracking system keeps her motivated and organized.",
                rating: 5,
              },
              {
                name: "Omar Ibrahim",
                role: "Islamic Studies Student",
                text: "Teachers make Islamic knowledge engaging and understandable. I'm truly understanding the Deen!",
                rating: 5,
              },
            ].map((review, idx) => (
              <div key={idx} className="group perspective">
                <div className="relative bg-white border-2 border-emerald-100/60 rounded-2xl p-6 hover:border-emerald-400 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-200/30 transform group-hover:-translate-y-1">
                  <div className="absolute -left-1 -top-1 w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full opacity-10"></div>
                  <div className="flex gap-3 mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <span key={i} className="text-amber-400 text-lg">★</span>
                    ))}
                  </div>
                  <p className="text-slate-700 italic mb-4 leading-relaxed">"{review.text}"</p>
                  <div className="border-t border-slate-100 pt-4">
                    <p className="font-semibold text-slate-800">{review.name}</p>
                    <p className="text-xs text-slate-500">{review.role}</p>
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
              { number: "800+", label: "Verified Quran Teachers" },
              { number: "12,000+", label: "Active Students" },
              { number: "4.9★", label: "Average Rating" },
              { number: "50+ Countries", label: "Global Reach" },
            ].map((stat, idx) => (
              <div key={idx} className="group perspective">
                <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200/60 rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-6 text-center hover:border-emerald-400 transition-all duration-300 hover:shadow-lg transform group-hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-300/5 to-transparent rounded-lg sm:rounded-xl lg:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold" style={{ background: 'linear-gradient(to right, hsl(153 56% 11%), hsl(153 55% 9%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
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

export default IslamicAbout;
