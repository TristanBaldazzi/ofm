"use client";

import React, { useEffect, useState, useRef } from "react";
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
  const [fileExcel, setFileExcel] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [socialMedia, setSocialMedia] = useState<string[]>([]);
  const [selectedPlatformsSocial, setSelectedPlatformsSocial] = useState<string[]>([]);
  const [isModalOpenSocial, setIsModalOpenSocial] = useState(false);
  const [platform, setPlatform] = useState(""); // Plateforme sélectionnée
  const [groupNumber, setGroupNumber] = useState(""); // Numéro de groupe
  const [tokens, setTokens] = useState<any>({});

  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);

  const [selectedTask, setSelectedTask] = useState<any | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");


  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleImportTasks = async () => {
    if (!file) {
      setError("Veuillez sélectionner un fichier.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post(
        `http://localhost:5001/api/fan/${companyId}/model/${modelId}/tasks/import`,
        formData,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
      );

      setSuccessMessage(response.data.message);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'importation des tâches.");
    }
  };


  const handleViewTask = (task: any) => {
    setSelectedTask(task); // Définir la tâche sélectionnée
    setIsModalOpen(true); // Ouvrir la modale
  };

  const handleCloseModal = () => {
    setSelectedTask(null); // Réinitialiser la tâche sélectionnée
    setIsModalOpen(false); // Fermer la modale
  };

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
        setSocialMedia(response.data.socialMedia);
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
      setFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Réinitialisez le champ fichier
      }

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

  // Gérer la sélection/désélection des filtres
  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms((prevSelected) =>
      prevSelected.includes(platform)
        ? prevSelected.filter((p) => p !== platform) // Retirer si déjà sélectionné
        : [...prevSelected, platform] // Ajouter si non sélectionné
    );
  };

  // Filtrer les tâches en fonction des réseaux sélectionnés
  const filteredTasks = selectedPlatforms.length > 0
    ? tasks.filter((task) => selectedPlatforms.includes(task.socialPlatform))
    : tasks;

  // Trier les tâches par date
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
  });

  const handleAddSocialMedia = async () => {
    if (!platform || !groupNumber || Object.keys(tokens).length === 0) {
      alert("Veuillez remplir tous les champs.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // Appeler l'API pour ajouter un réseau social
      const response = await axios.post(
        `http://localhost:5001/api/fan/${companyId}/${modelId}/social-media`,
        { platform, groupNumber, tokens },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Mettre à jour localement la liste des réseaux sociaux
      setSocialMedia(response.data.socialMedia);

      // Réinitialiser les champs et fermer la modale
      setPlatform("");
      setGroupNumber("");
      setTokens({});
      setIsModalOpenSocial(false);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'ajout du réseau social.");
    }
  };

  // Supprimer un réseau social du modèle
  const handleRemoveSocialMedia = async (platform: string, group: string) => {
    try {
      const token = localStorage.getItem("token");

      // Appeler l'API pour supprimer un réseau social spécifique
      await axios.delete(
        `http://localhost:5001/api/fan/${companyId}/${modelId}/social-media/${platform}/${group}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Mettre à jour localement la liste des réseaux sociaux après suppression
      setSocialMedia(socialMedia.filter((media) => !(media.platform === platform && media.group === group)));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression du réseau social.");
    }
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
          </div>
        ) : (
          <p>Aucun détail disponible pour ce modèle.</p>
        )}

        <div className="bg-white shadow-xl rounded-lg p-8 max-w-4xl w-full mt-6">
          {/* Titre */}
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Importer des tâches</h2>

          {/* Conteneur principal */}
          <div className="flex flex-col items-center space-y-6">

            {/* Input pour le fichier */}
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionnez un fichier Excel (.xlsx)
              </label>
              <input
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring focus:ring-blue-300"
              />
            </div>

            {/* Bouton d'importation */}
            <button
              onClick={handleImportTasks}
              className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring focus:ring-indigo-300 transition duration-300"
            >
              Importer des tâches
            </button>

            {/* Messages de statut */}
            {error && (
              <p className="w-full text-center text-red-500 bg-red-100 border border-red-300 rounded-lg py-2 px-4 text-sm">
                {error}
              </p>
            )}
            {successMessage && (
              <p className="w-full text-center text-green-500 bg-green-100 border border-green-300 rounded-lg py-2 px-4 text-sm">
                {successMessage}
              </p>
            )}
          </div>
        </div>

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
            /><div className="flex flex-col items-center space-y-4">
              {/* Input pour le fichier */}
              <div className="w-full p-4 border border-gray-300 rounded-lg shadow-sm hover:border-blue-500 focus-within:border-blue-500 transition">
                <label
                  htmlFor="mediaInput"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Sélectionnez une image ou une vidéo
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFile(e.target.files[0]); // Met à jour l'état avec le fichier sélectionné
                    }
                  }}
                  ref={fileInputRef} // Ajoutez la référence ici
                  id="mediaInput"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-5 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none"
                />
              </div>
            </div>

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

          <div className="flex justify-between items-center mb-6">
            {/* Filtres par Réseau Social */}
            <div className="flex space-x-4">
              {["TikTok", "X", "Threads", "Bluesky"].map((platform) => (
                <button
                  key={platform}
                  onClick={() => handlePlatformToggle(platform)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border ${selectedPlatforms.includes(platform)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-800"
                    }`}
                >
                  <img
                    src={`/icons/${platform.toLowerCase()}.svg`}
                    alt={platform}
                    className="w-6 h-6"
                  />
                  <span>{platform}</span>
                </button>
              ))}
            </div>

            {/* Tri par Date */}
            <div className="flex items-center space-x-2">
              <select
                id="sortOrder"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
                className="block w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm appearance-none bg-white"
                style={{
                  backgroundImage:
                    "url('data:image/svg+xml;utf8,<svg fill=\"%23999\" height=\"20\" viewBox=\"0 0 24 24\" width=\"20\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M7 10l5 5 5-5z\"/></svg>')",
                  backgroundRepeat: 'no-repeat',
                  backgroundPositionX: 'calc(100% -12px)',
                  backgroundPositionY: 'center',
                }}
              >
                <option value="desc">Plus récent</option>
                <option value="asc">Plus ancien</option>
              </select>
            </div>
          </div>

          {/* Tasks Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Titre
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Réseau
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
                {sortedTasks.map((task) => (
                  <tr key={task._id} className="hover:bg-gray-100 transition">
                    <td className="px-6 py-4 whitespace-nowrap">{task.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {/* Icône du réseau social */}
                      <div className="flex items-center space-x-2">
                        <img
                          src={`/icons/${task.socialPlatform.toLowerCase()}.svg`}
                          alt={task.socialPlatform}
                          className="w-6 h-6"
                          title={task.socialPlatform}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(task.date).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{calculateTimeRemaining(task.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {/* Bouton Voir Plus */}
                      <button
                        onClick={() => handleViewTask(task)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        Voir Plus
                      </button>
                    </td>
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

        {/* Gestion des réseaux sociaux */}
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-4xl w-full mt-6">
          <h2 className="text-xl font-bold mb-4">Réseaux Sociaux</h2>

          {/* Bouton pour ouvrir la modale */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-4"
          >
            Ajouter un Réseau Social
          </button>

          {/* Tableau des réseaux sociaux */}
          <div className="overflow-x-auto mt-6">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Plateforme
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Groupe
                  </th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {socialMedia.map((media, index) => (
                  <tr key={index} className="hover:bg-gray-100 transition">
                    <td className="px-6 py-4 whitespace-nowrap">{media.platform}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{media.group}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleRemoveSocialMedia(media.platform, media.group)}
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

          {/* Modale pour ajouter un réseau social */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
                {/* Bouton pour fermer */}
                <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-red-500">
                  X
                </button>

                {/* Formulaire pour ajouter un réseau social */}
                <h2 className="text-xl font-bold mb-4">Ajouter un Réseau Social</h2>
                <form onSubmit={(e) => e.preventDefault()}>
                  {/* Sélection de la plateforme */}
                  <div className="mb-4">
                    <label>Plateforme</label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
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
                  </div>

                  {/* Numéro de groupe */}
                  <div className="mb-4">
                    <label>Numéro de Groupe</label>
                    <input
                      type="number"
                      value={groupNumber}
                      onChange={(e) => setGroupNumber(e.target.value)}
                      className="w-full p-2 border rounded"
                      required
                    />
                  </div>

                  {/* Champs spécifiques aux tokens */}
                  {platform === "TikTok" && (
                    <>
                      <label>API Key</label>
                      <input
                        type="text"
                        onChange={(e) => setTokens({ ...tokens, apiKey: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                      <label>Secret Key</label>
                      <input
                        type="text"
                        onChange={(e) => setTokens({ ...tokens, secretKey: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </>
                  )}
                  {platform === "Bluesky" && (
                    <>
                      <label>Nom</label>
                      <input
                        type="text"
                        onChange={(e) => setTokens({ ...tokens, name: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                      <label>Mot de passe</label>
                      <input
                        type="text"
                        onChange={(e) => setTokens({ ...tokens, pass: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </>
                  )}
                  {platform === "X" && (
                    <>
                      <label>appKey</label>
                      <input
                        type="text"
                        onChange={(e) => setTokens({ ...tokens, appKey: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                      <label>appSecret</label>
                      <input
                        type="text"
                        onChange={(e) => setTokens({ ...tokens, appSecret: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                      <label>accessToken</label>
                      <input
                        type="text"
                        onChange={(e) => setTokens({ ...tokens, accessToken: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                      <label>accessSecret</label>
                      <input
                        type="text"
                        onChange={(e) => setTokens({ ...tokens, accessSecret: e.target.value })}
                        className="w-full p-2 border rounded"
                        required
                      />
                    </>
                  )}
                  {/* Ajoutez d'autres champs similaires pour Threads */}

                  {/* Bouton pour soumettre */}
                  <button
                    onClick={handleAddSocialMedia}
                    type="button"
                    className="w-full bg-blue-500 text-white py-2 mt-4 rounded"
                  >
                    Ajouter Réseau Social
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        {/* Modale pour les détails de la tâche */}
        {isModalOpen && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
              {/* Bouton pour fermer */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
              >
                X
              </button>

              {/* Détails de la tâche */}
              <h2 className="text-xl font-bold mb-4 text-gray-800">{selectedTask.title}</h2>

              {/* Réseau Social avec Icône */}
              <div className="flex items-center space-x-2 mb-2">
                <p className="text-gray-700 capitalize"><strong>Réseau :</strong></p>
                <img
                  src={`/icons/${selectedTask.socialPlatform.toLowerCase()}.svg`}
                  alt={selectedTask.socialPlatform}
                  className="w-8 h-8"
                  title={selectedTask.socialPlatform}
                />
              </div>

              {/* Date de Publication */}
              <p className="text-gray-700 mb-2"><strong>Date de Publication :</strong> {new Date(selectedTask.date).toLocaleString()}</p>

              {/* Contenu */}
              <p className="text-gray-700 mb-4"><strong>Contenu :</strong> {selectedTask.content}</p>

              {/* Affichage de l'image ou vidéo si disponible */}
              {selectedTask.filePath ? (
                selectedTask.filePath.endsWith(".mp4") || selectedTask.filePath.endsWith(".mpeg") ? (
                  <video controls className="mt-4 w-full rounded-lg shadow-md">
                    <source src={`http://localhost:5001${selectedTask.filePath}`} type="video/mp4" />
                    Votre navigateur ne supporte pas les vidéos.
                  </video>
                ) : (
                  <img
                    src={`http://localhost:5001/uploads/tasks/${selectedTask.filePath}`}
                    alt={selectedTask.title}
                    className="mt-4 w-full rounded-lg shadow-md"
                  />
                )
              ) : (
                <p className="mt-4 text-gray-500">Aucun fichier associé.</p>
              )}
            </div>
          </div>
        )}

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
