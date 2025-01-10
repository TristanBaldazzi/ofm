"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import LoadingSpinner from "@/components/LoadingSpinner";
import DashboardLayout from "@/components/DashboardLayout";

interface User {
  email: string;
  isVerified: boolean;
  twoFactorEnabled: boolean;
}

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      try {
        const response = await axios.get("http://localhost:5001/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(response.data);
        setTwoFactorEnabled(response.data.twoFactorEnabled);
      } catch (err) {
        console.error("Erreur lors de la récupération des données utilisateur.");
      }
    };

    fetchUser();
  }, []);

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      alert("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5001/api/auth/change-password",
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Mot de passe changé avec succès.");
    } catch (err) {
      alert("Erreur lors du changement de mot de passe.");
    }
  };

  const toggleTwoFactorAuth = async () => {
    try {
      await axios.post(
        `http://localhost:5001/api/auth/${twoFactorEnabled ? "disable" : "enable"}-2fa`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setTwoFactorEnabled(!twoFactorEnabled);
    } catch (err) {
      alert("Erreur lors du changement du statut de la double authentification.");
    }
  };

  if (!user) return <LoadingSpinner />;

  return (
    <DashboardLayout>
      <main className="flex-grow p-6 min-h-screen">
        <div className="bg-white shadow-lg rounded-lg max-w-5xl mx-auto p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Paramètres</h1>

          {/* Catégorie : Compte */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-2">Compte</h2>
            <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg shadow-sm">
              <div>
                <p className="text-lg font-medium text-gray-700">Email</p>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>
          </section>

          {/* Catégorie : Sécurité */}
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-2">Sécurité</h2>

            <div className="mb-8 bg-gray-100 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Changer le mot de passe</h3>
              <div className="space-y-4">
                <input
                  type="password"
                  placeholder="Ancien mot de passe"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-indigo-500"
                />
                <input
                  type="password"
                  placeholder="Nouveau mot de passe"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-indigo-500"
                />
                <input
                  type="password"
                  placeholder="Confirmer le nouveau mot de passe"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring focus:ring-indigo-500"
                />
              </div>
              <button
                onClick={handleChangePassword}
                className="mt-4 w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-300 ease-in-out shadow-md"
              >
                Changer le mot de passe
              </button>
            </div>

            {/* Double authentification avec switch */}
            <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Double authentification</h3>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Activer la double authentification</span>
                {/* Switch Toggle */}
                <button
                  onClick={toggleTwoFactorAuth}
                  className={`relative inline-flex h-[28px] w-[56px] items-center rounded-full transition-colors duration-300 ${twoFactorEnabled ? "bg-green-500" : "bg-gray-300"
                    }`}
                >
                  <span
                    className={`inline-block h-[20px] w-[20px] transform rounded-full bg-white transition-transform duration-300 ${twoFactorEnabled ? "translate-x-[28px]" : "translate-x-[4px]"
                      }`}
                  ></span>
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </DashboardLayout>
  );
}
