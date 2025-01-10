"use client";

import { useState } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";

export default function RegisterPage() {
  const [captchaToken, setCaptchaToken] = useState(null);
  const [formData, setFormData] = useState({ email: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!captchaToken) {
      setError("Veuillez compléter le CAPTCHA.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5001/api/auth/signup", {
        email: formData.email,
        password: formData.password,
        captchaToken,
      });
      setSuccess("Inscription réussie !");
      setError("");

      setTimeout(() => {
        router.push("/login");
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription.");
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white p-8 md:p-16">
        <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-6 text-center">Inscription</h1>
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
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                Confirmez votre mot de passe
              </label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirmez votre mot de passe"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
            {success && <p className="text-green-500 text-sm">{success}</p>}
            <Button variant="default" type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition duration-300 mt-4">
              S'inscrire
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-600">
            Déjà un compte ?{" "}
            <a
              href="/login"
              className="text-blue-500 hover:text-blue-700 font-medium transition-colors"
            >
              Connectez-vous
            </a>
          </p>
        </div>
      </div>

      <div className="hidden md:flex w-full md:w-1/2 items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
        <img src="/login_illustration.png" alt="Decorative" className="max-w-xs h-auto mx-auto" />
      </div>
    </div>
  );
}
