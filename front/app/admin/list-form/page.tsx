"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminFormList() {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchForms = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get("http://localhost:5001/api/form/list/admin", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForms(response.data);
      } catch (err) {
        setError("Erreur lors de la récupération des formulaires.");
      } finally {
        setLoading(false);
      }
    };

    fetchForms();
  }, []);

  const handleCreateForm = () => {
    router.push("/admin/create-form");
  };

  if (loading) return <LoadingSpinner />;

  return (
    <DashboardLayout>
      <main className="flex-grow bg-gray-100 flex flex-col items-center justify-start p-6 min-h-screen">
        <div className="bg-white shadow-md rounded-lg p-8 max-w-4xl w-full">
          <div className="sticky top-0 bg-white z-10 pb-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Gestion des Formulaires</h1>
              <button
                onClick={handleCreateForm}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-300"
              >
                Créer un formulaire
              </button>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}
          </div>

          {/* Liste des formulaires */}
          {forms.length === 0 ? (
            <p className="text-gray-600 text-center py-4">Aucun formulaire trouvé.</p>
          ) : (
            <ul className="space-y-4 max-h-[400px] overflow-y-auto pt-[10px]">
              {forms.map((form) => (
                <li key={form._id} className="relative border p-4 rounded-lg shadow-sm hover:shadow-md transition">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-lg font-medium text-gray-800">{form.details.title}</h2>
                      {/* Date de création */}
                      <p className="mt-1 text-sm text-gray-600 flex items-center">
                        📅 Créé le {new Date(form.created_at).toLocaleDateString()} à{" "}
                        {new Date(form.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <button
                      onClick={() => router.push(`/admin/form-edit/${form._id}`)}
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
