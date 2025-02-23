import axios from "axios";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import React, { createContext, useEffect, useState } from "react";
import auth from "./../Firebase/firebase.config";

export const Authentication = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const googleProvider = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        const { displayName, email, photoURL, uid } = currentUser;
        if (!email) {
          console.error(
            "Current user does not have an email; cannot send data to backend."
          );
          return;
        }
        const userData = {
          name: displayName || "Unnamed user",
          email,
          image: photoURL || "No image",
          firebaseUid: uid,
        };

        try {
          await axios.post(
            "https://todo-server-lovat.vercel.app/users",
            userData,
            {
              withCredentials: true,
            }
          );
        } catch (error) {
          console.error("Error sending user data to the backend:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const createNewUser = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result;
    } finally {
      setLoading(false);
    }
  };

  const manageUser = async (name, imageUrl) => {
    if (auth.currentUser) {
      setLoading(true);
      try {
        await updateProfile(auth.currentUser, {
          displayName: name,
          photoURL: imageUrl,
        });

        setUser({ ...auth.currentUser, displayName: name, photoURL: imageUrl });
      } finally {
        setLoading(false);
      }
    }
  };

  const updateUserProfile = async (updates) => {
    if (!auth.currentUser) {
      throw new Error("No user is currently logged in.");
    }
    setLoading(true);
    try {
      await updateProfile(auth.currentUser, updates);
      setUser({ ...auth.currentUser, ...updates });
      return "Profile updated successfully!";
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const forgetPassword = async (email) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      return "Password reset email sent successfully!";
    } finally {
      setLoading(false);
    }
  };

  const authInfo = {
    user,
    setUser,
    loading,
    createNewUser,
    login,
    googleLogin,
    manageUser,
    updateUserProfile,
    logOut,
    forgetPassword,
  };

  return (
    <Authentication.Provider value={authInfo}>
      {loading ? (
        <div className="flex items-center justify-center h-screen">
          <div className="text-blue-500 text-xl font-semibold">Loading...</div>
        </div>
      ) : (
        children
      )}
    </Authentication.Provider>
  );
}
