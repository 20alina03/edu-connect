import { Link } from "react-router-dom";
import { Star, Users, CheckCircle, Medal, Book, BookOpen, MusicNotes, Globe } from "@phosphor-icons/react";
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
       badge: "Top rated",
    },
    {
      id: 2,
      name: "Ustadha Fatima Al-Zahra",
      specialty: "Quran Memorization (Hifz)",
      rating: 4.95,
      reviews: 456,
      image: "👩‍🏫",
      verified: true,
       badge: "Top rated",
    },
    {
      id: 3,
      name: "Ustadh Muhammad Hassan",
      specialty: "Arabic Language & Deen",
      rating: 4.88,
      reviews: 289,
      image: "👨‍🏫",
      verified: true,
       badge: "Degree Verified",
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

  const handleFeatureMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    target.style.borderColor = "hsl(153 56% 11% / 0.35)";
    target.style.transform = "translateY(-4px) scale(1.02)";
    target.style.boxShadow = "0 20px 40px hsl(153 56% 11% / 0.15), 0 0 0 1px hsl(153 56% 11% / 0.08)";
    const iconEl = target.querySelector(".feature-icon") as HTMLElement | null;
    if (iconEl) iconEl.style.transform = "scale(1.15) translateY(-2px)";
  };

  const handleFeatureMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    target.style.borderColor = "hsl(153 56% 11% / 0.12)";
    target.style.transform = "translateY(0) scale(1)";
    target.style.boxShadow = "0 4px 16px hsl(153 56% 11% / 0.06)";
    const iconEl = target.querySelector(".feature-icon") as HTMLElement | null;
    if (iconEl) iconEl.style.transform = "scale(1) translateY(0)";
  };

  const handleWhyMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    target.style.borderColor = "hsl(153 56% 11% / 0.35)";
    target.style.transform = "translateY(-3px)";
    target.style.boxShadow = "0 16px 32px hsl(153 56% 11% / 0.12)";
  };

  const handleWhyMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    target.style.borderColor = "hsl(153 56% 11% / 0.12)";
    target.style.transform = "translateY(0)";
    target.style.boxShadow = "0 4px 16px hsl(153 56% 11% / 0.06)";
  };

  const handleTeacherMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    target.style.borderColor = "hsl(153 56% 11% / 0.4)";
    target.style.boxShadow = "0 24px 48px hsl(153 56% 11% / 0.18), 0 8px 16px hsl(153 56% 11% / 0.1)";
    target.style.transform = "translateY(-6px)";
  };

  const handleTeacherMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    target.style.borderColor = "hsl(153 56% 11% / 0.12)";
    target.style.boxShadow = "0 4px 16px hsl(153 56% 11% / 0.06)";
    target.style.transform = "translateY(0)";
  };

  return (
    <div className="islamic-landing-page">
      {/* Fixed Islamic star lattice background — rendered as div, not ::before */}
      <div className="islamic-star-lattice" />

      <LandingPageNavbar baseRoute="/islamiclandingpage" portalName="Islamic Learning" />

      {/* ─── HERO SECTION ─── */}
      <section className="hero-section">
        {/* Islamic floating symbols — explicit JSX, cannot be overridden by global CSS */}

        {/* ﷽ Bismillah — top left, LARGE glowing */}
        <div className="isl-sym isl-hero-bismillah">﷽</div>

        {/* مَدٌّ Madd (Tajweed elongation) — left middle */}
        <div className="isl-sym isl-hero-madd">مَدٌّ</div>

        {/* ٱقۡرَأۡ Iqra — first Quranic word — top right */}
        <div className="isl-sym isl-hero-iqra">ٱقۡرَأۡ</div>

        {/* ﷲ Allah — bottom right, LARGE bobbing */}
        <div className="isl-sym isl-hero-allah">ﷲ</div>

        {/* غُنَّة Ghunnah (Tajweed nasalization) — center left */}
        <div className="isl-sym isl-hero-ghunnah">غُنَّة</div>

        {/* رَحِيم Raheem (Most Merciful) — bottom center, LARGE */}
        <div className="isl-sym isl-hero-raheem">رَحِيم</div>

        {/* نُور Noor (Light) — top center, drifting */}
        <div className="isl-sym isl-hero-noor">نُور</div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-12 sm:py-16 lg:py-20 relative z-10">
          <div className="text-center">
            <div
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-[10px]"
              style={{
                border: "1px solid hsl(153 56% 11% / 0.2)",
                backgroundColor: "hsl(153 56% 11% / 0.08)",
                transform: "none",
                transition: "none",
                animation: "none",
              }}
            >
              <BookOpen className="w-3.5 sm:w-4 h-3.5 sm:h-4" style={{ color: "hsl(153 56% 11%)" }} />
              <span className="font-medium" style={{ color: "hsl(153 56% 11%)" }}>
                Islamic Learning Portal
              </span>
            </div>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-extrabold mb-4 sm:mb-5 lg:mb-6 hero-title mt-3 sm:mt-4"
              style={{
                background:
                  "linear-gradient(to right, hsl(153 56% 11%), hsl(153 55% 9%), hsl(153 56% 11%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Learn Quran & Islamic Studies
              <br />
              from Certified Scholars
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-slate-600 max-w-2xl mx-auto mb-6 sm:mb-7 lg:mb-8 leading-relaxed">
              Master Quran recitation, Tajweed, Arabic language, and Islamic studies from home with
              qualified Ijazah-certified teachers.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-4 rounded-lg sm:rounded-xl text-white font-semibold text-sm sm:text-base lg:text-lg transition-all shadow-lg cta-button"
              style={{
                background:
                  "linear-gradient(135deg, hsl(153 56% 11%), hsl(153 56% 18%))",
                boxShadow:
                  "0 4px 15px hsl(153 56% 11% / 0.3), 0 1px 3px hsl(153 56% 11% / 0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 8px 30px hsl(153 56% 11% / 0.45), 0 4px 12px hsl(153 56% 11% / 0.25), inset 0 1px 0 rgba(255,255,255,0.15)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 4px 15px hsl(153 56% 11% / 0.3), 0 1px 3px hsl(153 56% 11% / 0.2), inset 0 1px 0 rgba(255,255,255,0.1)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Start Your Free Trial
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mt-10 sm:mt-14 lg:mt-20">
            {[
              { number: "800+", label: "Certified Quran Teachers" },
              { number: "12,000+", label: "Active Students" },
              { number: "4.9★", label: "Average Rating" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="stat-card backdrop-blur-sm rounded-lg sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-center transition-all"
                style={{
                  border: "1px solid hsl(153 56% 11% / 0.12)",
                  background:
                    "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.75))",
                  boxShadow:
                    "0 8px 32px hsl(153 56% 11% / 0.08), 0 2px 8px hsl(153 56% 11% / 0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
                }}
              >
                <div
                  className="text-2xl sm:text-3xl lg:text-4xl font-bold"
                  style={{
                    background:
                      "linear-gradient(to right, hsl(153 56% 11%), hsl(153 56% 18%))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {stat.number}
                </div>
                <div className="text-xs sm:text-sm lg:text-base text-slate-600 mt-2 sm:mt-3 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section className="features-section relative overflow-hidden">

        {/* تَجۡوِيد Tajweed — top right, LARGE */}
        <div className="isl-sym isl-feat-tajweed">تَجۡوِيد</div>

        {/* حِفۡظ Hifz (Memorization) — bottom left */}
        <div className="isl-sym isl-feat-hifz">حِفۡظ</div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-12 sm:py-16 lg:py-20 relative z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-center mb-2 sm:mb-3 lg:mb-4 text-slate-800">
            Our Learning Programs
          </h2>
          <p className="text-center text-xs sm:text-sm lg:text-base text-slate-600 mb-10 sm:mb-12 lg:mb-16 max-w-2xl mx-auto">
            Comprehensive Islamic education from beginner to advanced levels, all with professional
            guidance
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            {[
              {
                icon: Book,
                title: "Quran Reading",
                description:
                  "From Noorani Qaida to fluent recitation with proper pronunciation",
              },
              {
                icon: MusicNotes,
                title: "Tajweed Rules",
                description:
                  "Master Makharij and Sifaat with certified Tajweed experts",
              },
              {
                icon: BookOpen,
                title: "Hifz Program",
                description:
                  "Guided memorization with revision tracking and support",
              },
              {
                icon: Globe,
                title: "Arabic Language",
                description:
                  "Classical and modern Arabic for Quran understanding",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="feature-card rounded-lg sm:rounded-2xl p-4 sm:p-5 lg:p-6 cursor-pointer"
                style={{
                  border: "2px solid hsl(153 56% 11% / 0.12)",
                  background: "transparent",
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  boxShadow: "0 4px 16px hsl(153 56% 11% / 0.06)",
                }}
                onMouseEnter={handleFeatureMouseEnter}
                onMouseLeave={handleFeatureMouseLeave}
              >
                <div
                  className="feature-icon mb-3 sm:mb-4"
                  style={{ transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
                >
                  <feature.icon
                    size={32}
                    className="sm:w-10 sm:h-10"
                    style={{ color: "hsl(153 56% 11%)" }}
                    weight="duotone"
                  />
                </div>
                <h3 className="font-semibold text-base sm:text-lg lg:text-xl text-slate-800 mb-1 sm:mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm lg:text-base text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY CHOOSE US SECTION ─── */}
      <section className="why-section relative overflow-hidden">

        {/* إِجَازَة Ijazah (Certification) — left, LARGE */}
        <div className="isl-sym isl-why-ijazah">إِجَازَة</div>

        {/* عِلۡم Ilm (Knowledge) — top right */}
        <div className="isl-sym isl-why-ilm">عِلۡم</div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-12 sm:py-16 lg:py-20 relative z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-center mb-10 sm:mb-12 lg:mb-16 text-slate-800">
            Why Choose Ilmrise Islamic?
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-7 lg:gap-8">
            {[
              {
                icon: Medal,
                title: "Ijazah Certified Teachers",
                description:
                  "All teachers have Islamic qualifications and proper chain of authenticity",
              },
              {
                icon: CheckCircle,
                title: "Verified & Vetted",
                description:
                  "Every teacher undergoes strict verification of credentials and background",
              },
              {
                icon: Users,
                title: "Personalized Learning",
                description:
                  "One-on-one sessions tailored to your pace and learning goals",
              },
              {
                icon: BookOpen,
                title: "Comprehensive Curriculum",
                description:
                  "Structured programs from absolute beginner to advanced scholar levels",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="why-card flex gap-4 rounded-2xl p-6"
                style={{
                  background: "white",
                  border: "1px solid hsl(153 56% 11% / 0.1)",
                  transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  boxShadow: "0 4px 16px hsl(153 56% 11% / 0.06)",
                }}
                onMouseEnter={handleWhyMouseEnter}
                onMouseLeave={handleWhyMouseLeave}
              >
                <feature.icon
                  size={28}
                  weight="duotone"
                  style={{
                    color: "hsl(153 56% 11%)",
                    flexShrink: 0,
                    marginTop: "0.25rem",
                  }}
                />
                <div>
                  <h3 className="font-semibold text-lg text-slate-800 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TOP TEACHERS SECTION ─── */}
      <section className="teachers-section relative overflow-hidden">

        {/* مُعَلِّم Mu'allim (Teacher) — top right, LARGE */}
        <div className="isl-sym isl-teach-mualim">مُعَلِّم</div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-12 sm:py-16 lg:py-20 relative z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-center mb-2 sm:mb-3 lg:mb-4 text-slate-800">
            Highly Qualified Teachers
          </h2>

          <p className="text-center text-xs sm:text-sm lg:text-base text-slate-600 mb-10 sm:mb-12 lg:mb-16 max-w-2xl mx-auto">
            Our teachers are carefully selected, verified, and carry authentic Islamic credentials
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 place-items-center">
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                className="teacher-card bg-white rounded-lg sm:rounded-xl lg:rounded-2xl p-3 sm:p-4 lg:p-5 overflow-hidden relative w-full max-w-[280px] sm:max-w-[300px]"
                style={{
                  border: "2px solid hsl(153 56% 11% / 0.12)",
                  transition: "all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  boxShadow: "0 4px 16px hsl(153 56% 11% / 0.06)",
                }}
                onMouseEnter={handleTeacherMouseEnter}
                onMouseLeave={handleTeacherMouseLeave}
              >
                <div
                  className="absolute inset-0 pointer-events-none teacher-card-glow"
                  style={{
                    background:
                      "linear-gradient(135deg, hsl(153 56% 11% / 0.04), transparent 60%)",
                  }}
                />

                <div className="relative">
                  {/* Teacher Image + Verification */}
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="text-3xl sm:text-4xl lg:text-5xl">{teacher.image}</div>

                    {teacher.verified && (
                      <CheckCircle
                        size={18}
                        className="sm:w-5 sm:h-5"
                        weight="fill"
                        style={{ color: "hsl(153 56% 11%)" }}
                      />
                    )}
                  </div>

                  {/* Teacher Info */}
                  <div className="mb-3 sm:mb-4">
                    <h3 className="font-semibold text-base sm:text-lg lg:text-xl text-slate-800 mb-0.5 sm:mb-1">
                      {teacher.name}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {teacher.specialty}
                    </p>
                  </div>

                  {/* Badge */}
                  <div className="mb-5">
                    <span className="inline-flex items-center px-4 py-1 rounded-full text-sm font-medium bg-slate-200 text-slate-800">
                      {teacher.badge}
                    </span>
                  </div>

                  {/* Ratings */}
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>

                    <span className="text-sm font-semibold text-slate-800">
                      {teacher.rating}
                    </span>

                    <span className="text-sm text-slate-600">
                      ({teacher.reviews})
                    </span>
                  </div>

                  {/* Button */}
                  <button
                    className="w-full px-4 py-3 rounded-xl font-medium text-sm"
                    style={{
                      border: "2px solid hsl(153 56% 11%)",
                      color: "hsl(153 56% 11%)",
                      backgroundColor: "transparent",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "hsl(153 56% 11%)";
                      e.currentTarget.style.color = "white";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "hsl(153 56% 11%)";
                    }}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Browse Button */}
        <div className="text-center mt-14 pb-10 relative z-10">
          <Link
            to="/islamic/teachers"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium"
            style={{
              border: "2px solid hsl(153 56% 11%)",
              color: "hsl(153 56% 11%)",
              backgroundColor: "transparent",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "hsl(153 56% 11%)";
              e.currentTarget.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "hsl(153 56% 11%)";
            }}
          >
            Browse All Teachers
          </Link>
        </div>
      </section>

      {/* ─── REVIEWS SECTION ─── */}
      <section className="reviews-section">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-12 sm:py-16 lg:py-20">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-center mb-2 sm:mb-3 lg:mb-4 text-slate-800">
            What Our Students Say
          </h2>
          <p className="text-center text-xs sm:text-sm lg:text-base text-slate-600 mb-10 sm:mb-12 lg:mb-16 max-w-2xl mx-auto">
            Hear from students and parents who have benefited from our Islamic education platform
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
            {reviews.map((review, idx) => (
              <div
                key={idx}
                className="rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 transition-all"
                style={{
                  background: "white",
                  border: "2px solid hsl(153 56% 11% / 0.08)",
                  boxShadow:
                    "0 4px 20px hsl(153 56% 11% / 0.06), inset 0 1px 0 rgba(255,255,255,0.8)",
                }}
              >
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <div
                    className="w-8 sm:w-10 h-8 sm:h-10 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm"
                    style={{
                      background:
                        "linear-gradient(135deg, hsl(153 56% 11%), hsl(153 56% 22%))",
                      boxShadow: "0 4px 12px hsl(153 56% 11% / 0.3)",
                    }}
                  >
                    {review.name[0]}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm sm:text-base text-slate-800">{review.name}</h4>
                    <p className="text-[10px] sm:text-xs text-slate-600">{review.role}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-2 sm:mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-3 sm:w-4 h-3 sm:h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm lg:text-base text-slate-700 italic leading-relaxed">"{review.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION — Dark green ─── */}
      <section className="cta-section relative overflow-hidden">

        {/* رَبُّنَا Rabbuna (Our Lord) — left, LARGE */}
        <div className="isl-sym isl-cta-rabbuna">رَبُّنَا</div>

        {/* بَارَكَ ٱللَّهُ Barakallah — right */}
        <div className="isl-sym isl-cta-barakallah">بَارَكَ ٱللَّهُ</div>

        <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 py-12 sm:py-16 lg:py-20 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold mb-3 sm:mb-4 lg:mb-5">
            Ready to Start Your Islamic Learning Journey?
          </h2>
          <p className="text-sm sm:text-base lg:text-lg mb-6 sm:mb-7 lg:mb-8 text-white/90">
            Join thousands of students learning Quran and Islamic studies with certified teachers
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-6 sm:px-8 py-2.5 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base lg:text-lg transition-all shadow-lg"
            style={{
              backgroundColor: "hsl(153 56% 8%)",
              color: "white",
              border: "2px solid hsl(0 0% 100% / 0.25)",
              boxShadow:
                "0 8px 24px hsl(153 56% 4% / 0.5), inset 0 1px 0 rgba(255,255,255,0.12)",
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.backgroundColor = "hsl(153 56% 5%)";
              e.currentTarget.style.boxShadow =
                "0 16px 36px hsl(153 56% 4% / 0.6), inset 0 1px 0 rgba(255,255,255,0.18)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.backgroundColor = "hsl(153 56% 8%)";
              e.currentTarget.style.boxShadow =
                "0 8px 24px hsl(153 56% 4% / 0.5), inset 0 1px 0 rgba(255,255,255,0.12)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
            }}
          >
            Sign Up Now - First Session Free
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-600">&copy; 2026 Ilmrise. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default IslamicLandingPage;