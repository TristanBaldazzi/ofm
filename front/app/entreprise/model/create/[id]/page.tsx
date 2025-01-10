"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import LoadingSpinner from "@/components/LoadingSpinner";

interface User {
  email: string;
  isVerified: boolean;
}

export default function CreateModel() {
  const { id } = useParams(); // Récupère l'ID du formulaire depuis l'URL
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState("");
  const [socialMedia, setSocialMedia] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  // Vérifier l'utilisateur connecté
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id) {
      setError("ID de l'entreprise manquant dans l'URL.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5001/api/fan/create",
        {
          name,
          description,
          companyId: id, // Passer l'ID de l'entreprise
          socialMedia,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccessMessage("Modèle créé avec succès !");
      router.push(`/dashboard`); // Rediriger après création
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la création du modèle.");
    }
  };

  if (!user) return <LoadingSpinner />;

  return (
    <DashboardLayout>
      <main className="flex-grow bg-gray-100 flex items-center justify-center">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-lg">
          <h1 className="text-xl font-bold mb-4">Créer un Modèle</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Nom */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Nom
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            {/* Réseaux sociaux */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="socialMedia">
                Réseaux sociaux (séparés par des virgules)
              </label>
              <input
                id="socialMedia"
                type="text"
                value={socialMedia.join(", ")}
                onChange={(e) => setSocialMedia(e.target.value.split(",").map(link => link.trim()))}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              ></textarea>
            </div>

            {/* Photo */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="photo">
                Photo
              </label>
              <input
                id="photo"
                type="file"
                onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded-md file:text-sm file:bg-white file:text-gray-700 hover:file:bg-gray-100"
              />
            </div>

            {/* Bouton Soumettre */}
            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Créer le Modèle
              </button>
            </div>
          </form>
        </div>
      </main>
    </DashboardLayout>
  );
};

