import { LandingPageNavbar } from "@/components/LandingPageNavbar/LandingPageNavbar";
import { CheckCircle, Trophy, Users, Book, Sparkle, Heart, Shield } from "@phosphor-icons/react";
import "../IslamicLandingPage/islamic-about.css";

const IslamicAbout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50/30">
      <LandingPageNavbar baseRoute="/islamiclandingpage" portalName="Islamic Learning" />

      <div className="max-w-5xl mx-auto px-4 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent animate-fade-in">
            About Us
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-8">
            EduConnect Islamic is a platform dedicated to making authentic Islamic education accessible to learners worldwide.
            We believe that learning the Quran and Islamic studies should be guided by qualified, verified teachers.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 mx-auto rounded-full"></div>
        </div>

        {/* What is EduConnect Islamic Section */}
        <section className="mb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Mission Card */}
            <div className="group perspective">
              <div className="relative bg-gradient-to-br from-white to-emerald-50/40 border-2 border-emerald-100/60 rounded-3xl p-8 hover:border-emerald-300 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-200/50 transform group-hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center mb-4 shadow-lg">
                    <Sparkle className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-display font-bold mb-4 text-slate-800">Our Mission</h2>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    To bridge sincere learners with authentic Islamic knowledge from qualified, Ijazah-certified teachers.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "Accessible to everyone, anywhere",
                      "Authentic Islamic credentials",
                      "Personalized learning paths",
                      "Safe, respectful environment",
                      "Confident practice of Islam",
                    ].map((point, idx) => (
                      <li key={idx} className="flex gap-3 text-slate-600">
                        <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Values Card */}
            <div className="group perspective">
              <div className="relative bg-gradient-to-br from-white to-teal-50/40 border-2 border-teal-100/60 rounded-3xl p-8 hover:border-teal-300 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-200/50 transform group-hover:-translate-y-2">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mb-4 shadow-lg">
                    <Heart className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-2xl font-display font-bold mb-4 text-slate-800">Islamic Foundation & Values</h2>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Built on solid Islamic principles from the Quran and Sunnah.
                  </p>
                  <ul className="space-y-3">
                    {[
                      "طلب العلم - Seeking knowledge",
                      "السند - Authenticity & verification",
                      "الإحسان - Excellence in teaching",
                      "الصبر - Patience & compassion",
                      "الأمة - Community support",
                    ].map((point, idx) => (
                      <li key={idx} className="flex gap-3 text-slate-600">
                    <CheckCircle className="w-5 h-5 text-teal-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Highly Qualified Teachers Section */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-slate-800">Our Highly Qualified Teachers</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Every teacher undergoes rigorous verification to ensure the highest standards</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Trophy, title: "Ijazah Certified", desc: "Authentic Quran recitation certification", color: "from-emerald-400 to-emerald-600" },
              { icon: CheckCircle, title: "Verified Credentials", desc: "Multiple source verification", color: "from-teal-400 to-teal-600" },
              { icon: Book, title: "Continuous Learning", desc: "Regular knowledge updates", color: "from-green-400 to-green-600" },
              { icon: Users, title: "Student-Centered", desc: "Personalized teaching approach", color: "from-cyan-400 to-cyan-600" },
            ].map((item, idx) => (
              <div key={idx} className="group perspective h-full">
                <div className="relative bg-white border-2 border-slate-100/60 rounded-2xl p-6 hover:border-slate-300 transition-all duration-300 hover:shadow-xl transform group-hover:scale-105 h-full">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-slate-800">{item.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Teacher Verification Process */}
        <section className="mb-24">
          <h2 className="text-3xl font-display font-bold mb-12 text-center text-slate-800">Teacher Verification Process</h2>
          <div className="bg-gradient-to-br from-emerald-50/50 to-teal-50/50 border-2 border-emerald-200/60 rounded-3xl p-8 md:p-12">
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
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                      {item.step}
                    </div>
                    {item.step < 5 && <div className="w-1 h-12 bg-gradient-to-b from-emerald-200 to-teal-200 mt-2"></div>}
                  </div>
                  <div className="pb-6">
                    <h4 className="font-semibold text-slate-800 mb-1">{item.title}</h4>
                    <p className="text-slate-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="mb-24">
          <h2 className="text-3xl font-display font-bold mb-12 text-center text-slate-800">Student Success Stories</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
        <section className="mb-20">
          <h2 className="text-3xl font-display font-bold mb-12 text-center text-slate-800">By The Numbers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { number: "800+", label: "Verified Quran Teachers" },
              { number: "12,000+", label: "Active Students" },
              { number: "4.9★", label: "Average Rating" },
              { number: "50+ Countries", label: "Global Reach" },
            ].map((stat, idx) => (
              <div key={idx} className="group perspective">
                <div className="relative bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200/60 rounded-2xl p-6 text-center hover:border-emerald-400 transition-all duration-300 hover:shadow-lg transform group-hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-300/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative">
                    <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                      {stat.number}
                    </div>
                    <p className="text-sm text-slate-600">{stat.label}</p>
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
