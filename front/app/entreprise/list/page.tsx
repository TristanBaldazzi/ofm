"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function CompanyList() {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get("http://localhost:5001/api/company/companies", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const companiesData = response.data;

        setCompanies(companiesData);
        setFilteredCompanies(companiesData);
      } catch (err) {
        setError("Erreur lors de la récupération des entreprises.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  // Filtrage et tri des entreprises
  useEffect(() => {
    let filtered = companies;

    // Filtrer par statut
    if (filterStatus !== "all") {
      filtered = companies.filter(company => company.status === filterStatus);
    }

    // Trier par date
    filtered.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    setFilteredCompanies(filtered);
  }, [filterStatus, sortOrder, companies]);

  const handleViewDetails = (companyId) => {
    router.push(`/entreprise/details/${companyId}`);
  };

  const handleCreateCompany = () => {
    router.push("/entreprise/create");
  };

  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout>
      <main className="flex-grow bg-gray-100 flex flex-col items-center justify-start p-6 min-h-screen">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-4xl w-full relative">
          {/* Titre et bouton */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Liste des Entreprises</h1>
            <button
              onClick={handleCreateCompany}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
            >
              Création entreprise
            </button>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {/* Filtres */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtrer par statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Filtrer par statut :</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none bg-white"
                style={{
                  backgroundImage:
                    "url('data:image/svg+xml;utf8,<svg fill=\"%23999\" height=\"20\" viewBox=\"0 0 24 24\" width=\"20\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>')",
                  backgroundRepeat: 'no-repeat',
                  backgroundPositionX: 'calc(100% -12px)',
                  backgroundPositionY: 'center',
                }}
              >
                <option value="all">Tous les statuts</option>
                <option value="En cours de vérification">En cours de vérification</option>
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
              </select>
            </div>

            {/* Trier par date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trier par :</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none bg-white"
                style={{
                  backgroundImage:
                    "url('data:image/svg+xml;utf8,<svg fill=\"%23999\" height=\"20\" viewBox=\"0 0 24 24\" width=\"20\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>')",
                  backgroundRepeat: 'no-repeat',
                  backgroundPositionX: 'calc(100% -12px)',
                  backgroundPositionY: 'center',
                }}
              >
                <option value="desc">Plus récent au plus ancien</option>
                <option value="asc">Plus ancien au plus récent</option>
              </select>
            </div>
          </div>

          {/* Liste des entreprises */}
          {filteredCompanies.length === 0 ? (
            <p className="text-gray-600 text-center py-4">Aucune entreprise trouvée.</p>
          ) : (
            <ul className="space-y-4 max-h-[400px] overflow-y-auto pt-[10px]">
              {filteredCompanies.map((company) => (
                <li key={company._id} className="relative border p-4 rounded-lg shadow-sm hover:shadow-md transition">
                  {/* Badge pour le statut en haut à gauche */}
                  <span
                    className={`absolute -top-[10px] left-[10px] px-3 py-[2px] rounded-full text-white text-xs font-bold ${
                      company.status === "Actif"
                        ? "bg-green-500"
                        : company.status === "Inactif"
                        ? "bg-red-500"
                        : "bg-yellow-500"
                    }`}
                  >
                    {company.status}
                  </span>

                  {/* Contenu principal */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-medium text-gray-800">{company.name}</h2>
                      {/* Date de création formatée */}
                      <p className="mt-1 text-sm text-gray-600 flex items-center">
                        📅 Créé le {new Date(company.createdAt).toLocaleDateString()} à {new Date(company.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    {/* Bouton pour voir les détails */}
                    <button
                      onClick={() => handleViewDetails(company._id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                    >
                      Voir plus
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
