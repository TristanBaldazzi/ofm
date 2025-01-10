"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function TicketDetails() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;
  const [ticket, setTicket] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");

  // Récupérer le ticket et le rôle de l'utilisateur
  useEffect(() => {
    const fetchTicketAndUserRole = async () => {
      try {
        const token = localStorage.getItem("token");

        const userResponse = await axios.get("http://localhost:5001/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserRole(userResponse.data.role);

        const response = await axios.get(`http://localhost:5001/api/tickets/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTicket(response.data);
      } catch (err) {
        setError("Erreur lors de la récupération du ticket.");
      }
    };

    fetchTicketAndUserRole();
  }, [id]);

  // Gérer l'envoi d'un message avec ou sans fichier
  const handleSendMessage = async () => {
    try {
      if (ticket.status === "closed") {
        alert("Vous ne pouvez pas envoyer de message sur un ticket fermé.");
        return;
      }

      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("text", message);
      if (file) formData.append("file", file);

      await axios.post(
        `http://localhost:5001/api/tickets/${id}/messages`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );

      setMessage("");
      setFile(null);

      // Recharger les messages après envoi
      const updatedTicket = await axios.get(`http://localhost:5001/api/tickets/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTicket(updatedTicket.data);
    } catch (err) {
      setError("Erreur lors de l'envoi du message.");
    }
  };

  if (!ticket) return <LoadingSpinner />;

  return (
    <DashboardLayout>
      <main className="flex-grow bg-gray-100 flex items-center justify-center min-h-screen">
        <div className="relative bg-white shadow-md rounded-lg p-8 max-w-xl w-full">
          <h1 className="text-xl font-bold mb-4">{ticket.title}</h1>
          <p className="mb-6 text-gray-700">{ticket.description}</p>

          {/* Affichage des messages */}
          <div className="mb-6 max-h-[300px] overflow-y-auto">
            <h2 className="font-medium mb-2">Messages :</h2>
            {ticket.messages.length === 0 ? (
              <p>Aucun message pour l'instant.</p>
            ) : (
              ticket.messages.map((msg, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg mb-2 relative ${msg.sender.role === "Admin" ? "bg-red-100" : "bg-gray-100"
                    }`}
                >
                  {/* Affichage du texte du message */}
                  <p className="break-all whitespace-pre-wrap">{msg.text}</p>

                  {/* Affichage de la pastille "Staff" si le message est envoyé par un Admin */}
                  {msg.sender.role === "Admin" && (
                    <span className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      Staff
                    </span>
                  )}

                  {/* Affichage du fichier joint si présent */}
                  {msg.file && (
                    <div className="absolute bottom-2 right-2 group">
                      {/* Icône stylisée */}
                      <a
                        href={`http://localhost:5001/uploads/${msg.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full group-hover:bg-blue-200 transition duration-300"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={1.5}
                          stroke="currentColor"
                          className="w-5 h-5 text-blue-600 group-hover:text-blue-800"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-9A2.25 2.25 0 002.25 5.25v13.5A2.25 2.25 0 004.5 21h13.5a2.25 2.25 0 002.25-2.25V11.25A2.25 2.25 0 0017.25 9H15.75zM9 12h6m-3-3v6"
                          />
                        </svg>
                      </a>
                    </div>
                  )}

                  {/* Affichage de la date et heure */}
                  <span className="text-xs text-gray-500 block mt-1">
                    {new Date(msg.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Formulaire d'ajout de message */}
          {(userRole === "Admin" || ticket.user._id === userRole._id) && ticket.status !== "closed" && (
            <>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Écrire un message..."
                rows={3}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300 mb-4"
              />
              {/* Gestion du fichier déposé */}
              {file && (
                <div className="mt-4 flex items-center justify-between bg-gray-100 p-2 rounded-lg border border-gray-300">
                  <div className="flex items-center space-x-2">
                    {/* Icône de fichier */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5 text-gray-600"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-9A2.25 2.25 0 002.25 5.25v13.5A2.25 2.25 0 004.5 21h13.5a2.25 2.25 0 002.25-2.25V11.25A2.25 2.25 0 0017.25 9H15.75zM9 12h6m-3-3v6"
                      />
                    </svg>
                    {/* Nom du fichier */}
                    <span className="text-sm text-gray-700 truncate max-w-[200px]">{file.name}</span>
                  </div>
                  {/* Bouton pour supprimer le fichier */}
                  <button
                    onClick={() => setFile(null)}
                    className="text-red-500 hover:text-red-700 text-sm font-medium transition duration-200"
                  >
                    Supprimer
                  </button>
                </div>
              )}

              {/* Input pour déposer un fichier */}
              <label
                htmlFor="file-upload"
                className={`block w-full p-4 border-dashed border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition ${file ? "border-green-500" : "border-gray-300"
                  }`}
              >
                <input
                  id="file-upload"
                  type="file"
                  onChange={(e) => {
                    if (e.target.files[0]) {
                      setFile(e.target.files[0]);
                    }
                    e.target.value = ""; // Réinitialise la valeur pour permettre le même fichier
                  }}
                  accept=".png,.jpg,.jpeg,.pdf,.docx,.xls,.xlsx,.csv,.xml"
                  className="hidden"
                />

                {!file ? (
                  <p className="text-sm text-gray-500 text-center">
                    Glissez ou sélectionnez un fichier<br></br>(PNG, JPG, PDF, DOCX, XLS, CSV, XML)
                  </p>
                ) : (
                  <p className="text-sm text-green-500 text-center">Fichier prêt à être envoyé</p>
                )}
              </label>

              <button
                onClick={handleSendMessage}
                className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition duration-300 mt-4"
              >
                Envoyer
              </button>
            </>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
