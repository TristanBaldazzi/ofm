"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function ModelDetails() {
  const { companyId, modelId } = useParams(); // Get companyId and modelId from the URL
  const router = useRouter();
  const [model, setModel] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false); // State for delete confirmation modal

  // Fetch model details
  useEffect(() => {
    const fetchModelDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
          return;
        }
        const response = await axios.get(
          `http://localhost:5001/api/fan/${companyId}/${modelId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setModel(response.data);
      } catch (err) {
        console.error(err);
        setError("Erreur lors de la récupération des détails du modèle.");
      } finally {
        setLoading(false);
      }
    };

    fetchModelDetails();
  }, [companyId, modelId]);

  // Handle model deletion
  const handleDeleteModel = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5001/api/fan/${companyId}/${modelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push(`/entreprise/details/${companyId}`); // Redirect to models list after deletion
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la suppression du modèle.");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <DashboardLayout>
      <main className="flex-grow bg-gray-100 flex items-center justify-center p-6">
        {model ? (
          <div className="bg-white shadow-lg rounded-lg p-8 max-w-xl w-full relative">
            {/* Delete Button */}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Supprimer le modèle
            </button>

            {/* Photo de profil */}
            <div className="flex justify-center mb-6">
              <img
                src={`http://localhost:5001${model.profilePicture}`}
                alt={model.name}
                className="w-32 h-32 rounded-full border border-gray-300"
              />
            </div>

            {/* Nom du modèle */}
            <h1 className="text-2xl font-bold text-gray-800 text-center">{model.name}</h1>

            {/* Description */}
            <p className="text-gray-600 mt-4 text-center">
              {model.description || "Aucune description disponible."}
            </p>

            {/* Réseaux sociaux */}
            {model.socialMedia.length > 0 && (
              <>
                <h2 className="text-lg font-semibold text-gray-800 mt-6">Réseaux sociaux</h2>
                <div className="flex justify-center space-x-4 mt-4">
                  {model.socialMedia.map((social, index) => {
                    const socialIcon = getSocialIcon(social.platform); // Function to get social media icons
                    return (
                      <a
                        key={index}
                        href={social.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:opacity-80 transition"
                      >
                        <img
                          src={socialIcon}
                          alt={social.platform}
                          className="w-10 h-10"
                          title={social.platform}
                        />
                      </a>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ) : (
          <p>Aucun détail disponible pour ce modèle.</p>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Confirmer la suppression</h2>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer ce modèle ? Cette action est irréversible.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteModel}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}

function getSocialIcon(platform: string): string {
  switch (platform) {
    case "TikTok":
      return "/icons/tiktok.svg";
    case "X":
      return "/icons/x.svg";
    case "Threads":
      return "/icons/threads.svg";
    case "Bluesky":
      return "/icons/bluesky.svg";
    default:
      return "/icons/default.svg";
  }
}
