import { useState, useEffect, useContext, useRef } from "react";
import supabase from "./supabase";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./Context/auth-context";
import { FaPencilAlt, FaCamera } from "react-icons/fa";
import toast from "react-hot-toast";

const Profile = () => {
  const { logout } = useContext(AuthContext);
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [editForm, setEditForm] = useState({
    email: "",
    username: "",
    address: "",
  });
  const [usernameError, setUsernameError] = useState("");
  const [addressError, setAddressError] = useState("");
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(
          "id, email, username, created_at, last_username_change, profile_picture"
        )
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setProfile(data);
        setEditForm((prev) => ({
          ...prev,
          email: data.email,
          username: data.username || "",
        }));
        if (data.profile_picture) {
          setProfilePictureUrl(`${data.profile_picture}?key=${Date.now()}`);
        }
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("USER_ADDRESS") || "";
    setEditForm((prev) => ({ ...prev, address: saved }));
  }, []);

  useEffect(() => {
    localStorage.setItem("USER_ADDRESS", editForm.address);
  }, [editForm.address]);

  useEffect(() => {
    if (profile) localStorage.setItem("USER_PROFILE", JSON.stringify(profile));
  }, [profile]);

  const canChangeUsername = () => {
    if (!profile?.last_username_change) return true;
    const last = new Date(profile.last_username_change);
    const diff = (Date.now() - last.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 7;
  };

  const validateUsernameFormat = (u) => {
    const re = /^[a-zA-Z0-9_]{3,20}$/;
    return re.test(u) ? "" : "3–20 chars, letters, numbers, underscores only.";
  };

  const validateAddress = (a) => {
    if (a && a.length > 200) return "Address must be ≤ 200 characters.";
    return "";
  };

  const checkUsernameAvailability = async (username) => {
    if (!profile || username === profile.username) return true;
    setUsernameChecking(true);
    setUsernameAvailable(null);
    const { data } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();
    const available = !data;
    setUsernameAvailable(available);
    setUsernameChecking(false);
    return available;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (isEditing && editForm.username) {
        const fmtErr = validateUsernameFormat(editForm.username);
        if (fmtErr) {
          setUsernameError(fmtErr);
          setUsernameAvailable(null);
        } else {
          setUsernameError("");
          checkUsernameAvailability(editForm.username);
        }
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [editForm.username, isEditing]);

  useEffect(() => {
    if (isEditing) setAddressError(validateAddress(editForm.address));
  }, [editForm.address, isEditing]);

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be < 5MB");
      return;
    }

    setUploading(true);

    const fileExt = file.name.split(".").pop();
    const filePath = `${profile.id}/${Date.now()}.${fileExt}`;

    const { error: uploadErr } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadErr) {
      toast.error("Upload failed: " + uploadErr.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    const newUrl = data.publicUrl;

    const { error: dbErr } = await supabase
      .from("profiles")
      .update({ profile_picture: newUrl })
      .eq("id", profile.id);

    if (dbErr) {
      toast.error("Failed to save picture");
    } else {
      setProfilePictureUrl(`${newUrl}?key=${Date.now()}`);
      setProfile((p) => ({ ...p, profile_picture: newUrl }));
      toast.success("Picture updated!");

      await supabase.channel("profile-picture-updates").send({
        type: "broadcast",
        event: "picture_updated",
        payload: { user_id: profile.id, url: newUrl },
      });
    }

    setUploading(false);
  };

  const openFilePicker = () => {
    if (!uploading) fileInputRef.current?.click();
  };

  const handleSave = async () => {
    if (!profile) return;

    if (editForm.username !== profile.username && !canChangeUsername()) {
      setUsernameError("Username can be changed only once every 7 days.");
      return;
    }

    if (editForm.username !== profile.username) {
      const fmtErr = validateUsernameFormat(editForm.username);
      if (fmtErr) {
        setUsernameError(fmtErr);
        return;
      }
      if (!usernameAvailable) {
        setUsernameError("Username already taken.");
        return;
      }
    }

    const addrErr = validateAddress(editForm.address);
    if (addrErr) {
      setAddressError(addrErr);
      return;
    }

    const updates = {
      email: editForm.email,
      username: editForm.username,
    };
    if (editForm.username !== profile.username) {
      updates.last_username_change = new Date().toISOString();
    }

    const { error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", profile.id);

    if (error) {
      toast.error("Failed to save profile.");
      return;
    }

    setProfile((p) => ({ ...p, ...updates }));
    setIsEditing(false);
    setUsernameError("");
    setAddressError("");
    setUsernameAvailable(null);
    toast.success("Profile updated successfully");
  };

  const handleCancel = () => {
    setEditForm({
      email: profile?.email || "",
      username: profile?.username || "",
      address: localStorage.getItem("USER_ADDRESS") || "",
    });
    setIsEditing(false);
    setUsernameError("");
    setAddressError("");
    setUsernameAvailable(null);
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  if (loading) return <div className="text-center p-8">Loading...</div>;
  if (!profile) return <div className="text-center p-8">No profile found.</div>;

  const initials = profile.username?.slice(0, 2).toUpperCase() || "UN";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
          Profile Details
        </h1>

        <div className="flex justify-center mb-6">
          <div className="relative inline-block">
            {profilePictureUrl && (
              <img
                key={profilePictureUrl}
                src={profilePictureUrl}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                style={{ display: "none" }}
                onLoad={(e) => {
                  e.target.style.display = "block";
                  const fallback = e.target.nextElementSibling;
                  if (fallback) fallback.style.display = "none";
                }}
                onError={(e) => {
                  e.target.style.display = "none";
                  const fallback = e.target.nextElementSibling;
                  if (fallback) fallback.style.display = "flex";
                }}
              />
            )}

            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl font-semibold shadow-md transition-all ${
                profilePictureUrl
                  ? "hidden"
                  : "bg-gradient-to-br from-blue-500 to-indigo-600"
              }`}
            >
              {initials}
            </div>

            <button
              onClick={openFilePicker}
              disabled={uploading}
              className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-2 rounded-full shadow-xl hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-20"
              title="Change profile picture"
            >
              {uploading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FaCamera size={18} />
              )}
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email ID
            </label>
            <div className="w-full text-gray-800">{profile.email}</div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-1">
              <label className="block text-sm font-medium text-gray-600">
                Username
              </label>
              {!isEditing && canChangeUsername() && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-600 hover:text-blue-700 transition"
                >
                  <FaPencilAlt size={14} />
                </button>
              )}
            </div>

            {isEditing ? (
              <div>
                <div className="flex">
                  <span className="inline-flex items-center px-4 text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                    @
                  </span>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => {
                      const v = e.target.value.replace(/[^a-zA-Z0-9_]/g, "");
                      setEditForm({ ...editForm, username: v });
                    }}
                    className={`flex-1 px-4 py-3 border rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                      usernameError ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>

                <div className="mt-1 flex items-center gap-2 text-xs">
                  {usernameChecking && (
                    <span className="text-gray-500">
                      Checking availability...
                    </span>
                  )}
                  {usernameAvailable === true &&
                    !usernameChecking &&
                    !usernameError && (
                      <span className="text-green-600">Available</span>
                    )}
                  {usernameAvailable === false &&
                    !usernameChecking &&
                    !usernameError && (
                      <span className="text-red-600">Taken</span>
                    )}
                </div>

                {usernameError && (
                  <p className="text-red-500 text-xs mt-1">{usernameError}</p>
                )}
                {!canChangeUsername() && !usernameError && (
                  <p className="text-amber-600 text-xs mt-1">
                    Next change allowed after 7 days.
                  </p>
                )}
              </div>
            ) : (
              <div className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg">
                {profile.username ? `@${profile.username}` : "No username set"}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-3 mb-1">
              <label className="block text-sm font-medium text-gray-600">
                Address Line
              </label>
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 hover:text-blue-700 transition"
              >
                <FaPencilAlt size={14} />
              </button>
            </div>

            {isEditing ? (
              <div>
                <input
                  type="text"
                  value={editForm.address}
                  onChange={(e) =>
                    setEditForm({ ...editForm, address: e.target.value })
                  }
                  placeholder="Enter your address"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition ${
                    addressError ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {addressError && (
                  <p className="text-red-500 text-xs mt-1">{addressError}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Max 200 characters (saved locally)
                </p>
              </div>
            ) : (
              <div className="w-full px-4 py-3 bg-gray-50 text-gray-800 rounded-lg">
                {editForm.address || "No address set"}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Account Created
            </label>
            <div className="w-full text-gray-800">
              {formatDate(profile.created_at)}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="mt-8 flex gap-3">
            <button
              onClick={handleSave}
              disabled={!!usernameError || !!addressError || usernameChecking}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        )}

        {!isEditing && (
          <div className="mt-8">
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm"
            >
              Edit Profile
            </button>
          </div>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              logout();
              toast.success("Logged out successfully");
              navigate("/");
            }}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
