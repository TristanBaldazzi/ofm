"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import LoadingSpinner from "@/components/LoadingSpinner";
import PendingInvitations from "@/components/PendingInvitations";

export default function CompanyDetails() {
  const params = useParams();
  const { id } = params;
  const router = useRouter();

  interface Company {
    location?: string;
    averageRevenue?: number;
    phoneNumber?: string;
    contactEmail?: string;
    siren?: string;
    customActivity?: string;
  }

  interface Model {
    _id: string;
    name: string;
    description: string;
    socialMedia: { platform: string; link: string }[];
  }

  const [company, setCompany] = useState<Company | null>(null);
  const [models, setModels] = useState<Model[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [showNotification, setShowNotification] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [members, setMembers] = useState([]);
  const [forms, setForms] = useState([]);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    const fetchForms = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");

        const response = await axios.get(
          `http://localhost:5001/api/company/${id}/forms`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setForms(response.data);
        setError("");
      } catch (err) {
        setError("Erreur lors du chargement des formulaires.");
      } finally {
        setLoading(false);
      }
    };

    fetchForms(); // Appel au chargement initial de la page
  }, [id]); // Dépendance sur "id" pour éviter les appels inutiles


  useEffect(() => {
    const fetchCompanyDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
          return;
        }
        const response = await axios.get(
          `http://localhost:5001/api/company/entreprise/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCompany(response.data);
        setFormData(response.data);
      } catch (err) {
        setError("Erreur lors de la récupération des détails de l'entreprise.");
      } finally {
        setLoading(false);
      }
    };
    fetchCompanyDetails();
  }, [id]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:5001/api/fan/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setModels(response.data);
      } catch (err) {
        console.error(err);
        setError("Erreur lors de la récupération des modèles.");
      }
    };

    fetchModels();
  }, [id]);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
          return;
        }
        const response = await axios.get(
          `http://localhost:5001/api/company/members/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMembers(response.data.members);
      } catch (err) {
        setError("Erreur lors de la récupération des employés.");
      }
    };
    fetchMembers();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }
      await axios.put(
        `http://localhost:5001/api/company/entreprise/${id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCompany(formData);
      setIsEditing(false);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    } catch (err) {
      alert("Erreur lors de la mise à jour des informations.");
    }
  };

  const handleSendInvitation = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }
      await axios.post(
        "http://localhost:5001/api/company/invite",
        { companyId: company._id, email: inviteEmail },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInviteMessage("Invitation envoyée avec succès !");
      setInviteEmail("");
    } catch (error) {
      setInviteMessage(error.response?.data?.message || "Erreur lors de l'envoi.");
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5001/api/company/members/${id}/${memberId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMembers((prev) => prev.filter((member) => member._id !== memberId));
    } catch (error) {
      console.error("Erreur lors de la suppression du membre :", error);
    }
  };

  const handleViewDetails = (formId) => {
    router.push(`/entreprise/form/details/${formId}`);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <DashboardLayout>
      <main className="flex-grow bg-gray-100 flex flex-col items-center justify-start p-6 min-h-screen">
        {/* Menu flottant avec animation */}
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-full p-2 flex space-x-4 z-50 transition-all duration-300 ease-in-out hover:shadow-xl">
          {["details", "models", "invitation", "members", "forms"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full font-semibold transition-all duration-300 ${activeTab === tab
                ? "bg-blue-600 text-white scale-110"
                : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                }`}
            >
              {tab === "details" && "Détails"}
              {tab === "models" && "Modèles"}
              {tab === "invitation" && "Invitations"}
              {tab === "members" && "Employés"}
              {tab === "forms" && "Formulaires"}
            </button>
          ))}
        </div>

        {!loading && company ? (
          <div
            className={`bg-white shadow-lg rounded-lg p-6 max-w-4xl w-full mt-16 transition-opacity duration-500 ${activeTab ? "opacity-100" : "opacity-0"
              }`}
          >

            {activeTab === "details" && (
              <>
                {/* Informations principales */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold mb-4">Informations sur l'entreprise</h2>
                  {!isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-lg">
                          <strong>Lieu :</strong> {company.location || "Non spécifié"}
                        </p>
                        <p className="text-lg">
                          <strong>CA Moyen :</strong> €{new Intl.NumberFormat().format(company.averageRevenue) || "Non spécifié"}
                        </p>
                        <p className="text-lg">
                          <strong>Numéro de Téléphone :</strong> {company.phoneNumber || "Non spécifié"}
                        </p>
                      </div>
                      <div>
                        <p className="text-lg">
                          <strong>Email Contact :</strong> {company.contactEmail || "Non spécifié"}
                        </p>
                        <p className="text-lg">
                          <strong>SIREN :</strong> {company.siren || "Non spécifié"}
                        </p>
                        {company.customActivity && (
                          <p className="text-lg">
                            <strong>Activité Personnalisée :</strong> {company.customActivity}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Mode édition */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Lieu */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Lieu</label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location || ""}
                          onChange={handleInputChange}
                          placeholder="Entrez le lieu"
                          className="w-full border-gray-300 rounded-md shadow-sm"
                        />
                      </div>

                      {/* CA Moyen */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">CA Moyen (€)</label>
                        <input
                          type="number"
                          name="averageRevenue"
                          value={formData.averageRevenue || ""}
                          onChange={handleInputChange}
                          placeholder="Entrez le chiffre d'affaires moyen"
                          className="w-full border-gray-300 rounded-md shadow-sm"
                        />
                      </div>

                      {/* Numéro de Téléphone */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Numéro de Téléphone</label>
                        <input
                          type="text"
                          name="phoneNumber"
                          value={formData.phoneNumber || ""}
                          onChange={handleInputChange}
                          placeholder="Entrez le numéro de téléphone"
                          className="w-full border-gray-300 rounded-md shadow-sm"
                        />
                      </div>

                      {/* Email Contact */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email Contact</label>
                        <input
                          type="email"
                          name="contactEmail"
                          value={formData.contactEmail || ""}
                          onChange={handleInputChange}
                          placeholder="Entrez l'email de contact"
                          className="w-full border-gray-300 rounded-md shadow-sm"
                        />
                      </div>

                      {/* SIREN */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700">SIREN</label>
                        <input
                          type="text"
                          name="siren"
                          value={formData.siren || ""}
                          onChange={handleInputChange}
                          placeholder="Entrez le numéro SIREN"
                          className="w-full border-gray-300 rounded-md shadow-sm"
                        />
                      </div>

                      {/* Activité Personnalisée */}
                      {formData.customActivity !== undefined && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Activité Personnalisée</label>
                          <input
                            type="text"
                            name="customActivity"
                            value={formData.customActivity || ""}
                            onChange={handleInputChange}
                            placeholder="Décrivez l'activité personnalisée"
                            className="w-full border-gray-300 rounded-md shadow-sm"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Boutons en bas à droite */}
                {!isEditing ? (
                  /* Boutons Retour et Modifier */
                  <div className="mt-8 flex justify-end space-x-4">
                    {/* Retour */}
                    <button
                      onClick={() => window.history.back()}
                      className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg shadow-md hover:bg-gray-400 transition duration-300"
                    >
                      Retour
                    </button>

                    {/* Modifier */}
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                      >
                        Modifier
                      </button>
                    )}
                  </div>
                ) : (
                  /* Boutons Annuler et Sauvegarder */
                  <div className="mt-8 flex justify-end space-x-4">
                    {/* Annuler */}
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg shadow-md hover:bg-gray-400 transition duration-300"
                    >
                      Annuler
                    </button>

                    {/* Sauvegarder */}
                    <button
                      onClick={handleSaveChanges}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                    >
                      Sauvegarder
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Onglet Modèles */}
            {activeTab === "models" && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Liste des Modèles</h2>
                  <button
                    onClick={() => router.push(`/entreprise/model/create/${id}`)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg shadow-md hover:bg-green-600 transition duration-300"
                  >
                    Créer un modèle
                  </button>
                </div>
                {models.length > 0 ? (
                  models.map((model) => (
                    <div key={model._id} className="bg-gray-100 shadow-md rounded-lg p-4 mb-4">
                      <h3 className="text-lg font-semibold">{model.name}</h3>
                      <p>{model.description}</p>
                      <ul className="mt-2 space-y-1">
                        {model.socialMedia.map((social, index) => (
                          <li key={index} className="text-blue-600 underline">
                            {social.platform}:{" "}
                            <a href={social.link} target="_blank" rel="noopener noreferrer">
                              {social.link}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p>Aucun modèle trouvé.</p>
                )}
              </>
            )}

            {activeTab === "invitation" && (
              <>
                <div className="mt-8">
                  <h2 className="text-xl font-bold mb-4">Inviter un utilisateur</h2>
                  <div className="flex items-center space-x-4">
                    <input
                      type="email"
                      placeholder="Entrez l'adresse email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                    />
                    <button
                      onClick={handleSendInvitation}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
                    >
                      Envoyer
                    </button>
                  </div>
                  {inviteMessage && (
                    <p className={`mt-4 ${inviteMessage.includes("succès") ? "text-green-500" : "text-red-500"}`}>
                      {inviteMessage}
                    </p>
                  )}
                </div>
              </>
            )}

            {activeTab === "members" && (
              <>
                <div className="mt-8">
                  <h2 className="text-xl font-bold mb-4">Liste des employés</h2>
                  {members.length > 0 ? (
                    <ul className="space-y-4">
                      {members.map((member) => (
                        <li
                          key={member._id}
                          className="flex justify-between items-center bg-gray-100 p-4 rounded-lg shadow"
                        >
                          <span>{member.email}</span>
                          <button
                            onClick={() => handleRemoveMember(member._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          >
                            Supprimer
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Aucun employé trouvé.</p>
                  )}
                </div>
                <PendingInvitations companyId={id} />
              </>
            )}
            {activeTab === "forms" && (
              <div>
                <h2 className="text-xl font-bold mb-4">Liste des formulaires</h2>
                {loading ? (
                  <p>Chargement...</p>
                ) : error ? (
                  <p className="text-red-500">{error}</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {forms.map((form) => (
                      <div
                        key={form._id}
                        className="bg-white shadow-md rounded-lg p-4 border"
                      >
                        <h3 className="text-lg font-semibold text-blue-600">
                          {form.details.title}
                        </h3>
                        <p className="text-gray-700">{form.details.description}</p>
                        <p className="mt-2 text-sm text-gray-500">
                          Réponses:{" "}
                          <span className="font-bold">{form.responses.length}</span>
                        </p>
                        {/* Optional: Add a button or link to view form details */}
                        <button
                          onClick={() => handleViewDetails(form._id)}
                          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                        >
                          Voir plus
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          loading ? (
            <LoadingSpinner />
          ) : (
            <p>Aucune donnée disponible.</p>
          )
        )}
      </main>
    </DashboardLayout >
  );
}
