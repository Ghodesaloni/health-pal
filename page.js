"use client";

import { useState } from "react";

const RADIUS_OPTIONS = [
  { label: "1 km", value: 1000 },
  { label: "3 km", value: 3000 },
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
];

function toRad(value) {
  return (value * Math.PI) / 180;
}

function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function ClinicsPage() {
  const [radius, setRadius] = useState(3000);
  const [status, setStatus] = useState("idle");
  const [clinics, setClinics] = useState([]);
  const [error, setError] = useState("");

  function findClinics() {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setError("Geolocation is not supported in this browser.");
      return;
    }

    setStatus("locating");
    setError("");
    setClinics([]);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setStatus("searching");

        const query = `
          [out:json][timeout:25];
          (
            node["amenity"~"^(clinic|hospital|doctors|pharmacy)$"](around:${radius},${latitude},${longitude});
            way["amenity"~"^(clinic|hospital|doctors|pharmacy)$"](around:${radius},${latitude},${longitude});
          );
          out center 30;
        `;

        try {
          const res = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: query,
          });

          if (!res.ok) {
            throw new Error("Could not reach the clinic directory. Please try again.");
          }

          const data = await res.json();

          const results = (data.elements || [])
            .map((el) => {
              const lat = el.lat ?? el.center?.lat;
              const lon = el.lon ?? el.center?.lon;
              if (lat == null || lon == null) return null;

              return {
                id: el.id,
                name: el.tags?.name || "Unnamed clinic",
                type: el.tags?.amenity,
                address:
                  [el.tags?.["addr:street"], el.tags?.["addr:housenumber"], el.tags?.["addr:city"]]
                    .filter(Boolean)
                    .join(", ") || "Address not listed",
                distance: distanceKm(latitude, longitude, lat, lon),
                lat,
                lon,
              };
            })
            .filter(Boolean)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 20);

          setClinics(results);
          setStatus("done");
        } catch (err) {
          setError(err.message || "Something went wrong while searching for clinics.");
          setStatus("error");
        }
      },
      () => {
        setError("Location access was denied. Please allow location access and try again.");
        setStatus("error");
      }
    );
  }

  return (
    <main className="shell">
      <div className="tool-header">
        <span className="eyebrow">Find Clinics</span>
        <h1>What is open near you.</h1>
        <p>
          HealthPal uses your location to find nearby clinics, hospitals,
          doctors, and pharmacies, sorted by distance.
        </p>
      </div>

      <div className="locate-row">
        <select
          className="radius-select"
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
        >
          {RADIUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Within {opt.label}
            </option>
          ))}
        </select>
        <button className="btn btn-coral" onClick={findClinics} disabled={status === "locating" || status === "searching"}>
          {status === "locating" || status === "searching" ? "Searching..." : "Use my location"}
        </button>
      </div>

      {status === "locating" && <p className="status-line">Getting your location...</p>}
      {status === "searching" && <p className="status-line">Searching nearby clinics...</p>}
      {status === "done" && (
        <p className="status-line">
          {clinics.length > 0
            ? "Found " + clinics.length + " place(s) within " + (radius / 1000) + " km."
            : "No clinics found in this radius. Try a larger radius."}
        </p>
      )}
      {error && <p className="status-line">{error}</p>}

      <div className="clinic-list">
        {clinics.map((c) => (
          <a
            key={c.id}
            className="clinic-card"
            href={"https://www.openstreetmap.org/?mlat=" + c.lat + "&mlon=" + c.lon + "#map=18/" + c.lat + "/" + c.lon}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div>
              <div className="name">{c.name}</div>
              <div className="meta">
                {c.type ? c.type.charAt(0).toUpperCase() + c.type.slice(1) : "Clinic"} · {c.address}
              </div>
            </div>
            <div className="distance">{c.distance.toFixed(1)} km</div>
          </a>
        ))}
      </div>
    </main>
  );
}
