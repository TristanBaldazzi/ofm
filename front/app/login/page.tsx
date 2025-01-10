"use client";

import { useState, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [captchaToken, setCaptchaToken] = useState(null);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState(Array(6).fill(""));
  const [showSessionPrompt, setShowSessionPrompt] = useState(false);
  const router = useRouter();

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("http://localhost:5001/api/auth/verify-token", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then(() => {
          setShowSessionPrompt(true);
        })
        .catch(() => {
          localStorage.removeItem("token");
        });
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      setError("Veuillez compléter le CAPTCHA.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5001/api/auth/login", {
        ...formData,
        captchaToken,
      });

      if (response.data.message === "Code de double authentification envoyé.") {
        setTwoFactorRequired(true);
        return;
      }

      localStorage.setItem("token", response.data.token);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la connexion.");
    }
  };

  const handleInputChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const newCode = [...twoFactorCode];
    newCode[index] = value;
    setTwoFactorCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`input-${index + 1}`);
      nextInput?.focus();
    }

    if (newCode.every((digit) => digit !== "")) {
      verify2FACode(newCode.join(""));
    }
  };

  const verify2FACode = async (code) => {
    try {
      const response = await axios.post("http://localhost:5001/api/auth/verify-2fa", {
        email: formData.email,
        code,
      });

      localStorage.setItem("token", response.data.token);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la vérification.");
    }
  };

  const handlePasteClick = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (/^\d{6}$/.test(text)) {
        setTwoFactorCode(text.split(""));
        verify2FACode(text);
      } else {
        setError("Le presse-papiers ne contient pas un code valide.");
      }
    } catch (err) {
      setError("Impossible d'accéder au presse-papiers.");
    }
  };

  const handleSessionChoice = (choice) => {
    if (choice === "resume") {
      router.push("/dashboard");
    } else if (choice === "logout") {
      localStorage.removeItem("token");
      setShowSessionPrompt(false); // Cache la notification
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-gray-50 p-8 md:p-16">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-center">Connexion</h1>{showSessionPrompt && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
              <div className="relative bg-white rounded-xl shadow-2xl p-8 w-full max-w-lg transform transition-all duration-300 scale-100">
                {/* Croix pour fermer */}
                <button
                  onClick={() => handleSessionChoice("logout")}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition duration-200"
                  aria-label="Fermer"
                >
                  ✖
                </button>

                {/* Contenu principal */}
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                  Reprendre votre session ?
                </h2>
                <p className="text-gray-600 text-center mb-6">
                  Vous avez une session active en cours. Souhaitez-vous la reprendre ou vous déconnecter ?
                </p>

                {/* Boutons */}
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => handleSessionChoice("resume")}
                    className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 shadow-md transition transform hover:scale-105"
                  >
                    Oui
                  </button>
                  <button
                    onClick={() => handleSessionChoice("logout")}
                    className="bg-red-500 text-white py-2 px-6 rounded-lg hover:bg-red-600 shadow-md transition transform hover:scale-105"
                  >
                    Non
                  </button>
                </div>
              </div>
            </div>
          )}

          {!twoFactorRequired ? (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Votre email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Votre mot de passe"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="captcha-container">
                <ReCAPTCHA
                  sitekey="6Lfl1bMqAAAAAMCvr-jB2wB7LlxJxZ7bXwqVtM5S" // Remplacez par votre clé publique
                  onChange={handleCaptchaChange}
                  hl="fr"
                />
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}

              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 mt-4">
                Se connecter
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <label htmlFor="2fa-code" className="block text-sm font-medium text-gray-700">
                Code de vérification
              </label>
              <div className="flex gap-2 justify-center">
                {twoFactorCode.map((digit, index) => (
                  <input
                    key={index}
                    id={`input-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(e.target.value, index)}
                    className="w-12 h-12 text-center text-xl font-bold border-b-2 border-gray-300 focus:outline-none focus:border-purple-500 transition-all duration-300 bg-transparent"
                  />
                ))}
              </div>
              <div className="flex justify-center mt-2">
                <button
                  onClick={handlePasteClick}
                  className="text-sm text-gray-500 hover:text-gray-700 transition duration-200 cursor-pointer"
                >
                  📋 Coller
                </button>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          )}
          {!twoFactorRequired && (
            <p className="mt-6 text-center text-sm text-gray-600">
              Pas de compte ?{" "}
              <a href="/register" className="text-blue-500 hover:text-blue-700 font-medium transition-colors">
                Inscrivez-vous maintenant
              </a>
            </p>
          )}
        </div>
      </div>

      <div className="hidden md:flex w-full md:w-1/2 items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
        <img src="/login_illustration.png" alt="Decorative" className="max-w-xs h-auto mx-auto" />
      </div>
    </div>
  );
}
