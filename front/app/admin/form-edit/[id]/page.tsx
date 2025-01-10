"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { SketchPicker } from "react-color"; // Pour le color picker (npm install react-color)
import DashboardLayout from "@/components/DashboardLayout";
import LoadingSpinner from "@/components/LoadingSpinner";
import { useParams } from "next/navigation";

export default function FormDetail() {
  const { id } = useParams();
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditingColors, setIsEditingColors] = useState(false); // État pour le mode édition
  const [theme, setTheme] = useState({}); // État local pour les couleurs

  // Récupération des détails du formulaire
  useEffect(() => {
    if (!id) return;

    const fetchFormDetails = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(`http://localhost:5001/api/form/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm(response.data);
        setTheme(response.data.details.theme); // Initialiser le thème
      } catch (err) {
        setError("Erreur lors de la récupération des détails du formulaire.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormDetails();
  }, [id]);

  // Mise à jour des couleurs
  const handleColorChange = (color, key) => {
    setTheme((prev) => ({ ...prev, [key]: color.hex }));
  };

  // Sauvegarde des modifications de couleur
  const saveThemeChanges = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5001/api/form/${id}/update-theme`,
        { theme },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Thème mis à jour avec succès !");
      setIsEditingColors(false);
    } catch (err) {
      console.error("Erreur lors de la mise à jour du thème :", err);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500 text-center mt-6">{error}</p>;

  return (
    <DashboardLayout>
      <main className="flex-grow">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Détails du Formulaire
        </h1>

        <div className="relative bg-white shadow-md rounded-lg p-8 max-w-4xl mx-auto">
          {/* Badge semi-flottant pour le total des réponses */}
          {form && (
            <div className="absolute -top-4 -right-4 bg-blue-600 text-white text-sm font-semibold py-2 px-4 rounded-full shadow-lg z-10">
              Total réponses : {form.responses.length}
            </div>
          )}

          {form && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-gray-700">
                  {form.details.title}
                </h2>
                <p className="text-gray-600 mt-2">{form.details.description}</p>
              </div>

              {/* Champs du formulaire */}
              <section className="mb-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Champs du Formulaire</h3>
                <div className="space-y-6">
                  {form.details.fields.map((field, index) => (
                    <div
                      key={index}
                      className="p-6 bg-white rounded-lg shadow-md border border-gray-200"
                    >
                      {/* En-tête avec icône et label */}
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-gray-800">{field.label}</h4>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${field.required ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500"
                            }`}
                        >
                          {field.required ? "Obligatoire" : "Optionnel"}
                        </span>
                      </div>

                      {/* Informations détaillées */}
                      <div className="text-sm text-gray-600 space-y-2">
                        <p>
                          <strong>Type :</strong> {field.type}
                        </p>
                        {field.options.length > 0 && (
                          <p>
                            <strong>Options :</strong> {field.options.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Section Thème */}
              <section className="mb-8">
                <h3 className="text-xl font-semibold text-gray-700 mb-4">Thème</h3>
                {!isEditingColors ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Object.entries(theme).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex flex-col items-center bg-gray-50 p-4 rounded-lg shadow-sm border"
                      >
                        <div
                          className="w-12 h-12 rounded-full mb-2 border border-black"
                          style={{ backgroundColor: value }}
                        ></div>
                        <p className="text-sm font-medium text-gray-700">{key}</p>
                        <p className="text-xs text-gray-500">{value}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.keys(theme).map((key) => (
                      <div key={key}>
                        <label className="block text-sm font-medium capitalize mb-2">
                          {key.replace(/([A-Z])/g, " $1")} :
                        </label>
                        <SketchPicker
                          color={theme[key]}
                          onChange={(color) => handleColorChange(color, key)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </section>


              {/* Boutons */}
              {!isEditingColors ? (
                <button
                  onClick={() => setIsEditingColors(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200"
                >
                  Modifier les couleurs
                </button>
              ) : (
                <>
                  <button
                    onClick={saveThemeChanges}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200 mr-4"
                  >
                    Sauvegarder
                  </button>
                  <button
                    onClick={() => setIsEditingColors(false)}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200"
                  >
                    Annuler
                  </button>
                </>
              )}
              {/* Réponses */}
              {form.responses.length > 0 && (
                <section>
                  <h3 className="text-xl font-semibold text-gray-700 mb-4">Réponses</h3>
                  <div className="space-y-4">
                    {form.responses.map((response, index) => (
                      <div
                        key={index}
                        className="border p-6 rounded-lg bg-gray-50"
                      >
                        <p><strong>ID Réponse :</strong> {response.responseId}</p>
                        {response.formData.map((data, idx) => (
                          <div key={idx}>
                            <p><strong>{data.fieldLabel} :</strong> {data.response}</p>
                          </div>
                        ))}
                        <p className="text-sm text-gray-500 mt-2">

                          📅 {new Date(response.submittedAt).toLocaleDateString()} à{" "}
                          {new Date(response.submittedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>

          )}
        </div>

        {/* Bouton Retour */}
        <button
          onClick={() => window.history.back()}
          className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200 mx-auto block"
        >
          Retour à la liste des entreprises
        </button>
      </main>
    </DashboardLayout>
  );
}
