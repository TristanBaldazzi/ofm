"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function TicketList() {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get("http://localhost:5001/api/tickets", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ticketsData = response.data;

        setTickets(ticketsData);
        setFilteredTickets(ticketsData);
      } catch (err) {
        setError("Erreur lors de la récupération des tickets.");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  useEffect(() => {
    let filtered = tickets;

    if (filterStatus !== "all") {
      filtered = tickets.filter(ticket => ticket.status === filterStatus);
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

    setFilteredTickets(filtered);
  }, [filterStatus, sortOrder, tickets]);

  const handleViewDetails = (ticketId) => {
    router.push(`/tickets/details/${ticketId}`);
  };

  const handleCreateTicket = () => {
    router.push("/tickets/create");
  };

  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout>
      <main className="flex-grow bg-gray-100 flex flex-col items-center justify-start p-6 min-h-screen">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-4xl w-full">
          <div className="sticky top-0 bg-white z-10 pb-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Mes Tickets</h1>
              <button
                onClick={handleCreateTicket}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300"
              >
                Nouveau ticket
              </button>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {/* Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Filter by status */}
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
                  <option value="open">Ouvert</option>
                  <option value="closed">Fermé</option>
                </select>
              </div>

              {/* Sort by date */}
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
          </div>

          {/* Ticket list */}
          {filteredTickets.length === 0 ? (
            <p className="text-gray-600 text-center py-4">Aucun ticket trouvé.</p>
          ) : (
            <ul className="space-y-4 max-h-[400px] overflow-y-auto pt-[10px]">
              {filteredTickets.map((ticket) => (
                <li key={ticket._id} className="relative border p-4 rounded-lg shadow-sm hover:shadow-md transition">
                  {/* Badge for status in top left */}
                  <span
                    className={`absolute -top-[10px] left-[10px] px-3 py-[2px] rounded-full text-white text-xs font-bold ${
                      ticket.status === "open" ? "bg-green-500" : "bg-red-500"
                    }`}
                  >
                    {ticket.status === "open" ? "Ouvert" : "Fermé"}
                  </span>
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-medium text-gray-800">{ticket.title}</h2>
                      {/* Creation date with calendar emoji */}
                      <p className="mt-1 text-sm text-gray-600 flex items-center">
                        📅 {new Date(ticket.created_at).toLocaleDateString()} à {new Date(ticket.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleViewDetails(ticket._id)}
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
