"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function ModelDetails() {
  const { companyId, modelId } = useParams(); // Get companyId and modelId from the URL
  const router = useRouter();
  const [model, setModel] = useState<any | null>(null);
  const [tasks, setTasks] = useState<any[]>([]); // State for tasks
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false); // State for delete confirmation modal
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [newTaskContent, setNewTaskContent] = useState("");
  const [newTaskSocialPlatform, setNewTaskSocialPlatform] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // Fetch model details and tasks
  useEffect(() => {
    const fetchModelDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
          return;
        }
        const response = await axios.get(
          `http://localhost:5001/api/fan/${companyId}/${modelId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setModel(response.data);
        setTasks(response.data.tasks); // Set tasks from the model data
      } catch (err) {
        console.error(err);
        setError("Erreur lors de la récupération des détails du modèle.");
      } finally {
        setLoading(false);
      }
    };

    fetchModelDetails();
  }, [companyId, modelId]);

  // Handle model deletion
  const handleDeleteModel = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5001/api/fan/${companyId}/${modelId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      router.push(`/entreprise/details/${companyId}`); // Redirect to company details after deletion
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la suppression du modèle.");
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("title", newTaskTitle);
      formData.append("description", newTaskDescription);
      formData.append("socialPlatform", newTaskSocialPlatform);
      formData.append("content", newTaskContent);
      formData.append("date", newTaskDate);

      if (file) formData.append("file", file); // Ajoutez le fichier s'il existe

      const response = await axios.post(
        `http://localhost:5001/api/fan/${companyId}/model/${modelId}/task`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setTasks([response.data.task, ...tasks]);

      // Réinitialisez les champs après ajout
      setNewTaskTitle("");
      setNewTaskDescription("");
      setNewTaskSocialPlatform("");
      setNewTaskContent("");
      setNewTaskDate("");

    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'ajout de la tâche.");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5001/api/fan/${companyId}/model/${modelId}/task/${taskId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(tasks.filter((task) => task._id !== taskId)); // Remove task from the list
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la suppression de la tâche.");
    }
  };

  const calculateTimeRemaining = (date: string) => {
    const now = new Date();
    const taskDate = new Date(date);
    const diffInMs = taskDate.getTime() - now.getTime();

    if (diffInMs <= 0) return "Déjà passé";

    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    if (diffInDays > 7) return `Dans ${Math.floor(diffInDays / 7)} semaines`;
    if (diffInDays >= 1) return `Dans ${diffInDays} jours`;

    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours >= 1) return `Dans ${diffInHours} heures`;

    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return `Dans ${diffInMinutes} minutes`;
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <DashboardLayout>
      <main className="flex-grow bg-gray-100 flex flex-col items-center justify-start p-6 min-h-screen">
        {/* Model Details */}
        {model ? (
          <div className="bg-white shadow-lg rounded-lg p-8 max-w-xl w-full relative">
            {/* Delete Button */}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="absolute top-4 right-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              Supprimer le modèle
            </button>

            {/* Photo de profil */}
            <div className="flex justify-center mb-6">
              <img
                src={`http://localhost:5001${model.profilePicture}`}
                alt={model.name}
                className="w-32 h-32 rounded-full border border-gray-300"
              />
            </div>

            {/* Nom du modèle */}
            <h1 className="text-2xl font-bold text-gray-800 text-center">{model.name}</h1>

            {/* Description */}
            <p className="text-gray-600 mt-4 text-center">
              {model.description || "Aucune description disponible."}
            </p>

            {/* Réseaux sociaux */}
            {model.socialMedia.length > 0 && (
              <>
                <h2 className="text-lg font-semibold text-gray-800 mt-6">Réseaux sociaux</h2>
                <div className="flex justify-center space-x-4 mt-4">
                  {model.socialMedia.map((social, index) => (
                    <a
                      key={index}
                      href={social.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 transition"
                    >
                      <img
                        src={`/icons/${social.platform.toLowerCase()}.svg`}
                        alt={social.platform}
                        className="w-10 h-10"
                        title={social.platform}
                      />
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <p>Aucun détail disponible pour ce modèle.</p>
        )}

        {/* Tasks Section */}
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-4xl w-full mt-6">
          <h2 className="text-xl font-bold mb-4">Tâches</h2>

          {/* Add Task Form */}
          <form onSubmit={handleAddTask} className="mb-6 flex flex-col space-y-4">
            <input
              type="text"
              placeholder="Titre de la tâche"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
            <textarea
              placeholder="Contenu du post"
              value={newTaskContent}
              onChange={(e) => setNewTaskContent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
            <textarea
              placeholder="Description"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
            />
            <input
              type="file"
              accept="image/*,video/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm"
            />
            <select
              value={newTaskSocialPlatform}
              onChange={(e) => setNewTaskSocialPlatform(e.target.value)}
              className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none bg-white"
              style={{
                backgroundImage:
                  "url('data:image/svg+xml;utf8,<svg fill=\"%23999\" height=\"20\" viewBox=\"0 0 24 24\" width=\"20\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>')",
                backgroundRepeat: 'no-repeat',
                backgroundPositionX: 'calc(100% -12px)',
                backgroundPositionY: 'center',
              }}
              required
            >
              <option value="">Sélectionnez une plateforme</option>
              <option value="TikTok">TikTok</option>
              <option value="X">X</option>
              <option value="Threads">Threads</option>
              <option value="Bluesky">Bluesky</option>
            </select>
            <input
              type="datetime-local"
              value={newTaskDate}
              onChange={(e) => setNewTaskDate(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300"
            >
              Ajouter une tâche
            </button>
          </form>

          {/* Tasks Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Titre du post
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Date et Heure
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Temps restant
                  </th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {tasks.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((task) => (
                  <tr key={task._id} className="hover:bg-gray-100 transition">
                    <td className="px-6 py-4 whitespace-nowrap">{task.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(task.date).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{calculateTimeRemaining(task.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Confirmer la suppression</h2>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer ce modèle ? Cette action est irréversible.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteModel}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </DashboardLayout>
  );
}

function getSocialIcon(platform: string): string {
  switch (platform) {
    case "TikTok":
      return "/icons/tiktok.svg";
    case "X":
      return "/icons/x.svg";
    case "Threads":
      return "/icons/threads.svg";
    case "Bluesky":
      return "/icons/bluesky.svg";
    default:
      return "/icons/default.svg";
  }
}
