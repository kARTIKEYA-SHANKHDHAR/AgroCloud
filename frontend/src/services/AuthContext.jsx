import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { auth, db } from "../firebase/firebaseClient";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
    try {
      if (!firebaseUser) {
        setUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setUser(firebaseUser);

      const userRef = doc(db, "users", firebaseUser.uid);
      const snap = await getDoc(userRef);

      if (!snap.exists()) {
        const defaultRole = "farmer";

        await setDoc(userRef, {
          email: firebaseUser.email,
          role: defaultRole,
          active: true,
          createdAt: serverTimestamp()
        });

        setRole(defaultRole);
      } else {
        const data = snap.data();
        setRole(data.role);
      }
    } catch (err) {
      console.error("AuthContext error:", err);
      setUser(firebaseUser);
      setRole("farmer"); // fallback role
    }

    setLoading(false);
  });

  return () => unsub();
}, []);

  const login = async (email, password) => {
  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    console.log("🔥 Firebase login success:", res);
    return res;
  } catch (err) {
    console.error("🔥 Firebase login error:", err);
    throw err;
  }
};

  const signup = async (email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const defaultRole = "farmer";
    await setDoc(doc(db, "users", cred.user.uid), {
      email,
      role: defaultRole,
      active: true,
      createdAt: serverTimestamp()
    });
    return cred;
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        login,
        signup,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
};

