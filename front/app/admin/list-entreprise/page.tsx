"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "@/components/DashboardLayout";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminCompanyList() {
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get("http://localhost:5001/api/company/admin/companies", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCompanies(response.data);
      } catch (err) {
        setError("Erreur lors de la récupération des entreprises.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  // Handle status change
  const handleStatusChange = async (companyId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5001/api/company/admin/statut/${companyId}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCompanies((prev) =>
        prev.map((company) =>
          company._id === companyId ? { ...company, status: newStatus } : company
        )
      );
    } catch (err) {
      setError("Erreur lors de la mise à jour du statut.");
    }
  };

  // Handle delete company
  const handleDeleteCompany = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5001/api/company/admin/${selectedCompany._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCompanies((prev) => prev.filter((company) => company._id !== selectedCompany._id));
      setShowModal(false);
    } catch (err) {
      setError("Erreur lors de la suppression de l'entreprise.");
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <DashboardLayout>
      <main className="flex-grow bg-gray-100 p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Gestion des Entreprises</h1>
        <div className="bg-white shadow-lg rounded-lg p-6">
          {companies.length === 0 ? (
            <p className="text-gray-600">Aucune entreprise trouvée.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-4 py-2 text-left">Nom</th>
                  <th className="border px-4 py-2 text-left">Statut</th>
                  <th className="border px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company._id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{company.name}</td>
                    <td className="border px-4 py-2">
                      <select
                        value={company.status}
                        onChange={(e) => handleStatusChange(company._id, e.target.value)}
                        className="block w-full appearance-none bg-white p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-200"
                      >
                        <option value="Ouverte">Ouverte</option>
                        <option value="Fermée">Fermée</option>
                        <option value="En cours de vérification">En cours de vérification</option>
                      </select>

                    </td>
                    <td className="border px-4 py-2 space-x-2">
                      <button
                        onClick={() => window.location.href = `/admin/companies/${company._id}`}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                      >
                        Voir Plus
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCompany(company);
                          setShowModal(true);
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Confirmation</h2>
              <p>Êtes-vous sûr de vouloir supprimer l'entreprise "{selectedCompany?.name}" ?</p>
              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteCompany}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
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
