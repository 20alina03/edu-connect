import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppHeader } from "@/components/AppHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { profileApi } from "@/lib/api/profile";

const Profile = () => {
  const { user, role } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    profileApi.get().then(({ profile }) => {
      setFullName(profile?.full_name ?? "");
      setPhone(profile?.phone ?? "");
    }).catch(() => {});
  }, [user]);

  const save = async () => {
    setLoading(true);
    try {
      await profileApi.update({ full_name: fullName, phone });
      toast.success("Profile updated");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold font-display mb-1 sm:mb-2">Your profile</h1>
        <p className="text-muted-foreground mb-6 sm:mb-8 capitalize text-sm sm:text-base">Role: {role}</p>

        <div className="space-y-3 sm:space-y-4 bg-card border border-border rounded-lg sm:rounded-xl p-4 sm:p-6">
          <div>
            <Label>Email</Label>
            <Input value={user?.email ?? ""} disabled />
          </div>
          <div>
            <Label>Full name</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <Button onClick={save} disabled={loading} className="w-full sm:w-auto">{loading ? "Saving..." : "Save changes"}</Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
