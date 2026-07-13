import {FileText, ShieldCheck} from "lucide-react";
import {PageHero, SiteFooter, SiteHeader} from "@/components/site-shell";

type LegalPageType = "terms" | "privacy";
type LegalSection = readonly [string, string];
type LegalPageCopy = {
  eyebrow: string;
  title: string;
  description: string;
  sections: readonly LegalSection[];
};
type LegalCopy = Record<LegalPageType, LegalPageCopy>;

const supportEmail = "support@votxt.io";

const legalCopy: LegalCopy = {
  terms: {
    eyebrow: "Terms",
    title: "Votxt Terms of Service",
    description: "Updated October 9, 2025",
    sections: [
      ["Agreement to These Terms", "These Terms of Service govern access to and use of Votxt, including the website, transcription, translation, AI analysis, export, sharing, account, billing, customer support, and related services. By creating an account, purchasing a plan, uploading content, inviting others to access shared content, or otherwise using the services, you agree to these terms."],
      ["Who May Use Votxt", "You must be legally able to enter into a binding agreement and must provide accurate account and billing information. If you use Votxt on behalf of a company, organization, or other legal entity, you represent that you have authority to bind that entity and that entity is responsible for your use."],
      ["Account Security", "You are responsible for maintaining the confidentiality of your credentials, restricting access to your account, and all activity under your account. You must promptly notify us if you suspect unauthorized access, credential compromise, or misuse of your account. We may require additional verification before acting on account, billing, deletion, or data-access requests."],
      ["Your Content and Required Rights", "You retain ownership of audio, video, recordings, URLs, files, text, transcripts, translations, summaries, prompts, exports, shared pages, and other content you submit or generate through Votxt. You grant Votxt a limited, non-exclusive, worldwide license to host, store, copy, process, transmit, transcribe, translate, analyze, summarize, display, export, and share that content solely to provide, secure, support, improve, and maintain the services. You are responsible for having all rights, consents, notices, and lawful bases required to collect, upload, record, process, analyze, export, and share content."],
      ["Recording, Privacy, and Third-Party Rights", "You must comply with all applicable recording, communications, employment, privacy, data protection, intellectual property, confidentiality, and consumer protection laws. Do not upload or process content if doing so would violate another person's rights, a contractual obligation, platform rule, court order, professional duty, or applicable law."],
      ["AI and Transcription Output", "Transcripts, translations, speaker labels, chapters, summaries, mind maps, action items, and other AI-generated or machine-generated outputs may be incomplete, delayed, inaccurate, offensive, or unsuitable for your purpose. You are solely responsible for reviewing, correcting, validating, and deciding whether to rely on outputs. Votxt does not provide legal, medical, financial, employment, tax, compliance, or other professional advice, and outputs must not be used as the sole basis for high-impact decisions."],
      ["Acceptable Use", "You may not use Votxt to break the law, infringe rights, process content without authorization, facilitate surveillance or profiling in violation of law, create or distribute malware, spam, phishing, or abusive content, harass or harm others, overload or disrupt the service, bypass usage limits or security controls, scrape or resell the service, reverse engineer restricted components, or use shared links to disclose confidential, unlawful, or harmful content."],
      ["Plans, Usage Limits, and Availability", "Plans may include different minute balances, upload limits, processing priority, storage periods, export formats, collaboration features, and AI capabilities. We may enforce fair-use, anti-abuse, file-size, rate, storage, queue, model, and feature limits. The services may be interrupted, delayed, degraded, or unavailable because of maintenance, incidents, third-party services, model changes, network conditions, or events outside our reasonable control."],
      ["Billing, Taxes, and Payment Providers", "Paid plans, renewals, one-time purchases, upgrades, downgrades, discounts, taxes, and currency conversion terms are presented at checkout or in your account. Payments are processed by third-party payment providers such as Stripe. Votxt does not store full payment card numbers. You authorize us and our payment providers to charge applicable fees, taxes, and recurring amounts for the plan you select."],
      ["Cancellations, Expiration, and Refunds", "You may cancel a subscription through available billing controls or by contacting support where self-service controls are not available. Unless checkout terms, a separate written policy, or applicable law requires otherwise, fees are non-refundable, and unused minutes, credits, promotional benefits, trial access, or one-time plan balances may expire or be forfeited according to the applicable plan terms."],
      ["Suspension and Termination", "We may suspend, restrict, or terminate access, remove content, disable shared links, or refuse processing if we reasonably believe there is unlawful activity, a terms violation, payment failure, security risk, abuse, rights infringement, excessive operational burden, or risk to Votxt, users, providers, or third parties. You may stop using Votxt at any time. After termination, content may become unavailable and may be deleted or retained according to our Privacy Policy, backup schedules, legal obligations, dispute needs, security requirements, and legitimate business records."],
      ["Third-Party Services and Processors", "Votxt uses third-party infrastructure, hosting, storage, database, payment, email, analytics, security, support, transcription, translation, and AI providers. Their services may be governed by their own terms and may change or become unavailable. We are not responsible for third-party services outside our reasonable control, but we use commercially reasonable efforts to select and manage providers appropriate for the services."],
      ["Intellectual Property", "Votxt, including its software, user interface, workflows, documentation, templates, designs, logos, branding, and service materials, is owned by Votxt or its licensors. Except for your content and rights expressly granted to you, these terms do not transfer any Votxt intellectual property. You may not copy, modify, resell, sublicense, make derivative works of, or commercially exploit Votxt except as permitted by these terms or written permission."],
      ["Confidentiality and Security", "You must use reasonable safeguards when uploading, exporting, downloading, or sharing sensitive content. Shared links may allow anyone with access to the link to view the shared material unless additional controls are available and enabled. You are responsible for managing recipients, permissions, downloads, and onward disclosure of exported or shared content."],
      ["Compliance With Laws", "You are responsible for determining whether Votxt is appropriate for your use case and for complying with laws that apply to your content, users, industry, and jurisdiction, including Hong Kong data protection requirements, overseas privacy laws, export controls, sanctions, and sector-specific confidentiality duties. You must not use Votxt where prohibited by law."],
      ["Disclaimers", "To the maximum extent permitted by law, Votxt is provided on an as-is and as-available basis. We disclaim all implied warranties, including merchantability, fitness for a particular purpose, title, non-infringement, uninterrupted operation, error-free operation, and accuracy of outputs. We do not warrant that the services will meet every legal, regulatory, professional, evidentiary, archival, accessibility, or business continuity requirement."],
      ["Limitation of Liability", "To the maximum extent permitted by law, Votxt and its owners, officers, employees, contractors, affiliates, licensors, and providers will not be liable for indirect, incidental, special, consequential, exemplary, punitive, or enhanced damages, lost profits, lost revenue, lost data, business interruption, reputational harm, replacement services, or loss arising from content, outputs, shared links, third-party services, or inability to use the services."],
      ["Indemnity", "You agree to defend, indemnify, and hold harmless Votxt and its owners, officers, employees, contractors, affiliates, licensors, and providers from claims, losses, liabilities, damages, penalties, costs, and expenses, including reasonable legal fees, arising from your content, your use of the services, your violation of these terms, or your violation of law or third-party rights."],
      ["Changes to Terms", "We may update these terms from time to time by posting a revised version. The updated date above indicates when these terms were last changed. Continued use of Votxt after changes become effective means you accept the revised terms."],
      ["Contact", "Questions about these terms, billing, or the services may be sent to support@votxt.io."]
    ]
  },
  privacy: {
    eyebrow: "Privacy",
    title: "Votxt Privacy Policy",
    description: "Effective May 1, 2026",
    sections: [
      ["Scope", "This Privacy Policy explains how Votxt collects, uses, discloses, retains, transfers, and protects personal data when you use the website, transcription, translation, AI analysis, export, sharing, account, billing, support, and related services. It is intended to support compliance with Hong Kong's Personal Data (Privacy) Ordinance, including the Data Protection Principles, and other privacy laws that may apply depending on where you and your users are located."],
      ["Our Role", "For personal data that we control, Votxt acts as a data user or controller. For personal data we process only on your instructions, such as content you upload for transcription or analysis, Votxt may act as a service provider or processor. You are responsible for determining your own legal basis, notices, consents, and compliance obligations for content and personal data you submit to Votxt."],
      ["Personal Data We Collect From You", "We collect information you provide directly, including name, email address, password or authentication details, account settings, language preference, billing selections, support messages, uploaded audio and video, recordings, URLs, files, text, prompts, edited transcripts, translations, summaries, exports, shared-link settings, and other content or metadata you choose to submit."],
      ["Personal Data Collected Automatically", "We may collect technical, usage, log, and diagnostic information, including IP address, device and browser type, operating system, referring and exit pages, pages viewed, timestamps, session identifiers, cookie identifiers, feature usage, upload status, processing status, error reports, approximate location inferred from technical signals, and security events."],
      ["Payment Data", "Payments are processed by third-party payment providers such as Stripe. Votxt may receive limited billing information, plan type, subscription status, transaction identifiers, payment status, invoice records, tax information, and fraud-prevention signals. We do not store full payment card numbers."],
      ["Purposes of Collection and Use", "We use personal data to create and administer accounts, authenticate users, provide transcription, translation, AI analysis, export, and sharing features, process uploads, manage billing, deliver customer support, communicate service notices, maintain security, prevent fraud and abuse, troubleshoot errors, improve reliability and product quality, enforce terms, protect rights, comply with law, and keep required business records."],
      ["Hong Kong Data Protection Principles", "We aim to collect personal data for lawful purposes directly related to Votxt's functions and activities, collect data that is necessary and not excessive, use data for the purposes stated in this policy or directly related purposes unless consent or law permits otherwise, take practicable steps to keep data accurate, retain data only as long as necessary, protect data against unauthorized or accidental access, processing, erasure, loss, or use, maintain transparent practices, and provide access and correction rights where required."],
      ["Legal Bases and Consent", "Where laws such as GDPR, UK GDPR, or similar regimes require a legal basis, we process personal data to perform a contract, comply with legal obligations, pursue legitimate interests such as service security and improvement, protect rights and safety, and rely on consent where required. Where Hong Kong direct marketing rules apply, we will seek the required informed consent or indication of no objection before using personal data for direct marketing or transferring it to another party for direct marketing."],
      ["AI, Transcription, and Media Processing", "To provide requested features, we may transmit necessary content, metadata, prompts, transcripts, translations, and outputs to transcription, translation, AI, hosting, storage, and infrastructure providers. We require appropriate arrangements with processors or service providers where required, including confidentiality, security, purpose limitation, and retention controls. Do not submit content unless you have authority and any required consent to have it processed by Votxt and its providers."],
      ["Disclosure of Personal Data", "We may disclose personal data to service providers, payment processors, infrastructure providers, analytics and security providers, professional advisers, affiliates, business transaction counterparties, law enforcement, regulators, courts, or other parties where necessary to provide the services, comply with law, enforce terms, protect rights and safety, investigate abuse, complete a merger, financing, acquisition, or asset transfer, or with your direction or consent."],
      ["International Transfers", "Votxt and its providers may process, store, and transfer personal data in Hong Kong, the United States, the European Economic Area, the United Kingdom, Singapore, and other locations where we or our providers operate. Where applicable law requires transfer safeguards, we use appropriate contractual, organizational, and technical measures designed to protect transferred personal data."],
      ["Retention", "We retain personal data for as long as necessary for the purposes described in this policy, including providing the services, maintaining accounts, completing transactions, complying with legal and tax obligations, resolving disputes, enforcing agreements, preserving security, preventing abuse, and maintaining backups. Retention periods may vary based on account status, plan type, content type, legal requirements, security needs, and user deletion settings."],
      ["Deletion and Account Closure", "You may delete certain tasks, exports, shared links, or account information through available product controls. You may also contact us to request deletion of personal data. We will delete, de-identify, or restrict data where required, subject to legal, security, fraud-prevention, backup, dispute, financial-record, and legitimate business retention requirements."],
      ["Access, Correction, and Other Rights", "Depending on your location, you may have rights to request access to personal data, correction of inaccurate data, deletion, restriction, portability, objection, withdrawal of consent, and information about how data is used or disclosed. Under Hong Kong law, data subjects have rights to request access to and correction of personal data. We may need to verify your identity and may refuse or limit requests where permitted by law."],
      ["Cookies and Similar Technologies", "We use cookies and similar technologies for authentication, security, preferences, analytics, performance, fraud prevention, and service operation. You can control cookies through browser settings, but disabling required cookies may prevent account login, uploads, billing, or other features from working correctly."],
      ["Security Measures", "We use reasonable administrative, technical, and organizational safeguards designed to protect personal data, including encrypted transport, access controls, secure session handling, provider access restrictions, monitoring, logging, backup practices, and role-based access. No system is completely secure, and you remain responsible for securing your devices, credentials, exports, downloads, and shared links."],
      ["Breach and Incident Handling", "If we become aware of a security incident affecting personal data, we will assess the incident, take appropriate containment and remediation steps, and notify affected users, regulators, or other parties where required by applicable law or where we otherwise determine notification is appropriate."],
      ["Children", "Votxt is not directed to children under 13, and we do not knowingly collect personal data from children under 13. If you believe a child has provided personal data to Votxt, contact us so we can take appropriate action."],
      ["Business Transfers", "If Votxt is involved in a merger, acquisition, financing, restructuring, bankruptcy, sale of assets, or similar transaction, personal data may be transferred or disclosed as part of that transaction, subject to reasonable confidentiality and data protection safeguards."],
      ["Changes to This Policy", "We may update this Privacy Policy from time to time to reflect legal, technical, operational, or business changes. The effective date above indicates when this policy became effective. Material changes may be communicated through the service or other appropriate means where required."],
      ["Contact and Privacy Requests", "Questions, privacy requests, access requests, correction requests, deletion requests, or concerns about personal data may be sent to support@votxt.io."]
    ]
  }
};

