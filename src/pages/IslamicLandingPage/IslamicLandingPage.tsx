import { Link } from "react-router-dom";
import { Star, Users, CheckCircle, Medal, ChatCircle, Book, BookOpen, MusicNotes, Globe } from "@phosphor-icons/react";
import { LandingPageNavbar } from "@/components/LandingPageNavbar/LandingPageNavbar";
import "./islamic-landing.css";

const IslamicLandingPage = () => {
  const teachers = [
    {
      id: 1,
      name: "Ustadh Ahmed Al-Mansouri",
      specialty: "Quran Recitation & Tajweed",
      rating: 4.9,
      reviews: 327,
      image: "👨‍🏫",
      verified: true,
    },
    {
      id: 2,
      name: "Ustadha Fatima Al-Zahra",
      specialty: "Quran Memorization (Hifz)",
      rating: 4.95,
      reviews: 456,
      image: "👩‍🏫",
      verified: true,
    },
    {
      id: 3,
      name: "Ustadh Muhammad Hassan",
      specialty: "Arabic Language & Deen",
      rating: 4.88,
      reviews: 289,
      image: "👨‍🏫",
      verified: true,
    },
  ];

  const reviews = [
    {
      name: "Aisha Muhammad",
      role: "Parent",
      text: "Alhamdulillah, my son has improved tremendously in Quran recitation. The teachers are very patient and knowledgeable.",
      rating: 5,
    },
    {
      name: "Hassan Ali",
      role: "Student",
      text: "I started with zero Arabic knowledge and now I can read the Quran fluently. Best decision ever!",
      rating: 5,
    },
    {
      name: "Zainab Khan",
      role: "Parent",
      text: "My daughter is now in the Hifz program and making excellent progress. The structured approach really helps.",
      rating: 5,
    },
    {
      name: "Omar Ibrahim",
      role: "Student",
      text: "The teachers make learning Islam so engaging and easy to understand. Highly recommended!",
      rating: 5,
    },
  ];

  return (
    <div className="islamic-landing-page">
      <LandingPageNavbar baseRoute="/islamiclandingpage" portalName="Islamic Learning" />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="max-w-7xl mx-auto px-4 py-20 relative z-10">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-300/40 bg-emerald-50/60 mb-6">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700">Islamic Learning Portal</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-display font-extrabold mb-6 bg-gradient-to-r from-emerald-700 via-emerald-600 to-emerald-700 bg-clip-text text-transparent">
              Learn Quran & Islamic Studies
              <br />
              from Certified Scholars
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
              Master Quran recitation, Tajweed, Arabic language, and Islamic studies from home with qualified Ijazah-certified teachers.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold text-lg transition-all shadow-lg hover:shadow-emerald-500/30 hover:shadow-2xl"
            >
              Start Your Free Trial
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
            {[
              { number: "800+", label: "Certified Quran Teachers" },
              { number: "12,000+", label: "Active Students" },
              { number: "4.9★", label: "Average Rating" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/80 backdrop-blur-sm border border-emerald-200/60 rounded-2xl p-8 text-center hover:shadow-lg hover:border-emerald-300 transition-all">
                <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">{stat.number}</div>
                <div className="text-sm text-slate-600 mt-3 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <h2 className="text-4xl font-display font-bold text-center mb-4 text-slate-800">Our Learning Programs</h2>
          <p className="text-center text-slate-600 mb-16 max-w-2xl mx-auto">
            Comprehensive Islamic education from beginner to advanced levels, all with professional guidance
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Book,
                title: "Quran Reading",
                description: "From Noorani Qaida to fluent recitation with proper pronunciation",
              },
              {
                icon: MusicNotes,
                title: "Tajweed Rules",
                description: "Master Makharij and Sifaat with certified Tajweed experts",
              },
              {
                icon: BookOpen,
                title: "Hifz Program",
                description: "Guided memorization with revision tracking and support",
              },
              {
                icon: Globe,
                title: "Arabic Language",
                description: "Classical and modern Arabic for Quran understanding",
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-white rounded-2xl p-6 border-2 border-emerald-100/60 hover:border-emerald-300 transition-all group cursor-pointer">
                <div className="mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon size={40} className="text-emerald-600" weight="duotone" />
                </div>
                <h3 className="font-semibold text-lg text-slate-800 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-section">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <h2 className="text-4xl font-display font-bold text-center mb-16 text-slate-800">Why Choose EduConnect Islamic?</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                icon: Medal,
                title: "Ijazah Certified Teachers",
                description: "All teachers have Islamic qualifications and proper chain of authenticity",
              },
              {
                icon: CheckCircle,
                title: "Verified & Vetted",
                description: "Every teacher undergoes strict verification of credentials and background",
              },
              {
                icon: Users,
                title: "Personalized Learning",
                description: "One-on-one sessions tailored to your pace and learning goals",
              },
              {
                icon: BookOpen,
                title: "Comprehensive Curriculum",
                description: "Structured programs from absolute beginner to advanced scholar levels",
              },
            ].map((feature) => (
              <div key={feature.title} className="flex gap-4 bg-white/80 backdrop-blur-sm border-2 border-emerald-100/60 hover:border-emerald-300 rounded-2xl p-6 transition-all">
                <feature.icon size={28} weight="duotone" className="text-emerald-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-lg text-slate-800 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Teachers Section */}
      <section className="teachers-section">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <h2 className="text-4xl font-display font-bold text-center mb-4 text-slate-800">Highly Qualified Teachers</h2>
          <p className="text-center text-slate-600 mb-16 max-w-2xl mx-auto">
            Our teachers are carefully selected, verified, and carry authentic Islamic credentials
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="bg-white rounded-2xl p-6 border-2 border-emerald-100/60 hover:border-emerald-300 transition-all group overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                <div className="relative">
                  <div className="text-5xl mb-4">{teacher.image}</div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-slate-800">{teacher.name}</h3>
                      <p className="text-sm text-slate-600">{teacher.specialty}</p>
                    </div>
                    {teacher.verified && <CheckCircle size={20} weight="fill" className="text-emerald-600" />}
                  </div>
                  <div className="flex items-center gap-2 mt-4 mb-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className="text-sm font-semibold text-slate-800">{teacher.rating}</span>
                    <span className="text-sm text-slate-600">({teacher.reviews})</span>
                  </div>
                  <button className="w-full px-4 py-2 rounded-lg border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 transition font-medium text-sm">
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/islamic/teachers"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition font-medium"
            >
              Browse All Teachers
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="reviews-section">
        <div className="max-w-7xl mx-auto px-4 py-20">
          <h2 className="text-4xl font-display font-bold text-center mb-4 text-slate-800">What Our Students Say</h2>
          <p className="text-center text-slate-600 mb-16 max-w-2xl mx-auto">
            Hear from students and parents who have benefited from our Islamic education platform
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 border-2 border-emerald-100/60 hover:border-emerald-300 transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-semibold text-sm">
                    {review.name[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800">{review.name}</h4>
                    <p className="text-xs text-slate-600">{review.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-slate-700 italic leading-relaxed">"{review.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <h2 className="text-4xl font-display font-bold mb-4">
            Ready to Start Your Islamic Learning Journey?
          </h2>
          <p className="text-lg mb-8 text-white/90">
            Join thousands of students learning Quran and Islamic studies with certified teachers
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 font-semibold text-lg transition-all shadow-lg hover:shadow-2xl"
          >
            Sign Up Now - First Session Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-600">&copy; 2026 EduConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default IslamicLandingPage;
