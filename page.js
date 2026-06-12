import Link from "next/link";
import PulseLine from "../components/PulseLine";

export default function Home() {
  return (
    <main className="shell">
      <section className="hero">
        <span className="eyebrow">All-in-one virtual health platform</span>
        <h1>One pulse. Three kinds of care.</h1>
        <p className="lead">
          HealthPal gives you instant AI-powered medical guidance, an
          empathetic AI therapist you can talk to out loud, and a live map
          of clinics near you, every reading on one chart.
        </p>
      </section>

      <PulseLine />

      <section className="card-grid">
        <Link href="/medical" className="service-card">
          <div className="icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z" />
            </svg>
          </div>
          <h3>Medical AI</h3>
          <p>
            Describe your symptoms in plain language and get clear,
            conversational guidance powered by AI, available any hour.
          </p>
          <span className="go">Start a consult →</span>
        </Link>

        <Link href="/therapist" className="service-card">
          <div className="icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" x2="12" y1="19" y2="23" />
              <line x1="8" x2="16" y1="23" y2="23" />
            </svg>
          </div>
          <h3>Therapist AI</h3>
          <p>
            Talk through how you are feeling with a calm digital therapist.
            Speak out loud and hear it respond with empathetic speech.
          </p>
          <span className="go">Start a session →</span>
        </Link>

        <Link href="/clinics" className="service-card">
          <div className="icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <h3>Find Clinics</h3>
          <p>
            Share your location and instantly see nearby clinics and
            hospitals, sorted by distance, on a live readout.
          </p>
          <span className="go">Find nearby care →</span>
        </Link>
      </section>
    </main>
  );
}
