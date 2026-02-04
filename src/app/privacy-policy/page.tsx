import Link from "next/link";

export const metadata = {
    title: "Privacy Policy - Nossa Rewards",
    description: "Privacy Policy for Nossa Rewards (NRWD) platform",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Header */}
            <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
                    <Link
                        href="/"
                        className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                    >
                        Nossa Rewards
                    </Link>
                    <Link
                        href="/"
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        ← Back to Home
                    </Link>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-6 py-12">
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 md:p-12 border border-gray-200 dark:border-gray-700">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Privacy Policy
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                        Last updated: February 5, 2026
                    </p>

                    <div className="prose prose-gray dark:prose-invert max-w-none">
                        {/* Section 1 */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                1. Information We Collect
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                When you visit this website, certain information
                                may be collected automatically, including but
                                not limited to IP address, browser type, device
                                information, operating system, referral URLs,
                                and usage data related to interactions with the
                                website.
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">
                                If you voluntarily provide information (for
                                example, by contacting us), such information may
                                include your name, email address, or other
                                contact details.
                            </p>
                        </section>

                        {/* Section 2 */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                2. Use of Third-Party Services
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                This website uses third-party services that may
                                collect and process data independently in
                                accordance with their own privacy policies.
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                In particular, this website embeds a CertiK
                                Emblem (badge widget), which is provided by
                                Certified Kernel Tech LLC (CertiK).
                            </p>
                            <p className="text-gray-700 dark:text-gray-300 mb-4">
                                The CertiK Emblem may use embedded scripts and
                                tracking technologies to collect certain
                                technical and usage data from visitors,
                                including IP address, interaction data, and
                                viewing information, for purposes such as
                                security monitoring, analytics, reputation
                                display, and service improvement.
                            </p>
                            <p className="text-gray-700 dark:text-gray-300">
                                CertiK's processing of data is governed by its
                                own Privacy Policy, available at:{" "}
                                <a
                                    href="https://www.certik.com/company/privacy-policy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    https://www.certik.com/company/privacy-policy
                                </a>
                            </p>
                        </section>

                        {/* Section 3 */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                3. Purpose of Data Processing
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-3">
                                Collected data may be used to:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300 ml-4">
                                <li>Operate and maintain the website</li>
                                <li>
                                    Improve user experience and site performance
                                </li>
                                <li>
                                    Display security, audit, or reputation
                                    information
                                </li>
                                <li>
                                    Comply with legal and regulatory obligations
                                </li>
                            </ul>
                        </section>

                        {/* Section 4 */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                4. Data Sharing and International Transfers
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300">
                                Data collected through third-party services may
                                be processed in jurisdictions outside your
                                country of residence, including the United
                                States and other locations, in accordance with
                                applicable data protection laws.
                            </p>
                        </section>

                        {/* Section 5 */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                5. Cookies and Tracking Technologies
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300">
                                This website and embedded third-party services
                                may use cookies or similar technologies where
                                legally required. Where applicable, users may
                                manage cookie preferences through their browser
                                settings.
                            </p>
                        </section>

                        {/* Section 6 */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                6. Your Rights
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300">
                                Depending on your jurisdiction, you may have
                                rights related to your personal data, including
                                the right to access, correct, or request
                                deletion of your data, subject to applicable
                                laws.
                            </p>
                        </section>

                        {/* Section 7 */}
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                7. Contact
                            </h2>
                            <p className="text-gray-700 dark:text-gray-300">
                                If you have questions regarding this Privacy
                                Policy or data processing practices, you may
                                contact us at:{" "}
                                <a
                                    href="mailto:nrwdnossa@gmail.com"
                                    className="text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                    nrwdnossa@gmail.com
                                </a>
                            </p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
