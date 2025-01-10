"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";

export default function PendingInvitations({ companyId }) {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Récupérer les invitations en attente
  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
          return;
        }

        const response = await axios.get(
          `http://localhost:5001/api/company/invitations/${companyId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setInvitations(response.data.invitations);
      } catch (err) {
        setError("Erreur lors de la récupération des invitations.");
      } finally {
        setLoading(false);
      }
    };

    fetchInvitations();
  }, [companyId]);

  // Supprimer une invitation
  const handleDeleteInvitation = async (invitationId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5001/api/company/invitations/${invitationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Mettre à jour la liste localement
      setInvitations((prev) => prev.filter((inv) => inv._id !== invitationId));
    } catch (err) {
      console.error("Erreur lors de la suppression de l'invitation :", err);
    }
  };

  if (loading) return <p>Chargement des invitations...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Demandes d'invitation en cours</h2>
      {invitations.length > 0 ? (
        <ul className="space-y-4">
          {invitations.map((invitation) => (
            <li
              key={invitation._id}
              className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow"
            >
              <div>
                <p><strong>Email :</strong> {invitation.email}</p>
                <p><strong>Expire :</strong> {new Date(invitation.expiresAt).toLocaleString()}</p>
              </div>
              <button
                onClick={() => handleDeleteInvitation(invitation._id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucune demande d'invitation en cours.</p>
      )}
    </div>
  );
}
