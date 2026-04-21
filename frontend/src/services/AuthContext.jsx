import React, { createContext, useContext, useEffect, useState } from "react";

// ── AWS Cognito Setup ─────────────────────────────────────────
// Lazy-load Cognito so that a missing/empty env var doesn't crash the whole app
const POOL_ID   = import.meta.env.VITE_AWS_USER_POOL_ID  || "";
const CLIENT_ID = import.meta.env.VITE_AWS_CLIENT_ID     || "";
const COGNITO_READY = Boolean(POOL_ID && CLIENT_ID);

// Only import and init the pool when we actually have valid credentials
let userPool = null;
let CognitoUser         = null;
let AuthenticationDetails = null;

if (COGNITO_READY) {
  try {
    const sdk = await import("amazon-cognito-identity-js");
    const { CognitoUserPool } = sdk;
    CognitoUser           = sdk.CognitoUser;
    AuthenticationDetails = sdk.AuthenticationDetails;
    userPool = new CognitoUserPool({ UserPoolId: POOL_ID, ClientId: CLIENT_ID });
  } catch (e) {
    console.warn("Cognito SDK failed to load:", e);
  }
}

// ── Context ───────────────────────────────────────────────────
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Restore session on page load ───────────────────────────
  useEffect(() => {
    if (!userPool) {
      // Cognito not configured – app still renders, just not logged in
      setLoading(false);
      return;
    }

    const cognitoUser = userPool.getCurrentUser();
    if (!cognitoUser) {
      setLoading(false);
      return;
    }

    cognitoUser.getSession((err, session) => {
      if (err || !session?.isValid()) {
        setLoading(false);
        return;
      }
      cognitoUser.getUserAttributes((attrErr, attributes) => {
        const email = attributes?.find(a => a.Name === "email")?.Value || "";
        setUser({ uid: cognitoUser.getUsername(), email });
        setLoading(false);
      });
    });
  }, []);

  // ── Login ──────────────────────────────────────────────────
  const login = (email, password) => {
    if (!userPool || !CognitoUser || !AuthenticationDetails) {
      return Promise.reject(new Error("AWS Cognito is not configured yet. Check .env file."));
    }
    return new Promise((resolve, reject) => {
      const authDetails = new AuthenticationDetails({ Username: email, Password: password });
      const cogUser     = new CognitoUser({ Username: email, Pool: userPool });

      cogUser.authenticateUser(authDetails, {
        onSuccess: (session) => {
          console.log("Cognito login success");
          cogUser.getUserAttributes((err, attrs) => {
            const emailAttr = attrs?.find(a => a.Name === "email")?.Value || email;
            const userData  = { uid: cogUser.getUsername(), email: emailAttr };
            setUser(userData);
            resolve(userData);
          });
        },
        onFailure: (err) => {
          console.error("Cognito login failure:", err);
          reject(err);
        },
      });
    });
  };

  // ── Signup ─────────────────────────────────────────────────
  const signup = (email, password) => {
    if (!userPool) {
      return Promise.reject(new Error("AWS Cognito is not configured yet. Check .env file."));
    }
    return new Promise((resolve, reject) => {
      userPool.signUp(email, password, [], null, (err, result) => {
        if (err) return reject(err);
        resolve(result.user);
      });
    });
  };

  // ── Confirm Signup ──────────────────────────────────────────
  const confirmSignup = (email, code) => {
    if (!userPool || !CognitoUser) {
      return Promise.reject(new Error("AWS Cognito is not configured yet."));
    }
    return new Promise((resolve, reject) => {
      const cogUser = new CognitoUser({ Username: email, Pool: userPool });
      cogUser.confirmRegistration(code, true, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  };

  // ── Resend Code ─────────────────────────────────────────────
  const resendCode = (email) => {
    if (!userPool || !CognitoUser) {
      return Promise.reject(new Error("AWS Cognito is not configured yet."));
    }
    return new Promise((resolve, reject) => {
      const cogUser = new CognitoUser({ Username: email, Pool: userPool });
      cogUser.resendConfirmationCode((err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  };

  // ── Logout ─────────────────────────────────────────────────
  const logout = () => {
    const cogUser = userPool?.getCurrentUser();
    cogUser?.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      role: "farmer",
      loading,
      login,
      signup,
      confirmSignup,
      resendCode,
      logout,
      cognitoReady: COGNITO_READY,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
