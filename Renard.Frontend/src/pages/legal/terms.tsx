import { LegalLayout } from "@/components/layout/legal-layout";

export default function TermsPage() {
  return (
    <LegalLayout title="Terms and Conditions" lastUpdated="December 17, 2025">
      <section>
        <p className="text-lg text-muted-foreground">
          Welcome to Renard! By downloading, installing, or using our Browser
          Extension, CLI Tool (`npm install -g renard`), or accessing our
          website, you agree to be bound by these Terms and Conditions.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          1. Use of the Service
        </h2>
        <p className="mb-4">
          Renard grants you a limited, non-exclusive, non-transferable license
          to use our tools for personal or internal business purposes, subject
          to these Terms.
        </p>

        <h3 className="font-semibold text-foreground mt-6 mb-2">
          Acceptable Use
        </h3>
        <p className="mb-2">You agree NOT to use Renard to:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
          <li>
            Capture or store data that violates the privacy rights of others.
          </li>
          <li>
            Reverse engineer or attempt to extract the source code of the Renard
            backend.
          </li>
          <li>
            Overload our infrastructure with excessive automated requests
            (DDoS).
          </li>
          <li>
            Use the CLI tool to inject malicious code into shared development
            environments.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          2. Developer Tools & CLI Usage
        </h2>
        <p className="mb-4">
          The Renard CLI acts as a wrapper and log-reader for third-party tools
          (Claude, Gemini, etc.). By using the CLI:
        </p>
        <ul className="list-disc list-inside space-y-2 text-muted-foreground">
          <li>
            You acknowledge that you have the rights to access the files on the
            machine where the CLI is installed.
          </li>
          <li>
            You understand that Renard acts as a passive observer of these logs
            and does not modify the core functionality of the underlying LLM
            tools.
          </li>
          <li>
            You are responsible for ensuring that no secrets (API keys,
            passwords) are inadvertently typed into prompts that Renard
            captures, although our backend validation layer attempts to filter
            these out.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          3. Intellectual Property
        </h2>
        <p>
          The Renard software, design, and "Fox" branding are exclusive property
          of Renard. However,{" "}
          <strong>
            you retain full ownership of the data (logs and conversations)
          </strong>{" "}
          you generate and sync to our platform. We claim no intellectual
          property rights over your code snippets or conversation content.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          4. Disclaimer of Warranties
        </h2>
        <div className="p-4 bg-secondary/20 rounded-lg text-sm text-muted-foreground border border-border/50 uppercase tracking-wide leading-relaxed">
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE". RENARD DISCLAIMS
          ALL WARRANTIES, WHETHER EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF
          MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE. WE DO NOT
          GUARANTEE THAT THE EXTENSION WILL CAPTURE 100% OF INTERACTIONS OR THAT
          IT WILL BE COMPATIBLE WITH FUTURE UPDATES OF THIRD-PARTY PLATFORMS
          LIKE CHATGPT OR CLAUDE.
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          5. Limitation of Liability
        </h2>
        <p>
          In no event shall Renard be liable for any indirect, incidental,
          special, or consequential damages arising out of your use of the
          service. This includes, but is not limited to, loss of code, loss of
          profits, or data corruption resulting from CLI file operations.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          6. Termination
        </h2>
        <p>
          We reserve the right to suspend or terminate your access to Renard
          immediately, without prior notice, if you breach these Terms,
          particularly regarding the "Acceptable Use" policy.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          7. Changes to Terms
        </h2>
        <p>
          We may modify these terms at any time. We will notify users of
          significant changes via email or an in-dashboard notification.
          Continued use of Renard after changes constitutes acceptance of the
          new terms.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          8. Contact Information
        </h2>
        <p>
          For legal inquiries, please contact: <br />
          <a
            href="mailto:support@renard.live"
            className="text-primary hover:underline font-medium"
          >
            support@renard.live
          </a>
        </p>
      </section>
    </LegalLayout>
  );
}
