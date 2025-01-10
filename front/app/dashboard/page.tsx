"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import DashboardLayout from "@/components/DashboardLayout";

interface User {
  email: string;
  isVerified: boolean;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("http://localhost:5001/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
      } catch (err) {
        setError("Impossible de récupérer les informations utilisateur.");
      }
    };

    fetchUser();
  }, []);

  if (!user) return <LoadingSpinner />;

  return (
    <DashboardLayout>
      <main
        className={`flex-grow bg-gray-100 flex items-center justify-center transition-all duration-300 ${
          isSidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        {!user.isVerified && (
          <div className="absolute bottom-4 right-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow-md max-w-sm">
            <p><strong>Attention :</strong> Votre email n'est pas vérifié. Veuillez vérifier votre boîte mail.</p>
            <button
              onClick={() => router.push("/user/verifyaccount")}
              className="mt-2 px-4 py-2 border border-yellow-500 text-yellow-700 rounded-lg hover:bg-yellow-500 hover:text-white transition duration-300 ease-in-out"
            >
              Vérifier mon compte
            </button>
          </div>
        )}

        <div className="text-center">
          <h1 className="text-xl font-bold mb-4">Bienvenue sur le tableau de bord</h1>
          <p>Email : {user.email}</p>
        </div>
      </main>
    </DashboardLayout>
  );
}
