// File: src/contexts/AuthProvider.jsx
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
import auth from "../Firebase/firebase.config";

// Create the context
export const Authentication = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // GoogleAuthProvider instance
  const googleProvider = new GoogleAuthProvider();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      // If we have a logged-in user, send their data to the backend
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
          email, // email is guaranteed to be defined here
          image: photoURL || "No image",
          firebaseUid: uid,
        };

        try {
          // Use withCredentials: true so the server can set a cookie
          await axios.post(
            "https://todo-server-alpha-sand.vercel.app/users",
            userData,
            { withCredentials: true }
          );
          console.log("User data sent to backend successfully!");
        } catch (error) {
          console.error("Error sending user data to the backend:", error);
        }
      }
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  // 2) Create user with email/password
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

  // 3) Login with email/password
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

  // 4) Google sign-in
  const googleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result;
    } finally {
      setLoading(false);
    }
  };

  // 5) Update user profile (displayName, photoURL, etc.)
  const manageUser = async (name, imageUrl) => {
    if (auth.currentUser) {
      setLoading(true);
      try {
        await updateProfile(auth.currentUser, {
          displayName: name,
          photoURL: imageUrl,
        });
        // Merge new fields into local `user` state
        setUser({ ...auth.currentUser, displayName: name, photoURL: imageUrl });
      } finally {
        setLoading(false);
      }
    }
  };

  // 6) Update user profile with arbitrary fields
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

  // 7) Logout
  const logOut = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      // Optionally, call a backend logout endpoint to clear the cookie if needed
    } finally {
      setLoading(false);
    }
  };

  // 8) Send password reset email
  const forgetPassword = async (email) => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      return "Password reset email sent successfully!";
    } finally {
      setLoading(false);
    }
  };

  // 9) Provide methods & data via context
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
