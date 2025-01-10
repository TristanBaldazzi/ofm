"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { SketchPicker } from "react-color"; // Pour le color picker (npm install react-color)
import DashboardLayout from "@/components/DashboardLayout";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminFormManager() {
  const [companies, setCompanies] = useState([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [formDetails, setFormDetails] = useState({
    title: "",
    description: "",
    theme: {
      bg: "#f9f9f9",
      vibrant: "#2c3e50",
      vibrantDarker: "#1a242f",
      text: "#333333",
      textSubmitButton: "#ffffff",
      label: "#7f8c8d",
      border: "#bdc3c7",
    },
    fields: [],
  });
  const [newField, setNewField] = useState({
    label: "",
    type: "text",
    options: [],
    required: false,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Récupération des entreprises
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5001/api/company/admin/companies",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCompanies(response.data);
      } catch (err) {
        console.log(err);
        setError("Erreur lors de la récupération des entreprises.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  // Gestion des couleurs
  const handleColorChange = (color, key) => {
    setFormDetails((prev) => ({
      ...prev,
      theme: { ...prev.theme, [key]: color.hex },
    }));
  };

  // Ajouter un champ
  const addField = () => {
    if (!newField.label || !newField.type) {
      alert("Le champ doit avoir un label et un type.");
      return;
    }
    setFormDetails((prev) => ({
      ...prev,
      fields: [...prev.fields, { ...newField }],
    }));
    console.log("Champ ajouté :", newField);
  };

  // Soumettre le formulaire
  const handleSubmit = async () => {
    if (!selectedCompanyId) {
      alert("Veuillez sélectionner une entreprise.");
      return;
    }
    if (!formDetails.title || !formDetails.description) {
      alert("Veuillez remplir le titre et la description du formulaire.");
      return;
    }
    if (formDetails.fields.length === 0) {
      alert("Veuillez ajouter au moins un champ au formulaire.");
      return;
    }

    console.log("Données envoyées :", formDetails);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5001/api/form/create",
        { companyId: selectedCompanyId, details: formDetails },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Réponse serveur :", response.data);
      alert("Formulaire créé avec succès !");
    } catch (err) {
      console.error("Erreur lors de la création du formulaire :", err);
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <DashboardLayout>
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-3xl bg-white shadow-xl rounded-lg p-8 mb-10">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Créer un Formulaire
          </h1>

          {/* Sélection d'une entreprise */}
          <div className="mb-6">
            <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
              Sélectionner une entreprise :
            </label>
            <select
              id="company"
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              className="border border-gray-300 p-3 rounded w-full"
            >
              <option value="">-- Sélectionner --</option>
              {companies.map((company) => (
                <option key={company._id} value={company._id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>

          {/* Détails du formulaire */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Titre du formulaire :</label>
            <input
              type="text"
              value={formDetails.title}
              onChange={(e) =>
                setFormDetails((prev) => ({ ...prev, title: e.target.value }))
              }
              className="border border-gray-300 p-3 rounded w-full"
            />
            <label className="block mt-4 text-sm font-medium text-gray-700 mb-2">Description :</label>
            <textarea
              value={formDetails.description}
              onChange={(e) =>
                setFormDetails((prev) => ({ ...prev, description: e.target.value }))
              }
              className="border border-gray-300 p-3 rounded w-full"
            />
          </div>

          {/* Gestion des couleurs */}
          <h2 className="text-lg font-bold text-gray-800 mb-4">Thème du formulaire</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(formDetails.theme).map((key) => (
              <div key={key} className="mb-4">
                <label className="block text-sm font-medium capitalize mb-2">
                  {key.replace(/([A-Z])/g, " $1")} :
                </label>
                <SketchPicker
                  color={formDetails.theme[key]}
                  onChange={(color) => handleColorChange(color, key)}
                  width={150}
                />
              </div>
            ))}
          </div>

          {/* Champs */}
          <h2 className="text-lg font-bold text-gray-800 mt-6 mb-4">Champs du formulaire</h2>
          <div className="mb-6">
            {/* Ajouter un champ */}
            <input
              type="text"
              placeholder="Label du champ"
              value={newField.label}
              onChange={(e) =>
                setNewField((prev) => ({ ...prev, label: e.target.value }))
              }
              className="border border-gray-300 p-3 rounded w-full mb-3"
            />
            <select
              value={newField.type}
              onChange={(e) =>
                setNewField((prev) => ({ ...prev, type: e.target.value }))
              }
              className="border border-gray-300 p-3 rounded w-full mb-3"
            >
              <option value="text">Texte</option>
              <option value="textarea">Zone de texte</option>
              <option value="select">Liste déroulante</option>
              <option value="checkbox">Case à cocher</option>
              <option value="radio">Bouton radio</option>
            </select>

            {(newField.type === "select" || newField.type === "radio") && (
              <textarea
                placeholder="Options (séparées par une virgule)"
                value={newField.options.join(",")}
                onChange={(e) =>
                  setNewField((prev) => ({
                    ...prev,
                    options: e.target.value.split(","),
                  }))
                }
                className="border border-gray-300 p-3 rounded w-full mb-3"
              />
            )}
            <label className="inline-flex items-center text-sm">
              <input
                type="checkbox"
                checked={newField.required}
                onChange={(e) =>
                  setNewField((prev) => ({ ...prev, required: e.target.checked }))
                }
                className="mr-2"
              />
              Obligatoire ?
            </label>
            <button
              onClick={addField}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mt-4 w-full"
            >
              Ajouter le champ
            </button>
          </div>

          {/* Liste des champs ajoutés */}
          {formDetails.fields.length > 0 && (
            <>
              <h3 className="text-md font-bold text-gray-800 mb-3">Champs ajoutés :</h3>
              <ul className="list-disc pl-5 text-sm">
                {formDetails.fields.map((field, index) => (
                  <li key={index}>
                    {field.label} - {field.type}{" "}
                    {field.required ? "(Obligatoire)" : ""}
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Enregistrer le formulaire */}
          <button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded mt-6 w-full"
          >
            Enregistrer le formulaire
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
