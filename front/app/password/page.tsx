"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [codeSuffix, setCodeSuffix] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = `OFM-${codeSuffix}`;
    if (newPassword !== confirmPassword) {
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }
    try {
      const response = await axios.post("http://localhost:5001/api/auth/reset-password", { code, newPassword });
      setMessage(response.data.message);

      if (response.status === 200) {
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Une erreur est survenue.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Réinitialiser le mot de passe</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-gray-700">Code de vérification</label>
            <div className="flex items-center">
              <span className="bg-gray-100 border border-gray-300 rounded-l-lg px-3 py-2 text-gray-700">OFM-</span>
              <input
                id="code"
                type="text"
                placeholder="Entrez le reste du code"
                value={codeSuffix}
                onChange={(e) => setCodeSuffix(e.target.value)}
                className="w-full border rounded-r-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
            <input
              id="new-password"
              type="password"
              placeholder="Nouveau mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
            <input
              id="confirm-password"
              type="password"
              placeholder="Confirmer le mot de passe"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300">
            Réinitialiser le mot de passe
          </button>
        </form>
        {message && <p className="mt-4 text-center text-sm">{message}</p>}
      </div>
    </div>
  );
}
