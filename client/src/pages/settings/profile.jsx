import { useState, useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../firebaseConfig";
import "./profile.css";

export default function Profile() {
  const auth = getAuth();
  const fileInputRef = useRef();

  const [userData, setUserData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [saving, setSaving] = useState(false);

  const [newDisplayName, setNewDisplayName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newAge, setNewAge] = useState("");
  const [newGender, setNewGender] = useState("prefer-not-to-say");

  /* =====================
     LOAD USER DATA
  ====================== */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setUserData(snap.data());
      }
    });

    return unsub;
  }, [auth]);

  /* =====================
     IMAGE UPLOAD
  ====================== */
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert("Please upload an image smaller than 2MB.");
      return;
    }

    setUploading(true);

    try {
      const user = auth.currentUser;

      const imageRef = ref(
        storage,
        `profileImages/${user.uid}/profile_${Date.now()}`
      );

      const uploadTask = uploadBytesResumable(imageRef, file);
      await new Promise((resolve, reject) =>
        uploadTask.on("state_changed", null, reject, resolve)
      );

      const downloadURL = await getDownloadURL(imageRef);

      await updateDoc(doc(db, "users", user.uid), {
        profileImageUrl: downloadURL,
      });

      setUserData((prev) => ({
        ...prev,
        profileImageUrl: downloadURL,
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
      fileInputRef.current.value = "";
    }
  };

  /* =====================
     EDIT CONTROL
  ====================== */
  const startEdit = (field) => {
    setEditingField(field);

    if (field === "name") {
      setNewDisplayName(userData.profileDisplayName || "");
    }

    if (field === "username") {
      setNewUsername(userData.username?.value || "");
    }

    if (field === "age") {
      setNewAge(userData.age ?? "");
    }

    if (field === "gender") {
      setNewGender(userData.gender || "prefer-not-to-say");
    }
  };

  const cancelEdit = () => {
    setEditingField(null);
  };

  /* =====================
     SAVE FUNCTIONS
  ====================== */
  const saveDisplayName = async () => {
    if (!newDisplayName.trim()) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        profileDisplayName: newDisplayName.trim(),
      });

      setUserData((prev) => ({
        ...prev,
        profileDisplayName: newDisplayName.trim(),
      }));

      setEditingField(null);
    } finally {
      setSaving(false);
    }
  };

  const saveUsername = async () => {
    if (!newUsername.trim()) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        "username.value": newUsername.trim(),
        "username.lastChangedAt": serverTimestamp(),
      });

      setUserData((prev) => ({
        ...prev,
        username: {
          ...prev.username,
          value: newUsername.trim(),
          lastChangedAt: new Date(),
        },
      }));

      setEditingField(null);
    } finally {
      setSaving(false);
    }
  };


  const saveAge = async () => {
    const age = Number(newAge);
    if (!age || age < 13 || age > 120) {
      alert("Please enter a valid age");
      return;
    }

    setSaving(true);
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        age,
      });

      setUserData((prev) => ({ ...prev, age }));
      setEditingField(null);
    } finally {
      setSaving(false);
    }
  };

  const saveGender = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), {
        gender: newGender,
      });

      setUserData((prev) => ({
        ...prev,
        gender: newGender,
      }));

      setEditingField(null);
    } finally {
      setSaving(false);
    }
  };

  const formatGender = (gender) => {
    if (!gender || gender === "prefer-not-to-say") return "-";
    if (gender === "male") return "M";
    if (gender === "female") return "F";
    return "-";
  };

  if (!userData) return <p>Loading profile...</p>;

  /* =====================
     UI
  ====================== */
  return (
    <div className="profile-panel">
      <div className="profile-card">
        <h2>User Profile</h2>

        {/* Avatar */}
        <div className="profile-avatar">
          <img
            src={userData.profileImageUrl || "/avatar.jpg"}
            alt="Profile"
          />
          <button
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Change Photo"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={handleImageChange}
          />
        </div>

        <div className="profile-info">

          {/* Display Name */}
          <div className="profile-row">
            <span>Display Name</span>
            <div className="profile-value">
              {editingField === "name" ? (
                <input
                  value={newDisplayName}
                  onChange={(e) => setNewDisplayName(e.target.value)}
                  disabled={saving}
                />
              ) : (
                <p>{userData.profileDisplayName || "-"}</p>
              )}
            </div>
            <div className="profile-action">
              {editingField === "name" ? (
                <>
                  <button onClick={saveDisplayName} disabled={saving}>Save</button>
                  <button onClick={cancelEdit} disabled={saving}>Cancel</button>
                </>
              ) : (
                <button className="edit-btn" onClick={() => startEdit("name")}>✏️</button>
              )}
            </div>
          </div>

          {/* Username */}
          <div className="profile-row">
            <span>Username</span>

            <div className="profile-value">
              {editingField === "username" ? (
                <input
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  disabled={saving}
                />
              ) : (
                <p>
                  {userData.username?.value}
                  {userData.username?.discriminator &&
                    `#${userData.username.discriminator}`}
                </p>
              )}
            </div>

            <div className="profile-action">
              {editingField === "username" ? (
                <>
                  <button onClick={saveUsername} disabled={saving}>Save</button>
                  <button onClick={cancelEdit} disabled={saving}>Cancel</button>
                </>
              ) : (
                <button className="edit-btn" onClick={() => startEdit("username")}>
                  ✏️
                </button>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="profile-row">
            <span>Email</span>
            <p>{auth.currentUser?.email || "-"}</p>
            <div className="profile-action" />
          </div>

          {/* Age */}
          <div className="profile-row">
            <span>Age</span>
            <div className="profile-value">
              {editingField === "age" ? (
                <input
                  type="number"
                  value={newAge}
                  onChange={(e) => setNewAge(e.target.value)}
                  disabled={saving}
                />
              ) : (
                <p>{userData.age ?? "-"}</p>
              )}
            </div>
            <div className="profile-action">
              {editingField === "age" ? (
                <>
                  <button onClick={saveAge} disabled={saving}>Save</button>
                  <button onClick={cancelEdit} disabled={saving}>Cancel</button>
                </>
              ) : (
                <button className="edit-btn" onClick={() => startEdit("age")}>✏️</button>
              )}
            </div>
          </div>

          {/* Gender */}
          <div className="profile-row">
            <span>Gender</span>
            <div className="profile-value">
              {editingField === "gender" ? (
                <select
                  value={newGender}
                  onChange={(e) => setNewGender(e.target.value)}
                  disabled={saving}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              ) : (
                <p>{formatGender(userData.gender)}</p>
              )}
            </div>
            <div className="profile-action">
              {editingField === "gender" ? (
                <>
                  <button onClick={saveGender} disabled={saving}>Save</button>
                  <button onClick={cancelEdit} disabled={saving}>Cancel</button>
                </>
              ) : (
                <button className="edit-btn" onClick={() => startEdit("gender")}>✏️</button>
              )}
            </div>
          </div>

          {/* Role */}
          <div className="profile-row">
            <span>Role</span>
            <p>{userData.roles?.join(", ") || "-"}</p>
            <div className="profile-action" />
          </div>

        </div>
      </div>
    </div>
  );
}