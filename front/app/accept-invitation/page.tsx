"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "next/navigation";

export default function AcceptInvitation() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [company, setCompany] = useState(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const res = await axios.post(
          "http://localhost:5001/api/company/get-invitation-details",
          { token }
        );
        setCompany(res.data.company);
      } catch (err) {
        setError("Impossible de récupérer les détails de l'entreprise.");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchCompanyDetails();
  }, [token]);

  const handleResponse = async (response) => {
    try {
      const res = await axios.post("http://localhost:5001/api/company/respond-invitation", {
        token,
        response,
      });
      setResponseMessage(res.data.message);
    } catch (error) {
      setResponseMessage(error.response?.data?.message || "Erreur lors du traitement.");
    }
  };

  if (loading) return <p className="text-center mt-10">Chargement...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-3xl w-full">
        {responseMessage ? (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-green-600 mb-4">Merci !</h1>
            <p>{responseMessage}</p>
          </div>
        ) : (
          <>
            <h1 className="text-3xl font-bold text-blue-700 mb-4">Invitation à rejoindre {company.name}</h1>
            <p className="text-gray-600 mb-6">Voici les détails de l'entreprise :</p>

            {/* Détails de l'entreprise */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <p><strong>Nom :</strong> {company.name}</p>
                <p><strong>Lieu :</strong> {company.location}</p>
                <p><strong>CA Moyen :</strong> €{new Intl.NumberFormat().format(company.averageRevenue)}</p>
                <p><strong>Email Contact :</strong> {company.contactEmail}</p>
              </div>
              <div>
                <p><strong>SIREN :</strong> {company.siren}</p>
                <p><strong>Type :</strong> {company.companyType}</p>
                {company.customActivity && (
                  <p><strong>Activité Personnalisée :</strong> {company.customActivity}</p>
                )}
              </div>
            </div>

            {/* Boutons pour répondre */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleResponse("Accepted")}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300"
              >
                Accepter
              </button>
              <button
                onClick={() => handleResponse("Declined")}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
              >
                Refuser
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
