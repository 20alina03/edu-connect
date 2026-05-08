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
      <div className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <h1 className="text-4xl font-bold font-display mb-3">Get in touch</h1>
          <p className="text-muted-foreground mb-8">
            Questions about teachers, bookings, or partnerships — drop us a line.
          </p>
          <div className="space-y-4">
            <div className="flex gap-3"><Mail className="w-5 h-5 text-primary"/><span>hello@educonnect.com</span></div>
            <div className="flex gap-3"><MessageCircle className="w-5 h-5 text-primary"/><span>Live chat (9am–9pm GMT)</span></div>
            <div className="flex gap-3"><MapPin className="w-5 h-5 text-primary"/><span>London, UK</span></div>
          </div>
        </div>
        <form onSubmit={submit} className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div><Label>Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div><Label>Message</Label><Textarea rows={5} value={msg} onChange={(e) => setMsg(e.target.value)} /></div>
          <Button type="submit" className="w-full">Send message</Button>
        </form>
      </div>
    </div>
  );
};
export default Contact;
