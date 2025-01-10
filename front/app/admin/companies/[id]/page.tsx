"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import DashboardLayout from "@/components/DashboardLayout";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function CompanyDetails() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false); // État pour basculer entre vue et édition
  const [formData, setFormData] = useState({}); // Données du formulaire

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:5001/api/company/admin/entreprise/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCompany(response.data);
        setFormData(response.data); // Pré-remplit le formulaire
      } catch (err) {
        setError("Erreur lors de la récupération des détails de l'entreprise.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyDetails();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5001/api/company/admin/entreprise/${id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCompany(formData); // Met à jour les données affichées
      setIsEditing(false); // Quitte le mode édition
    } catch (err) {
      setError("Erreur lors de la mise à jour de l'entreprise.");
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <DashboardLayout>
      <main className="flex-grow bg-gray-100 p-6">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-4xl font-extrabold mb-6 text-gray-800">
            {isEditing ? "Modifier l'entreprise" : "Détails de l'entreprise"}
          </h1>

          {/* Vue ou formulaire d'édition */}
          {!isEditing ? (
            <>
              {/* Affichage des détails */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-3">Informations générales</h3>
                  <ul className="space-y-2">
                    <li><strong>Nom :</strong> {company.name}</li>
                    <li><strong>Localisation :</strong> {company.location}</li>
                    <li><strong>SIREN :</strong> {company.siren}</li>
                    <li><strong>Activité personnalisée :</strong> {company.customActivity}</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-600 mb-3">Contact</h3>
                  <ul className="space-y-2">
                    <li><strong>Email :</strong> {company.contactEmail}</li>
                    <li><strong>Téléphone :</strong> {company.phoneNumber || "Non spécifié"}</li>
                  </ul>
                </div>
              </div>

              {/* Bouton pour activer le mode édition */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition"
                >
                  Modifier les informations
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Formulaire d'édition */}
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nom */}
                <label className="block">
                  Nom :
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded"
                  />
                </label>

                {/* Localisation */}
                <label className="block">
                  Localisation :
                  <input
                    type="text"
                    name="location"
                    value={formData.location || ""}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded"
                  />
                </label>

                {/* SIREN */}
                <label className="block">
                  SIREN :
                  <input
                    type="text"
                    name="siren"
                    value={formData.siren || ""}
                    onChange={handleInputChange}
                    maxLength={9}
                    className="w-full mt-1 p-2 border rounded"
                  />
                </label>

                {/* Activité personnalisée */}
                <label className="block">
                  Activité personnalisée :
                  <input
                    type="text"
                    name="customActivity"
                    value={formData.customActivity || ""}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded"
                  />
                </label>

                {/* Email */}
                <label className="block col-span-full">
                  Email de contact :
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail || ""}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded"
                  />
                </label>

                {/* Téléphone */}
                <label className="block col-span-full">
                  Téléphone :
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber || ""}
                    onChange={handleInputChange}
                    className="w-full mt-1 p-2 border rounded"
                  />
                </label>
              </form>

              {/* Boutons d'action */}
              <div className="mt-6 flex justify-end space-x-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition"
                >
                  Sauvegarder les modifications
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
