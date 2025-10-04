export default function TermsPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Terms of Service</h1>
      <p className="mb-4">
        By accessing and using Kawaii Nights, you agree to comply with the following terms.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Use of the Site</h2>
      <p className="mb-4">
        This website is intended for informational purposes only. Users must be at least 18 years old
        to access nightlife-related content.
      </p>
      <h2 className="text-xl font-semibold mt-6 mb-2">Prohibited Activities</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Using the site for unlawful purposes</li>
        <li>Copying or redistributing content without permission</li>
        <li>Attempting to disrupt site functionality</li>
      </ul>
      <h2 className="text-xl font-semibold mt-6 mb-2">Disclaimer</h2>
      <p>
        We do not guarantee the accuracy of the information provided. Users are responsible for
        verifying details with each venue before visiting.
      </p>
    </main>
  );
}
