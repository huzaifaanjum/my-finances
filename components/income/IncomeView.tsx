"use client";

import { useEffect, useState } from "react";
import k from "@/components/knowledge/knowledge.module.css";
import { useKnowledgeProgress } from "@/hooks/useKnowledgeProgress";
import { IDEAS } from "@/lib/income/ideas";
import BusinessTab from "./BusinessTab";
import IdeasTab from "./IdeasTab";
import s from "./income.module.css";
import PaymentsTab from "./PaymentsTab";

const TABS = [
  { id: "business", label: "Register", note: "Your Montreal business" },
  { id: "payments", label: "Get paid", note: "Services, fees, setup" },
  { id: "ideas", label: "Ideas", note: `${IDEAS.length} ways to earn, by effort` },
] as const;
type Tab = (typeof TABS)[number]["id"];

const TAB_KEY = "income_tab";

const SOURCES: { label: string; url: string }[] = [
  { label: "Registraire des entreprises fees", url: "https://www.quebec.ca/entreprises-et-travailleurs-autonomes/tarifs-registraire-entreprises/personne-physique-exploitant-une-entreprise-individuelle" },
  { label: "Enterprise name rules", url: "https://www.quebec.ca/en/businesses-and-self-employed-workers/start-entreprise/choose-entreprise-name/definition-rules" },
  { label: "OQLF on names and trademarks", url: "https://www.oqlf.gouv.qc.ca/francisation/entreprises/affichage-marques-noms.html" },
  { label: "GST and QST small suppliers", url: "https://www.revenuquebec.ca/en/businesses/consumption-taxes/gsthst-and-qst/registering-for-the-gst-and-qst/small-suppliers/" },
  { label: "QPP for the self-employed", url: "https://www.revenuquebec.ca/en/citizens/income-tax-return/paying-a-balance-due-or-receiving-a-refund/paying-contributions-and-premiums/contributions-and-premiums-payable-by-a-self-employed-person-or-a-member-of-a-partnership/qpp-contribution-payable-by-a-self-employed-person-or-a-member-of-a-partnership/" },
  { label: "Trademark fees", url: "https://ised-isde.canada.ca/site/canadian-intellectual-property-office/en/node/220" },
  { label: "Montreal occupancy permit", url: "https://montreal.ca/demarches/obtenir-un-permis-doccupation-pour-activite-commerciale-ou-professionnelle" },
  { label: "CNESST, self-employed workers", url: "https://www.cnesst.gouv.qc.ca/fr/travailleuses-travailleurs-autonomes" },
  { label: "Stripe Canada pricing", url: "https://stripe.com/en-ca/pricing" },
  { label: "PayPal Canada fees", url: "https://www.paypal.com/ca/business/paypal-business-fees" },
  { label: "Square Canada fees", url: "https://squareup.com/ca/en/payments/our-fees" },
  { label: "Helcim fee disclosures", url: "https://legal.helcim.com/ca/fee-disclosures/" },
  { label: "Paddle pricing", url: "https://www.paddle.com/pricing" },
  { label: "Creem pricing", url: "https://www.creem.io/pricing" },
  { label: "Polar pricing", url: "https://polar.sh/resources/pricing" },
  { label: "Gumroad pricing", url: "https://gumroad.com/pricing" },
  { label: "Apple Small Business Program", url: "https://developer.apple.com/app-store/small-business-program/" },
  { label: "Google Play service fees", url: "https://support.google.com/googleplay/android-developer/answer/112622" },
  { label: "GitHub Sponsors", url: "https://docs.github.com/en/sponsors/getting-started-with-github-sponsors/about-github-sponsors" },
];

/** Ideas for earning more, registering a business, and getting paid. Ticks save with your Knowledge progress. */
export default function IncomeView() {
  const { read, loading, error, toggle } = useKnowledgeProgress();
  const [tab, setTabState] = useState<Tab>("business");
  useEffect(() => {
    try {
      const t = localStorage.getItem(TAB_KEY);
      if (TABS.some((x) => x.id === t)) setTabState(t as Tab);
    } catch {}
  }, []);
  const setTab = (t: Tab) => {
    setTabState(t);
    try {
      localStorage.setItem(TAB_KEY, t);
    } catch {}
  };

  return (
    <>
      <div className="ps-tabs" role="tablist" aria-label="Revenue stream sections">
        {TABS.map((t) => (
          <button key={t.id} type="button" role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
            {t.label}
            <small>{t.note}</small>
          </button>
        ))}
      </div>

      <div role="tabpanel" className={`ps-panel ${s.panel}`}>
        {error && (
          <p className={k.err} role="alert">
            {error}
          </p>
        )}
        {loading && Object.keys(read).length === 0 ? (
          <div className={k.skel} aria-hidden="true">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="sk-b" style={{ height: 64 }} />
            ))}
          </div>
        ) : tab === "ideas" ? (
          <IdeasTab read={read} toggle={toggle} />
        ) : tab === "business" ? (
          <BusinessTab read={read} toggle={toggle} />
        ) : (
          <PaymentsTab read={read} toggle={toggle} />
        )}

        <section className={s.sec}>
          <h2 className="goal-sh">
            Sources <span>checked November 2026, confirm before you act</span>
          </h2>
          <ul className={s.sources}>
            {SOURCES.map((x) => (
              <li key={x.url}>
                <a href={x.url} target="_blank" rel="noreferrer">
                  {x.label}
                </a>
              </li>
            ))}
          </ul>
          <p className={k.note}>General information, not legal, tax or immigration advice. Rules and prices change, so confirm with the source, an accountant or a licensed consultant.</p>
        </section>
      </div>
    </>
  );
}
