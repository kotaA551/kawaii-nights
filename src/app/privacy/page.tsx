export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>
      <p className="mb-4">
        Kawaii Nights uses Google AdSense. Third-party vendors, including Google,
        use cookies to serve ads based on a user's prior visits to this website
        or other websites.
      </p>
      <p className="mb-4">
        Users may opt out of personalized advertising by visiting{" "}
        <a
          href="https://www.google.com/settings/ads/"
          className="text-pink-600 underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Google Ads Settings
        </a>.
      </p>
      <h2 className="text-xl font-semibold mt-8 mb-2">Personal Information</h2>
      <p>
        We will not share or sell your personal information to third parties,
        except as required by law.
      </p>
    </main>
  );
}
