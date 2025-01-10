"use client";

import React, { useState } from "react";
import axios from "axios";
import DashboardLayout from "@/components/DashboardLayout";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const companyTypes = [
    "SARL", "SA", "SAS", "SASU", "EURL", "SCI", "SNC", "Autre"
];

export default function CreateCompany() {
    const [formData, setFormData] = useState({
        name: "",
        location: "",
        averageRevenue: "",
        phoneNumber: "",
        contactEmail: "",
        siren: "",
        companyType: "",
        customActivity: ""
    });

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // État pour contrôler l'affichage du panneau latéral
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const token = localStorage.getItem("token");

            const response = await axios.post("http://localhost:5001/api/company/create-company", formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setSuccessMessage(response.data.message);
            setError("");
            setFormData({
                name: "",
                location: "",
                averageRevenue: "",
                phoneNumber: "",
                contactEmail: "",
                siren: "",
                companyType: "",
                customActivity: ""
            });
        } catch (err) {
            setError(err.response?.data?.message || "Erreur lors de la création de l'entreprise.");
        }
    };

    return (
        <DashboardLayout>
            <main className="flex-grow bg-gray-100 flex items-center justify-center min-h-screen pt-48 px-6 relative">
                <div className="fixed top-4 right-4 text-sm text-gray-400 bg-white p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                    <span className="hover:text-gray-600 transition-colors duration-300">Dashboard</span>
                    <span className="mx-1">/</span>
                    <span className="hover:text-gray-600 transition-colors duration-300">Entreprise</span>
                    <span className="mx-1">/</span>
                    <span className="hover:text-gray-600 transition-colors duration-300">Création</span>
                </div>

                <div className="bg-white shadow-md rounded-lg p-10 max-w-xl w-full mt-12">
                    <h1 className="text-2xl font-bold mb-6 text-center">Créer une Entreprise</h1>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Champ Nom */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom</label>
                            <input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                                required
                            />
                        </div>

                        {/* Champ Lieu */}
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Lieu</label>
                            <input
                                id="location"
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                                required
                            />
                        </div>

                        {/* Champ CA Moyen */}
                        <div>
                            <label htmlFor="averageRevenue" className="block text-sm font-medium text-gray-700">CA Moyen (€)</label>
                            <input
                                id="averageRevenue"
                                type="number"
                                value={formData.averageRevenue}
                                onChange={(e) => setFormData({ ...formData, averageRevenue: e.target.value })}
                                className="w-full p-3 border rounded-lg focus:outline-none focus:ring focus:ring-blue-300"
                                required
                            />
                        </div>

                        {/* Champ Numéro de Téléphone */}
                        <div>
                            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                                Numéro de Téléphone
                            </label>
                            <PhoneInput
                                country={'fr'}
                                value={formData.phoneNumber}
                                onChange={(phone) => setFormData({ ...formData, phoneNumber: phone })}
                                inputStyle={{
                                    width: '100%',
                                    height: '3rem', // Assure une hauteur uniforme avec les autres champs
                                    paddingLeft: '50px', // Compense l'espace occupé par le drapeau
                                    border: '1px solid #d1d5db',
                                    borderRadius: '0.5rem',
                                    fontSize: '1rem',
                                    boxSizing: 'border-box',
                                }}
                                containerStyle={{
                                    width: '100%',
                                }}
                                buttonStyle={{
                                    borderRight: '1px solid #d1d5db',
                                    height: '3rem', // Aligne la hauteur du bouton avec l'input
                                }}
                            />
                        </div>


                        {/* Champ Email Contact */}
                        <div>
                            <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">Email Contact</label>
                            <input
                                id="contactEmail"
                                type="email"
                                value={formData.contactEmail}
                                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                className="w-full p-[10px] border rounded-lg shadow-sm focus:outline-none focus:ring-indigo-[500]"
                                required
                            />
                        </div>

                        {/* Champ SIREN */}
                        <div>
                            <label htmlFor="siren" className="block text-sm font-medium text-gray-700">SIREN</label>
                            <input
                                id="siren"
                                type="text"
                                value={formData.siren}
                                onChange={(e) => setFormData({ ...formData, siren: e.target.value })}
                                className="w-full p-[10px] border rounded-lg shadow-sm focus:outline-none focus:ring-indigo-[500]"
                                required
                            />
                        </div>

                        {/* Champ Type de Société */}
                        <div>
                            <label htmlFor="companyType" className="block text-sm font-medium text-gray-700">Type de Société</label>
                            {/* Champ input qui ouvre le panneau latéral */}
                            <input
                                type="text"
                                id="companyType"
                                value={formData.companyType}
                                readOnly
                                onClick={() => setIsSidePanelOpen(true)}
                                placeholder="Cliquez pour sélectionner"
                                className="w-full p-[10px] border rounded-lg shadow-sm focus:outline-none focus:ring-indigo-[500] cursor-pointer"
                            />
                        </div>

                        {/* Champ d'activité personnalisé */}
                        {formData.companyType === "Autre" && (
                            <div>
                                <label htmlFor="customActivity" className="block text-sm font-medium text-gray-700">Activité Personnalisée</label>
                                <input
                                    id="customActivity"
                                    type="text"
                                    value={formData.customActivity}
                                    onChange={(e) => setFormData({ ...formData, customActivity: e.target.value })}
                                    placeholder="Décrivez l'activité..."
                                    required
                                    className="w-full p-[10px] border rounded-lg shadow-sm focus:outline-none focus:ring-indigo-[500]"
                                />
                            </div>
                        )}

                        {/* Button to submit form */}
                        <button
                            type="submit"
                            className="w-full bg-blue-500 text-white py-[10px] px-[16px] rounded-lg hover:bg-blue-600 transition duration-[300ms]"
                        >
                            Créer l'Entreprise
                        </button>
                    </form>
                </div>

                {/* Panneau latéral */}
                <div className={`side-panel ${isSidePanelOpen ? 'open' : ''}`}>
                    <div className="side-panel-content">
                        <h2 className="text-xl font-bold mb-4">Sélectionnez votre Type de Société</h2>
                        {companyTypes.map((type) => (
                            <div key={type} onClick={() => {
                                setFormData({ ...formData, companyType: type });
                                setIsSidePanelOpen(false);
                            }} className="cursor-pointer hover:bg-gray-200 p-2 rounded">
                                {type}
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setIsSidePanelOpen(false)}
                            className="text-red-500 mt-4"
                        >
                            Fermer
                        </button>
                    </div>
                </div>

            </main>
        </DashboardLayout>
    );
}
