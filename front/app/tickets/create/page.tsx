"use client";

import React, { useState } from "react";
import axios from "axios";
import DashboardLayout from "@/components/DashboardLayout";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function CreateTicket() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false); // État de chargement

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Début du chargement
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:5001/api/tickets",
        { title, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSuccess("Ticket créé avec succès !");
      setError("");
      setTitle("");
      setDescription("");
    } catch (err) {
      setError("Erreur lors de la création du ticket.");
      setSuccess("");
    } finally {
      setLoading(false); // Fin du chargement
    }
  };

  return (
    <DashboardLayout>
      <main className="flex-grow bg-gray-100 flex items-center justify-center min-h-screen">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Créer un Ticket</h1>

          {/* Messages d'erreur ou de succès */}
          {error && <p className="text-red-500 mb-4">{error}</p>}
          {success && <p className="text-green-500 mb-4">{success}</p>}

          {/* Spinner pendant le chargement */}
          {loading ? (
            <div className="flex justify-center items-center">
              <LoadingSpinner />
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                  Titre
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-300"
              >
                Créer
              </button>
            </form>
          )}
        </div>
      </main>
    </DashboardLayout>
  );
}
