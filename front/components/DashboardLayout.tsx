"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import LoadingSpinner from "./LoadingSpinner";

interface User {
  email: string;
  role: string;
  isVerified: boolean;
}

interface Company {
  id: string;
  name: string;
  status: "Ouverte" | "Fermée" | "En cours de vérification";
}

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showCompaniesDropdown, setShowCompaniesDropdown] = useState(false);
  const [showAdminsDropdown, setShowAdminDropdown] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndCompanies = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const userResponse = await axios.get("http://localhost:5001/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(userResponse.data);

        const companiesResponse = await axios.get("http://localhost:5001/api/company/companies", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCompanies(companiesResponse.data);
      } catch (err) {
        localStorage.removeItem("token");
        router.push("/login");
      }
    };

    fetchUserAndCompanies();
  }, [router]);

  useEffect(() => {
    if (!isSidebarOpen) {
      setShowCompaniesDropdown(false);
      setShowAdminDropdown(false);
    }
  }, [isSidebarOpen]);

  const getStatusColor = (status: Company["status"]) => {
    switch (status) {
      case "Ouverte":
        return "bg-green-500";
      case "Fermée":
        return "bg-red-500";
      case "En cours de vérification":
        return "bg-orange-500";
      default:
        return "bg-gray-400";
    }
  };

  if (!user) return <LoadingSpinner />;

  return (
    <div className="relative flex h-screen bg-blue-200">
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-gray-900 text-white transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-20"
          }`}
          onClick={() => !isSidebarOpen && setIsSidebarOpen(true)}
      >
        <button
          className="text-white p-4 focus:outline-none"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? "←" : "☰"}
        </button>

        <nav className="mt-10">
        <ul
            className={`space-y-4 ${
              isSidebarOpen ? "" : "pointer-events-none"
            }`} // Disable clicks when closed
          >
            {/* Accueil */}
            <li>
              <button
                onClick={() => router.push("/dashboard")}
                className={`block w-full text-left px-4 py-2 hover:bg-gray-700 rounded-md ${isSidebarOpen ? "opacity-100" : "opacity-0"
                  }`}
              >
                Accueil
              </button>
            </li>

            {/* Mes entreprises avec un bouton plus esthétique */}
            <li>
              <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-700 rounded-md cursor-pointer">
                <button
                  onClick={() => router.push("/entreprise/list")}
                  className={`text-left w-full ${isSidebarOpen ? "opacity-100" : "opacity-0"
                    }`}
                >
                  Mes entreprises
                </button>
                {isSidebarOpen && (
                  <button
                    onClick={() => setShowCompaniesDropdown(!showCompaniesDropdown)}
                    className={`ml-[6px] p-[6px] rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-transform duration-300 ${showCompaniesDropdown ? "rotate-180" : "rotate-0"
                      }`}
                    aria-label="Toggle dropdown"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Dropdown des entreprises */}
              <div
                className={`transition-all duration-300 overflow-hidden ${showCompaniesDropdown ? "max-h-[500px] mt-[10px]" : "max-h-0"
                  }`}
              >
                <ul className="bg-gray-800 rounded-lg shadow-lg w-full z-[50] overflow-hidden border-t border-gray-700 pl-[16px]">
                  {companies.length > 0 ? (
                    companies.map((company) => (
                      <li key={company._id} className="hover:bg-gray-600 flex items-center px-4 py-2 relative">
                        {/* Branche visuelle */}
                        <span className="absolute left-[8px] top-[50%] transform -translate-y-[50%] w-[2px] h-full bg-gray-600"></span>
                        <span className="absolute left-[8px] top-[50%] transform -translate-y-[50%] w-[12px] h-[2px] bg-gray-600"></span>

                        {/* Contenu de l'entreprise */}
                        <div className="ml-[24px] flex justify-between items-center w-full">
                          <button
                            onClick={() => router.push(`/entreprise/details/${company._id}`)}
                            className="block text-left text-white hover:text-blue-300"
                          >
                            {company.name}
                          </button>
                          {/* Pastille de statut */}
                          <span
                            className={`w-[12px] h-[12px] rounded-full ${getStatusColor(
                              company.status
                            )}`}
                          ></span>
                        </div>
                      </li>
                    ))
                  ) : (
                    <li>
                      <p className="px-4 py-2 text-gray-400">Aucune entreprise disponible</p>
                    </li>
                  )}
                </ul>
              </div>
            </li>

            {/* Autres liens */}
            <li>
              <button
                onClick={() => router.push("/tickets/list")}
                className={`block w-full text-left px-4 py-2 hover:bg-gray-700 rounded-md ${isSidebarOpen ? "opacity-100" : "opacity-0"
                  }`}
              >
                Mes tickets
              </button>
            </li>
            {user.role === "Admin" && (
              <li>
                <div className="flex items-center justify-between px-4 py-2 hover:bg-gray-700 rounded-md cursor-pointer">
                  <button
                    onClick={() => router.push("/admin")}
                    className={`text-left w-full ${isSidebarOpen ? "opacity-100" : "opacity-0"
                      }`}
                  >
                    Administration
                  </button>
                  {isSidebarOpen && (
                    <button
                      onClick={() => setShowAdminDropdown(!showAdminsDropdown)}
                      className={`ml-[6px] p-[6px] rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-transform duration-300 ${showCompaniesDropdown ? "rotate-180" : "rotate-0"
                        }`}
                      aria-label="Toggle dropdown"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.293 9.293a1 1 0 011.414 0L10 12.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Dropdown des entreprises */}
                <div
                  className={`transition-all duration-300 overflow-hidden ${showAdminsDropdown ? "max-h-[500px] mt-[10px]" : "max-h-0"
                    }`}
                >
                  <ul className="bg-gray-800 rounded-lg shadow-lg w-full z-[50] overflow-hidden border-t border-gray-700 pl-[16px]">
                    <li className="hover:bg-gray-600 flex items-center px-4 py-2 relative">
                      {/* Branche visuelle */}
                      <span className="absolute left-[8px] top-[50%] transform -translate-y-[50%] w-[2px] h-full bg-gray-600"></span>
                      <span className="absolute left-[8px] top-[50%] transform -translate-y-[50%] w-[12px] h-[2px] bg-gray-600"></span>

                      {/* Contenu de l'entreprise */}
                      <div className="ml-[24px] flex justify-between items-center w-full">
                        <button
                          onClick={() => router.push(`/admin/manage-user`)}
                          className="block text-left text-white hover:text-blue-300"
                        >
                          Gestion des utilisateurs
                        </button>
                      </div>
                    </li>
                    <li className="hover:bg-gray-600 flex items-center px-4 py-2 relative">
                      {/* Branche visuelle */}
                      <span className="absolute left-[8px] top-[50%] transform -translate-y-[50%] w-[2px] h-full bg-gray-600"></span>
                      <span className="absolute left-[8px] top-[50%] transform -translate-y-[50%] w-[12px] h-[2px] bg-gray-600"></span>

                      {/* Contenu de l'entreprise */}
                      <div className="ml-[24px] flex justify-between items-center w-full">
                        <button
                          onClick={() => router.push(`/admin/ticket`)}
                          className="block text-left text-white hover:text-blue-300"
                        >
                          Gestion tickets
                        </button>
                      </div>
                    </li>
                    <li className="hover:bg-gray-600 flex items-center px-4 py-2 relative">
                      {/* Branche visuelle */}
                      <span className="absolute left-[8px] top-[50%] transform -translate-y-[50%] w-[2px] h-full bg-gray-600"></span>
                      <span className="absolute left-[8px] top-[50%] transform -translate-y-[50%] w-[12px] h-[2px] bg-gray-600"></span>

                      {/* Contenu de l'entreprise */}
                      <div className="ml-[24px] flex justify-between items-center w-full">
                        <button
                          onClick={() => router.push(`/admin/list-entreprise`)}
                          className="block text-left text-white hover:text-blue-300"
                        >
                          Gestion des entreprises
                        </button>
                      </div>
                    </li>
                    <li className="hover:bg-gray-600 flex items-center px-4 py-2 relative">
                      {/* Branche visuelle */}
                      <span className="absolute left-[8px] top-[50%] transform -translate-y-[50%] w-[2px] h-full bg-gray-600"></span>
                      <span className="absolute left-[8px] top-[50%] transform -translate-y-[50%] w-[12px] h-[2px] bg-gray-600"></span>

                      {/* Contenu de l'entreprise */}
                      <div className="ml-[24px] flex justify-between items-center w-full">
                        <button
                          onClick={() => router.push(`/admin/list-form`)}
                          className="block text-left text-white hover:text-blue-300"
                        >
                          Gestion des formulaire
                        </button>
                      </div>
                    </li>
                  </ul>
                </div>
              </li>
            )}
            <li>
              <button
                onClick={() => router.push("/user/settings")}
                className={`block w-full text-left px-4 py-2 hover:bg-gray-700 rounded-md ${isSidebarOpen ? "opacity-100" : "opacity-0"
                  }`}
              >
                Paramètres
              </button>
            </li>

            {/* Déconnexion */}
            <li>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  router.push("/login");
                }}
                className={`block w-full text-left px-4 py-2 hover:bg-red-600 rounded-md ${isSidebarOpen ? "opacity-100" : "opacity-0"
                  }`}
              >
                Déconnexion
              </button>
            </li>
          </ul>
        </nav>
      </div>
      <main
    className={`flex-grow bg-gray-100 p-6 transition-all duration-300 overflow-auto ${
      isSidebarOpen ? "ml-[16rem]" : "ml-[5rem]"
    }`}
    style={{ paddingTop: "4rem", paddingBottom: "4rem"}} // Utilisation de minHeight
  >
    {children}
  </main>

    </div>
  );
};

export default DashboardLayout;
