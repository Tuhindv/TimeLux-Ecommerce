import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

function AdminRoute({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("AUTH USER:", user);
      console.log("AUTH UID:", user?.uid);

      if (!user) {
        console.log("No user logged in");
        setStatus("unauthorized");
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        console.log("Checking Firestore document:", user.uid);

        const userDoc = await getDoc(userRef);

        console.log("Document exists:", userDoc.exists());
        console.log("Document data:", userDoc.data());

        if (userDoc.exists() && userDoc.data()?.role === "admin") {
          console.log("ADMIN VERIFIED");
          setStatus("admin");
        } else {
          console.log("ADMIN NOT VERIFIED");
          setStatus("unauthorized");
        }
      } catch (error) {
        console.error("ADMIN VERIFICATION ERROR:", error);
        setStatus("error");
      }
    });

    return () => unsubscribe();
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-yellow-500">
        Checking admin access...
      </div>
    );
  }

  if (status === "unauthorized") {
    return <Navigate to="/login" replace />;
  }

  if (status === "error") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-red-500">
        Admin verification failed. Please try again.
      </div>
    );
  }

  return children;
}

export default AdminRoute;