export function getLegalPageCopy(_locale: string, type: LegalPageType) {
  return legalCopy[type];
}

function renderLegalBody(body: string) {
  const [beforeEmail, afterEmail] = body.split(supportEmail);
  if (afterEmail === undefined) return body;

  return (
    <>
      {beforeEmail}
      <a className="font-semibold text-blue-600 underline underline-offset-2 hover:text-blue-700" href={`mailto:${supportEmail}`}>
        {supportEmail}
      </a>
      {afterEmail}
    </>
  );
}

export function LegalPage({type, locale}: {type: LegalPageType; locale: string}) {
  const copy = getLegalPageCopy(locale, type);
  const Icon = type === "privacy" ? ShieldCheck : FileText;

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <PageHero {...copy} />
      <section className="mx-auto grid max-w-4xl gap-4 px-4 py-12 md:px-8">
        {copy.sections.map(([heading, body]) => (
          <article key={heading} className="border-b border-ink/10 bg-transparent py-6">
            <h2 className="flex items-center gap-2 text-xl font-black text-ink"><Icon size={19} className="text-tide" />{heading}</h2>
            <p className="mt-3 text-sm leading-7 text-ink/70">{renderLegalBody(body)}</p>
          </article>
        ))}
      </section>
      <SiteFooter />
    </main>
  );
}
