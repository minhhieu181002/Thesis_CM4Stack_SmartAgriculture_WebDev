import { useContext, createContext, useState, useEffect } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "@/services/firebase";
import { createUserDocument } from "@/services/firestore-services";
import { createDefaultUserData } from "@/services/firestore-services";

const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  const guestSignIn = async () => {
    try {
      setLoading(true);
      const result = await signInAnonymously(auth);

      // Create default user data for anonymous user
      const guestUser = await createDefaultUserData(
        result.user.uid,
        null, // No email for anonymous users
        true
      );
      setUserProfile(guestUser);
      setUser(result.user);
      setLoading(false);
      return result;
    } catch (error) {
      console.error("Guest sign in error:", error);
      throw error;
    }
  };

  // Google Sign In
  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Google sign in error:", error);
    }
  };

  // Email/Password Sign In
  const emailSignIn = async (email, password) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Email sign in error:", error);
      throw error;
    }
  };

  // Sign Up
  const createUser = async (email, password) => {
    try {
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Create user error:", error);
      throw error;
    }
  };

  // Sign Out
  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // setUser(currentUser); // Set auth user
      setLoading(true);
      if (currentUser) {
        try {
          // Check if anonymous user
          if (currentUser.isAnonymous) {
            // Create or get guest user profile
            const guestUser = await createDefaultUserData(
              currentUser.uid,
              null,
              true
            );
            setUserProfile(guestUser);
          } else {
            // // Regular user flow
            const userProfile = await createUserDocument(currentUser);
            console.log("User Profile Data:", userProfile);
            setUser(currentUser);
            setUserProfile(userProfile);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        googleSignIn,
        emailSignIn,
        guestSignIn,
        createUser,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};
