"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "next/navigation";

export default function DisplayForm() {
  const { id } = useParams(); // Récupère l'ID du formulaire depuis l'URL
  const [form, setForm] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState(true);

  // Charger le formulaire depuis l'API
  useEffect(() => {
    const fetchForm = async () => {
      try {
        const response = await axios.get(`http://localhost:5001/api/form/${id}`);
        setForm(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement du formulaire :", error);
        setLoading(false);
      }
    };

    fetchForm();
  }, [id]);

  // Gérer les changements dans les champs du formulaire
  const handleChange = (fieldLabel, value) => {
    setResponses((prev) => ({
      ...prev,
      [fieldLabel]: value,
    }));
  };

  // Soumettre les réponses
  const handleSubmit = async () => {
    try {
      const formattedResponses = form.details.fields.map((field) => ({
        fieldLabel: field.label,
        fieldType: field.type, // Inclure le type du champ ici
        response: responses[field.label] || null,
      }));
  
      await axios.post(`http://localhost:5001/api/form/${id}/submit`, {
        formData: formattedResponses,
      });
  
      alert("Réponses soumises avec succès !");
    } catch (error) {
      console.error("Erreur lors de la soumission :", error);
      alert("Une erreur est survenue.");
    }
  };  

  if (loading) return <p>Chargement...</p>;
  if (!form) return <p>Formulaire introuvable.</p>;

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundColor: form.details.theme.bg,
        color: form.details.theme.text,
      }}
    >
      <div
        className="w-full max-w-2xl rounded-lg p-8"
        style={{
          border: `1px solid ${form.details.theme.border}`,
          boxShadow: `0px 2px 6px ${form.details.theme.inactive}`, // Box-shadow réduit pour un effet subtil
        }}
      >
        <h1
          className="text-3xl font-bold text-center mb-6"
          style={{ color: form.details.theme.text }}
        >
          {form.details.title}
        </h1>
        <p className="text-center text-gray-600 mb-8" style={{ color: form.details.theme.label }}>
          {form.details.description}
        </p>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {form.details.fields.map((field, index) => (
            <div key={index} className="flex flex-col">
              <label
                htmlFor={field.label}
                className="block text-lg font-medium mb-2"
                style={{ color: form.details.theme.label }}
              >
                {field.label} {field.required && "*"}
              </label>
              {field.type === "text" && (
                <input
                  id={field.label}
                  type="text"
                  required={field.required}
                  onChange={(e) => handleChange(field.label, e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-300"
                  style={{
                    borderColor: form.details.theme.border,
                    backgroundColor: form.details.theme.static,
                    color: form.details.theme.text,
                  }}
                />
              )}
              {field.type === "textarea" && (
                <textarea
                  id={field.label}
                  required={field.required}
                  onChange={(e) => handleChange(field.label, e.target.value)}
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition duration-300"
                  style={{
                    borderColor: form.details.theme.border,
                    backgroundColor: form.details.theme.static,
                    color: form.details.theme.text,
                  }}
                />
              )}
              {["select", "checkbox", "radio"].includes(field.type) && (
                <>
                  {field.options.map((option, idx) => (
                    <div key={idx} className="flex items-center mb-2">
                      <input
                        id={`${field.label}-${option}`}
                        type={field.type}
                        name={field.label}
                        value={option}
                        required={field.required && field.type === "radio"}
                        onChange={(e) =>
                          handleChange(
                            field.label,
                            field.type === "checkbox"
                              ? [...(responses[field.label] || []), option]
                              : option
                          )
                        }
                        className="mr-2"
                      />
                      <label htmlFor={`${field.label}-${option}`} style={{ color: form.details.theme.text }}>
                        {option}
                      </label>
                    </div>
                  ))}
                </>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={handleSubmit}
            className="w-full py-3 font-semibold rounded-lg shadow-md transition-all duration-300 transform hover:-translate-y-1"
            style={{
              backgroundColor: form.details.theme.vibrant,
              color: form.details.theme.textSubmitButton,
              boxShadow: `0px 2px 4px ${form.details.theme.vibrantDarker}`, // Réduction de l'ombre sur le bouton
            }}
          >
            Soumettre
          </button>
        </form>
      </div>
    </div>
  );
}

