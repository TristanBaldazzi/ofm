"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";

export default function AdminPage() {
    const router = useRouter();

    const adminTools = [
        { title: "Gestion des Tickets", description: "Gérez les tickets de support", route: "/admin/ticket", icon: "🎫" },
        { title: "Gestion des Entreprises", description: "Gérez les entreprises partenaires", route: "/admin/list-entreprise", icon: "🏢" },
        { title: "Gestion des Utilisateurs", description: "Gérez les comptes utilisateurs", route: "/admin/manage-user", icon: "👤" },
        { title: "Gestion des Formulaires", description: "Consultez les formulaires", route: "/admin/list-form", icon: "📊" },
    ];

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gradient-to-r">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {adminTools.map((tool, index) => (
                        <div
                            key={index}
                            onClick={() => router.push(tool.route)}
                            className="bg-white shadow-lg rounded-xl p-6 cursor-pointer hover:bg-blue-50 transition transform hover:-translate-y-1"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-4xl">{tool.icon}</span>
                                <span className="bg-blue-100 text-blue-700 text-sm font-semibold px-3 py-1 rounded-full">
                                    Admin
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">{tool.title}</h2>
                            <p className="text-gray-600 mt-2">{tool.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
