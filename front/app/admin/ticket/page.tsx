"use client";
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminTicketList() {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterUser, setFilterUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Récupérer les données
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Récupérer tous les tickets
        const ticketResponse = await axios.get(
          "http://localhost:5001/api/admin/tickets",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setTickets(ticketResponse.data);
        setFilteredTickets(ticketResponse.data);

        // Récupérer tous les utilisateurs
        const userResponse = await axios.get(
          "http://localhost:5001/api/admin/users",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setUsers(userResponse.data);
      } catch (err) {
        setError("Erreur lors de la récupération des données.");
      }
    };
    fetchData();
  }, []);

  // Filtrer les tickets
  useEffect(() => {
    let filtered = tickets;
    if (filterStatus !== "all") {
      filtered = filtered.filter((ticket) => ticket.status === filterStatus);
    }
    if (filterUser) {
      filtered = filtered.filter(
        (ticket) => ticket.user.email === filterUser.email
      );
    }
    setFilteredTickets(filtered);
  }, [filterStatus, filterUser, tickets]);

  // Calculer le nombre de tickets ouverts et fermés
  const ticketCounts = useMemo(() => {
    const openTickets = tickets.filter((ticket) => ticket.status === "open")
      .length;
    const closedTickets = tickets.filter((ticket) => ticket.status === "closed")
      .length;
    return { open: openTickets, closed: closedTickets };
  }, [tickets]);

  const handleViewDetails = (ticketId) => {
    router.push(`/tickets/details/${ticketId}`);
  };

  if (!tickets.length && !error) return <LoadingSpinner />;

  return (
    <DashboardLayout>
      <main className="flex-grow bg-gray-100 flex flex-col items-center justify-start p-6 min-h-screen">
        {/* Rectangle des filtres */}
        <div className="bg-white shadow-md rounded-lg p-4 w-full max-w-4xl mb-6">
          <h1 className="text-2xl font-bold mb-4 text-gray-800">
            Gestion des Tickets
          </h1>
          {error && <p className="text-red-500 mb-4">{error}</p>}

          {/* Section des statistiques */}
          <div className="flex justify-end items-center space-x-4 mb-6">
            <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-lg shadow-sm">
              <span className="font-bold text-lg">{ticketCounts.open}</span>
              <span className="text-sm">Ouverts</span>
            </div>
            <div className="flex items-center space-x-2 bg-red-100 text-red-800 px-4 py-2 rounded-lg shadow-sm">
              <span className="font-bold text-lg">{ticketCounts.closed}</span>
              <span className="text-sm">Fermés</span>
            </div>
          </div>

          {/* Filtres */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtre par statut */}<div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrer par statut :
              </label>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="block w-full appearance-none bg-white p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-200"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="open">Ouvert</option>
                  <option value="closed">Fermé</option>
                </select>
                <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                  ▼
                </span>
              </div>
            </div>

            {/* Filtre par utilisateur */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filtrer par utilisateur :
              </label>
              {!filterUser ? (
                <>
                  <input
                    type="text"
                    placeholder="Rechercher un utilisateur..."
                    value={searchUser}
                    onChange={(e) => setSearchUser(e.target.value)}
                    className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  {searchUser && (
                    <ul className="absolute z-10 bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-40 overflow-y-auto w-full">
                      {users
                        .filter((user) =>
                          user.email
                            .toLowerCase()
                            .includes(searchUser.toLowerCase())
                        )
                        .map((user) => (
                          <li
                            key={user._id}
                            onClick={() => {
                              setFilterUser(user);
                              setSearchUser("");
                            }}
                            className="px-4 py-2 hover:bg-indigo-100 cursor-pointer"
                          >
                            {user.email}
                          </li>
                        ))}
                    </ul>
                  )}
                </>
              ) : (
                <>
                  <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm font-medium">
                    {filterUser.email}
                  </span>
                  <button
                    onClick={() => setFilterUser(null)}
                    className="text-red-500 hover:text-red-700 transition"
                  >
                    &times;
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Rectangle des tickets */}
        <div
          className="bg-white shadow-md rounded-lg p-8 w-full max-w-4xl"
          style={{
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          {filteredTickets.length === 0 ? (
            <p className="text-gray-600">Aucun ticket trouvé.</p>
          ) : (
            <ul className="space-y-4">
              {filteredTickets.map((ticket) => (
                <li
                  key={ticket._id}
                  className="border p-4 rounded-lg shadow-sm hover:shadow-md transition"
                >
                  <h2 className="text-lg font-medium text-gray-800">
                    {ticket.title}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    Utilisateur : {ticket.user.email}
                  </p>
                  <button
                    onClick={() => handleViewDetails(ticket._id)}
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                  >
                    Voir plus
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
