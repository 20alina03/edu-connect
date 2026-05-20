import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { teachersApi } from "@/lib/api/teachers";
import { profileApi } from "@/lib/api/profile";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const { role, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [rate, setRate] = useState(20);
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const profile = await profileApi.get();
        setFullName(profile.profile?.full_name ?? "");
        setPhone(profile.profile?.phone ?? "");
        if (role === "teacher") {
          const { teacher } = await teachersApi.getDashboard();
          setRate(Number(teacher?.hourly_rate_usd ?? 20));
          setBio(teacher?.bio ?? "");
        }
      } catch {
        // ignore initial load errors
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [user, role]);

  const save = async () => {
    setSaving(true);
    try {
      await profileApi.update({ full_name: fullName, phone });
      if (role === "teacher") {
        await teachersApi.updateProfile({ full_name: fullName, phone, hourly_rate_usd: rate, bio });
      }
      toast.success("Settings saved");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const deleteProfile = async () => {
    if (!window.confirm("Delete your profile? This hides your teacher profile and clears your teacher content.")) return;
    try {
      if (role === "teacher") {
        await teachersApi.deleteProfile();
        navigate("/teacher/onboarding");
        toast.success("Teacher profile deleted");
        return;
      }
      toast.error("Profile deletion is only available for teachers here.");
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to delete profile");
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-bold font-display mb-2">Settings</h1>
        <p className="text-muted-foreground mb-6 text-sm sm:text-base">Update your profile details and teacher pricing.</p>

        <div className="space-y-4 bg-card border border-border rounded-2xl p-4 sm:p-6">
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
          {role === "teacher" && (
            <>
              <div>
                <Label>Price per session (USD)</Label>
                <Input type="number" min={0} value={rate} onChange={(e) => setRate(Number(e.target.value))} />
              </div>
              <div>
                <Label>Bio</Label>
                <Textarea rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>
            </>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
            {role === "teacher" && (
              <Button variant="destructive" onClick={deleteProfile}>Delete profile</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
