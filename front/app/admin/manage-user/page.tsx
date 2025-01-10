"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/LoadingSpinner";
import DashboardLayout from "@/components/DashboardLayout";

interface User {
  _id: string;
  email: string;
  role: string;
  isVerified: boolean;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState("User");
  const router = useRouter();

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get("http://localhost:5001/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.role !== "Admin") {
          router.push("/dashboard");
        }
      } catch (err) {
        router.push("/login");
      }
    };

    fetchCurrentUser();
  }, [router]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get("http://localhost:5001/api/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUsers(response.data);
        setIsLoading(false);
      } catch (err) {
        setError("Impossible de récupérer les utilisateurs.");
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.put(
        `http://localhost:5001/api/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (err) {
      setError("Erreur lors du changement de rôle.");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.delete(`http://localhost:5001/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== userId));
    } catch (err) {
      setError("Erreur lors de la suppression de l'utilisateur.");
    }
  };

  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.post(
        "http://localhost:5001/api/admin/users",
        { email: newUserEmail, password: newUserPassword, role: newUserRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prevUsers) => [...prevUsers, response.data]);
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("User");
    } catch (err) {
      setError("Erreur lors de la création du compte.");
    }
  };

  if (isLoading) return <LoadingSpinner />;

  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-red-600 text-lg">{error}</p>
      </div>
    );

  return (
    <DashboardLayout>
      <div className="p-8 min-h-screen ">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">
          Gestion des Utilisateurs
        </h1>

        {/* Liste des utilisateurs */}
        <div className="mb-12 p-6 bg-white rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-6 text-gray-700">Liste des utilisateurs</h2>
          <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-md">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Rôle</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b hover:bg-gray-50 transition duration-300">
                  <td className="px-4 py-3 flex items-center gap-2">
                    {user.email}
                    {!user.isVerified && (
                      <span title="Mail non vérifié" className="text-red-500 cursor-pointer">
                        ⚠️
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {/* Select avec design moderne */}
                    <div className="relative">
                      <select
                        value={user.role}
                        onChange={(e) => handleChangeRole(user._id, e.target.value)}
                        className="block w-full appearance-none px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300 focus:border-blue-500"
                      >
                        <option value="User">Utilisateur</option>
                        <option value="Admin">Administrateur</option>
                      </select>
                      <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                        ▼
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDeleteUser(user._id)}
                      className="bg-red-500 text-white px-[15px] py-[8px] rounded hover:bg-red-600 transition"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Création d'utilisateur */}
        <div className="mb-12 p-6 bg-white rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold mb-6 text-gray-700">Créer un nouvel utilisateur</h2>
          <div className="flex flex-col md:flex-row gap-y-4 gap-x-6">
            <input
              type="email"
              placeholder="Email"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="border rounded px-4 py-3 w-full focus:ring focus:ring-blue-300"
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={newUserPassword}
              onChange={(e) => setNewUserPassword(e.target.value)}
              className="border rounded px-4 py-3 w-full focus:ring focus:ring-blue-300"
            />
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
              className="border rounded px-4 py-[11px] w-full focus:ring focus:ring-blue-300"
            >
              <option value="User">Utilisateur</option>
              <option value="Admin">Administrateur</option>
            </select>
            <button
              onClick={handleCreateUser}
              className="bg-blue-500 text-white px-[20px] py-[11px] rounded hover:bg-blue-600 transition"
            >
              Créer
            </button>
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-[10px]">{error}</p>
          )}
        </div>

        {/* Bouton Retour */}
        <button
          onClick={() => window.history.back()}
          className="mt-8 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition duration-200 mx-auto block"
        >
          Retour
        </button>

      </div>
    </DashboardLayout>
  );
}
