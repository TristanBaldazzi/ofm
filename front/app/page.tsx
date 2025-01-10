import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center py-20 px-6 bg-white shadow-md">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900">
          Votre site d'artisan <span className="text-indigo-600">100% gratuit</span>
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Créez votre site en ligne en moins de <span className="font-semibold">14 jours</span>, sans frais.
        </p>
        <Link
          href="/login"
          className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition"
        >
          Commencez maintenant
        </Link>

      </section>

      {/* Steps Section */}
      <section className="py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 4.5v15m7.5-7.5h-15"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">Commande instantanée</h3>
            <p className="mt-2 text-gray-600">
              Passez votre commande en quelques clics, sans effort.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 10h11M9 21V3m4 18l7.5-7.5L13 3"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">Livraison rapide</h3>
            <p className="mt-2 text-gray-600">
              Votre site prêt en moins de 14 jours.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-8 h-8"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9.75 9L12 11.25m0 0L14.25 9m0 0v6m6.75-.75V18a2.25 2.25 0 01-.75 1.65M18.75 15H21m-.75-.75a2.25 2.25 0 00-.75-.75M9.75 9A2.25 2.25 0 007.5 7.5M12 .75v21m0-.75a2.25 2.25 0 01-.75-.75M12 .75A2.25 2.25 0 0014.25 .75m6 .75V18a2.25..."
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold">Dashboard complet</h3>
            <p className="mt-2 text-gray-600">
              Suivez vos statistiques, clients et formulaires.
            </p>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="py-8 bg-gray-800 text-gray-400 text-center">
        © {new Date().getFullYear()} OFM - Tous droits réservés.
      </footer>
    </div>
  );
}
