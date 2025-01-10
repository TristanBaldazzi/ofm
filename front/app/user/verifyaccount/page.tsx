"use client";

import React, { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation"; // Hook pour la navigation dans Next.js

export default function VerifyAccount() {
  const [code, setCode] = useState<string[]>(Array(6).fill("")); // Tableau pour stocker les 6 chiffres
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter(); // Initialisation du routeur

  const handleInputChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return; // Vérifie que seul un chiffre est entré
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Passer automatiquement au prochain carré si un chiffre est entré
    if (value && index < 5) {
      const nextInput = document.getElementById(`input-${index + 1}`);
      nextInput?.focus();
    }

    // Si tous les champs sont remplis, déclencher la vérification
    if (newCode.every((digit) => digit !== "")) {
      verifyCode(newCode.join(""));
    }
  };

  const verifyCode = async (verificationCode: string) => {
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Vous devez être connecté pour vérifier votre compte.");
        return;
      }

      // Envoie la requête avec le code et le token dans les headers
      const response = await axios.post(
        "http://localhost:5001/api/auth/verify-email",
        { verificationCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setMessage(response.data.message); // Affiche le message de succès

      // Redirige vers le tableau de bord après un court délai
      setTimeout(() => {
        router.push("/dashboard"); // Redirection vers /dashboard
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de la vérification.");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-gray-800">
          Vérifiez votre compte
        </h1>
        <p className="text-gray-600 text-center mb-8">
          Entrez le code que vous avez reçu par mail pour vérifier votre compte.
        </p>

        {/* Carrés pour le code */}
        <div className="flex gap-4 mb-6 justify-center">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`input-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleInputChange(e.target.value, index)}
              className="w-14 h-14 text-center text-3xl font-bold border-b-4 border-gray-300 focus:outline-none focus:border-purple-500 transition-all duration-300 bg-transparent"
            />
          ))}
        </div>

        {/* Message de succès ou d'erreur */}
        {message && (
          <div className="mt-4 p-4 bg-green-100 text-green-700 border-l-4 border-green-500 rounded-md">
            {message}
          </div>
        )}
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 border-l-4 border-red-500 rounded-md">
            {error}
          </div>
        )}

        {/* Texte Retour */}
        <p
          onClick={() => router.push("/dashboard")} // Redirection vers la page souhaitée
          className="mt-6 text-sm text-gray-500 text-center cursor-pointer hover:text-gray-700 transition duration-200"
        >
          Retour
        </p>
      </div>
    </div>
  );
}
