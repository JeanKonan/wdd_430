export default function Home() {
  return (
    <div className="space-y-8">
      <section className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-2xl font-bold mb-3">Welcome to RideSharing</h2>
        <p className="leading-relaxed mb-2">Share your journey, save money, and connect with others.</p>
        <div className="flex gap-4 mt-6">
          <button className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500">
            Browse Rides
          </button>
          <button className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400">
            Create Ride
          </button>
          <button className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400">
            Sign In
          </button>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-xl font-bold mb-2 mb-4">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl mb-2">1️⃣</div>
            <h4 className="font-bold mb-2">Create or Browse</h4>
            <p className="text-gray-600">Post a ride or search for available rides</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">2️⃣</div>
            <h4 className="font-bold mb-2">Request & Approve</h4>
            <p className="text-gray-600">Send requests or approve passengers</p>
          </div>
          <div className="text-center">
            <div className="text-4xl mb-2">3️⃣</div>
            <h4 className="font-bold mb-2">Share & Rate</h4>
            <p className="text-gray-600">Complete your ride and rate your experience</p>
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h3 className="text-xl font-bold mb-2 mb-4">Features</h3>
        <ul className="space-y-2">
          <li>✓ Easy ride creation and discovery</li>
          <li>✓ Secure user authentication</li>
          <li>✓ Real-time booking requests</li>
          <li>✓ User ratings and reviews</li>
          <li>✓ Mobile-friendly design</li>
        </ul>
      </section>
    </div>
  );
}
