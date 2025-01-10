"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import DashboardLayout from "@/components/DashboardLayout";

interface User {
  email: string;
  isVerified: boolean;
  name: string;
  profilePicture: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [credits, setCredits] = useState(0);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get("http://localhost:5001/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        setCredits(response.data.credits);
      } catch (err) {
        setError("Impossible de récupérer les informations utilisateur.");
      }
    };

    fetchUser();
  }, []);

  if (!user) return <LoadingSpinner />;

  return (
    <DashboardLayout>
      <main className="flex-grow bg-gray-100 flex items-center justify-center p-6">
        <div className="bg-white shadow-lg rounded-xl p-8 max-w-md w-full text-center transform transition duration-300 hover:scale-105">
          {/* Image de profil */}
          <img
            src={user.profilePicture || "/default-avatar.jpg"}
            alt="Profile Picture"
            className="w-28 h-28 rounded-full mx-auto mb-4 border-4 border-blue-500"
          />

          {/* Nom et Email */}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{user.name || "Utilisateur"}</h1>
          <p className="text-gray-600 mb-4">{user.email}</p>

          {/* Section Crédits */}
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 rounded-lg shadow-md mb-6">
            <h2 className="text-xl font-semibold mb-2">Vos Crédits</h2>
            <div className="flex items-center justify-center gap-2 text-blue-800">
              <span className="text-4xl font-bold">{credits} ©️</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Utilisez vos crédits pour accéder à des fonctionnalités exclusives.</p>
          </div>

          {/* Section Vérification */}
          {!user.isVerified && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md shadow-md mb-6">
              <p>
                <strong>Attention :</strong> Votre email n'est pas vérifié.
              </p>
              <button
                onClick={() => router.push("/user/verifyaccount")}
                className="mt-3 px-5 py-2 bg-yellow-500 text-white font-medium rounded-lg hover:bg-yellow-600 transition duration-300"
              >
                Vérifier mon compte
              </button>
            </div>
          )}

          {/* Bouton Déconnexion */}
          <button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
            className="mt-4 px-6 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 transition duration-300"
          >
            Déconnexion
          </button>
        </div>
      </main>
    </DashboardLayout>
  );
}
