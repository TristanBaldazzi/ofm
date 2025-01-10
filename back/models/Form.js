const mongoose = require("mongoose");

const formSchema = new mongoose.Schema({
  // Lien avec l'entreprise ou l'utilisateur qui possède le formulaire
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company", // Assurez-vous que le modèle "Company" existe
    required: true,
  },

  // Détails du formulaire
  details: {
    title: {
      type: String,
      required: true, // Titre du formulaire (ex : "Formulaire de contact")
    },
    description: {
      type: String,
      required: true, // Description du formulaire
    },
    theme: {
      bg: { type: String, default: "#ffffff" }, // Couleur de fond
      vibrant: { type: String, default: "#ec64ff" }, // Couleur principale
      vibrantDarker: { type: String, default: "#da42e8" }, // Variante plus sombre
      text: { type: String, default: "#252525" }, // Couleur du texte
      textSubmitButton: { type: String, default: "#ffffff" }, // Texte du bouton de soumission
      label: { type: String, default: "#464646" }, // Couleur des labels
      border: { type: String, default: "#000000" }, // Couleur des bordures
      static: { type: String, default: "#eeeeee" }, // Couleur statique (ex : placeholder)
      focus: { type: String, default: "#e3e3e3" }, // Couleur au focus
      active: { type: String, default: "#464646" }, // Couleur active
      inactive: { type: String, default: "#4E4E4E" }, // Couleur inactive
      error: { type: String, default: "#E8474C" }, // Couleur des messages d'erreur
    },
    fields: [
      {
        label: {
          type: String,
          required: true, // Label du champ (ex : "Nom", "Email")
        },
        type: {
          type: String,
          enum: ["text", "textarea", "select", "checkbox", "radio"], // Type de champ
          required: true,
        },
        options: {
          type: [String], // Options pour les champs "select", "checkbox", ou "radio"
          default: [],
        },
        required: {
          type: Boolean,
          default: false, // Indique si le champ est obligatoire ou non
        },
      },
    ],
  },

  // Réponses au formulaire
  responses: [
    {
      responseId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
      },
      formData: [
        {
          fieldLabel: { type: String },
          fieldType: {
            type: String,
            enum: ["text", "textarea", "select", "checkbox", "radio"],
            required: true,
          },
          response: {
            type: mongoose.Schema.Types.Mixed,
          },
          submittedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      submittedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Form", formSchema);
