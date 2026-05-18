import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Mail, MessageCircle, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !msg) return toast.error("Please fill all fields");
    toast.success("Message sent! We'll be in touch within 24h.");
    setName(""); setEmail(""); setMsg("");
  };
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12">
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-display mb-2 sm:mb-3">Get in touch</h1>
          <p className="text-xs sm:text-sm lg:text-base text-muted-foreground mb-8 sm:mb-10 leading-relaxed">
            Questions about teachers, bookings, or partnerships — drop us a line.
          </p>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex gap-2 sm:gap-3"><Mail className="w-5 h-5 text-primary flex-shrink-0"/><span className="text-xs sm:text-sm lg:text-base">ilmrise.contact@gmail.com</span></div>
            <div className="flex gap-2 sm:gap-3"><MessageCircle className="w-5 h-5 text-primary flex-shrink-0"/><span className="text-xs sm:text-sm lg:text-base">Live chat (9am–9pm GMT)</span></div>
            <div className="flex gap-2 sm:gap-3"><MapPin className="w-5 h-5 text-primary flex-shrink-0"/><span className="text-xs sm:text-sm lg:text-base">London, UK</span></div>
          </div>
        </div>
        <form onSubmit={submit} className="bg-card border border-border rounded-lg sm:rounded-xl lg:rounded-2xl p-4 sm:p-5 lg:p-6 space-y-3 sm:space-y-4">
          <div><Label className="text-xs sm:text-sm">Name</Label><Input className="text-xs sm:text-sm h-9 sm:h-10" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label className="text-xs sm:text-sm">Email</Label><Input className="text-xs sm:text-sm h-9 sm:h-10" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><Label className="text-xs sm:text-sm">Message</Label><Textarea className="text-xs sm:text-sm min-h-[120px] sm:min-h-[140px]" rows={5} value={msg} onChange={(e) => setMsg(e.target.value)} /></div>
          <Button type="submit" className="w-full h-9 sm:h-10 text-xs sm:text-sm">Send message</Button>
        </form>
      </div>
    </div>
  );
};
export default Contact;
