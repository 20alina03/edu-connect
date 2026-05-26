import {
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileText,
  GraduationCap,
  LayoutDashboard,
  MessageSquare,
  School2,
  Search,
  Settings,
  User,
  Globe,
} from "lucide-react";

export interface StudentNavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  description: string;
  badge?: string;
}

export interface StudentNavSection {
  title: string;
  items: StudentNavItem[];
}

export const studentNavSections: StudentNavSection[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard/student",
        icon: LayoutDashboard,
        description: "Your learning snapshot",
      },
      {
        label: "Bookings",
        href: "/bookings",
        icon: CalendarDays,
        description: "Upcoming and past sessions",
      },
      {
        label: "Reports",
        href: "/reports",
        icon: FileText,
        description: "Progress, marks and trends",
      },
    ],
  },
  {
    title: "Learning",
    items: [
      {
        label: "Browse Islamic Teachers",
        href: "/islamic/teachers",
        icon: School2,
        description: "Quran, Tajweed and Islamic Studies",
      },
      {
        label: "Browse School Teachers",
        href: "/school/teachers",
        icon: Search,
        description: "Maths, science, English and more",
      },
      {
        label: "Assignments",
        href: "/assignments",
        icon: ClipboardList,
        description: "Session tasks and follow-ups",
        badge: "New",
      },
      {
        label: "Notes",
        href: "/notes",
        icon: FileText,
        description: "Teacher notes unlocked by sessions",
      },
    ],
  },
  {
    title: "Communication",
    items: [
      {
        label: "Community",
        href: "/community",
        icon: Globe,
        description: "Islamic and school teacher posts",
      },
      {
        label: "Messages",
        href: "/messages",
        icon: MessageSquare,
        description: "Chat with teachers",
      },
      {
        label: "Notifications",
        href: "/notifications",
        icon: Bell,
        description: "Booking and system updates",
      },
    ],
  },
  {
    title: "Account",
    items: [
      {
        label: "Profile",
        href: "/profile",
        icon: User,
        description: "Personal details and contact info",
      },
      {
        label: "Settings",
        href: "/settings",
        icon: Settings,
        description: "Preferences and saved details",
      },
    ],
  },
];
