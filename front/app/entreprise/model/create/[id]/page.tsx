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
  const { id } = useParams(); // Récupère l'ID de l'entreprise depuis l'URL
  const [user, setUser] = useState<User | null>(null);
  const [currentStep, setCurrentStep] = useState(1); // Étape actuelle
  const [name, setName] = useState("");
  const [socialMedia, setSocialMedia] = useState<{ platform: string; link: string }[]>([]);
  const [description, setDescription] = useState("");
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

  // Gestion de la soumission finale
  const handleSubmit = async () => {
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
          companyId: id,
          socialMedia,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setSuccessMessage("Modèle créé avec succès !");
      router.push(`/entreprise/details/${id}`); // Rediriger après création
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la création du modèle.");
    }
  };

  // Gestion des étapes
  const nextStep = () => {
    if (currentStep === 1 && !name) return setError("Le nom est requis.");
    if (currentStep === 2 && socialMedia.some((media) => !validateURL(media.link))) {
      return setError("Un ou plusieurs liens entrés ne sont pas valides.");
    }
    if (currentStep === 2 && socialMedia.length === 0)
      return setError("Ajoutez au moins un réseau social.");
    setError(""); // Réinitialiser les erreurs
    setCurrentStep((prev) => prev + 1);
  };

  const previousStep = () => {
    setError(""); // Réinitialiser les erreurs
    setCurrentStep((prev) => prev - 1);
  };

  // Ajouter un réseau social
  const addSocialMediaField = () => {
    setSocialMedia([...socialMedia, { platform: "", link: "" }]);
  };

  // Supprimer un réseau social
  const removeSocialMediaField = (index: number) => {
    setSocialMedia(socialMedia.filter((_, i) => i !== index));
  };

  // Mettre à jour un réseau social
  const updateSocialMediaField = (index: number, key: "platform" | "link", value: string) => {
    const updatedSocialMedia = [...socialMedia];
    updatedSocialMedia[index][key] = value;
    setSocialMedia(updatedSocialMedia);
  };

  // Validation des URL
  const validateURL = (url: string): boolean => {
    const regex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)([\/\w-]*)*$/;
    return regex.test(url);
  };

  if (!user) return <LoadingSpinner />;

  return (
    <DashboardLayout>
      <main className="flex-grow bg-gray-100 flex items-center justify-center">
        <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-lg">
          <h1 className="text-xl font-bold mb-4">Créer un Modèle</h1>

          {/* Affichage des erreurs */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          )}

          {/* Affichage du message de succès */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
              {successMessage}
            </div>
          )}

          {/* Étape actuelle */}
          <div className="mb-6">
            <p className="text-gray-600 text-sm">
              Étape {currentStep} sur 3
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div
                className={`bg-blue-500 h-2.5 rounded-full`}
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Étape : Nom */}
          {currentStep === 1 && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                Nom du modèle
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
          )}

          {/* Étape : Réseaux sociaux */}
          {currentStep === 2 && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">Réseaux sociaux</label>
              {socialMedia.map((media, index) => (
                <div key={index} className="flex items-center space-x-4 mb-2">
                  {/* Sélection de la plateforme */}
                  <select
                    value={media.platform}
                    onChange={(e) =>
                      updateSocialMediaField(index, "platform", e.target.value)
                    }
                    className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none bg-white"
                    style={{
                      backgroundImage:
                        "url('data:image/svg+xml;utf8,<svg fill=\"%23999\" height=\"20\" viewBox=\"0 0 24 24\" width=\"20\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>')",
                      backgroundRepeat: 'no-repeat',
                      backgroundPositionX: 'calc(100% -12px)',
                      backgroundPositionY: 'center',
                    }}
                    required
                  >
                    <option value="">Sélectionnez une plateforme</option>
                    <option value="TikTok">TikTok</option>
                    <option value="X">X</option>
                    <option value="Threads">Threads</option>
                    <option value="Bluesky">Bluesky</option>
                  </select>

                  {/* Lien */}
                  <input
                    type="url"
                    placeholder="Lien"
                    value={media.link}
                    onChange={(e) =>
                      updateSocialMediaField(index, "link", e.target.value)
                    }
                    className={`w-full border ${validateURL(media.link) ? "border-gray-300" : "border-red-500"
                      } rounded-md p-2`}
                    required
                  />

                  {/* Supprimer */}
                  <button
                    type="button"
                    onClick={() => removeSocialMediaField(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Supprimer
                  </button>
                </div>
              ))}
              {/* Ajouter un réseau social */}
              <button
                type="button"
                onClick={addSocialMediaField}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Ajouter un réseau social
              </button>
            </div>
          )}

          {/* Étape : Description */}
          {currentStep === 3 && (
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                Description du modèle
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              ></textarea>
            </div>
          )}

          {/* Boutons de navigation */}
          <div className="flex justify-between mt-6">
            {currentStep > 1 && (
              <button
                onClick={previousStep}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Précédent
              </button>
            )}
            {currentStep < 3 ? (
              <button
                onClick={nextStep}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Suivant
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Soumettre
              </button>
            )}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
}