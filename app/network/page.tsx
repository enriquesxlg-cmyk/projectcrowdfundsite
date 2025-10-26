"use client";

import { useMemo, useState } from "react";

// Network page reimagined as an Events hub: browse hackathons, career fairs, panels, and workshops.

const CATEGORIES = [
  "Hackathon",
  "Career Fair",
  "Panel",
  "Workshop",
] as const;

type Category = typeof CATEGORIES[number];

type Attendance = "In-Person" | "Virtual" | "Hybrid";

interface EventItem {
  id: string;
  title: string;
  category: Category;
  date: string; // ISO date (yyyy-mm-dd)
  startTime?: string; // HH:mm (local to event)
  endTime?: string; // HH:mm
  attendance: Attendance;
  venue?: string;
  city?: string;
  state?: string;
  country?: string;
  url: string; // external registration/details link
  host?: string;
  price?: string; // e.g., Free, $25
  tags?: string[];
  description?: string;
}

// Temporary seed data. In a follow-up, we can store and fetch from Supabase.
const EVENTS: EventItem[] = [
  {
    id: "evt-h1",
    title: "Nexa x Community Hack Night",
    category: "Hackathon",
    date: "2025-11-08",
    startTime: "10:00",
    endTime: "18:00",
    attendance: "In-Person",
    venue: "Innovation Hub",
    city: "Austin",
    state: "TX",
    country: "USA",
    url: "https://lu.ma/",
    host: "NexaFund + Local Devs",
    price: "Free",
    tags: ["AI", "Web", "Open Source"],
    description:
      "A friendly day hack to build scrappy prototypes and meet collaborators.",
  },
  {
    id: "evt-cf1",
    title: "Tech Career Fair – Winter Edition",
    category: "Career Fair",
    date: "2025-11-15",
    startTime: "11:00",
    endTime: "16:00",
    attendance: "Hybrid",
    venue: "Convention Center Hall B",
    city: "Seattle",
    state: "WA",
    country: "USA",
    url: "https://eventbrite.com/",
    host: "TechBridge",
    price: "Free w/ RSVP",
    tags: ["Internships", "Early Career"],
  },
  {
    id: "evt-p1",
    title: "Designing Your First Startup Panel",
    category: "Panel",
    date: "2025-11-05",
    startTime: "18:30",
    endTime: "20:00",
    attendance: "Virtual",
    url: "https://zoom.us/",
    host: "FounderTalks",
    price: "Free",
    tags: ["Founders", "UX", "Product"],
  },
  {
    id: "evt-w1",
    title: "Practical AI Workshop: From Idea to MVP",
    category: "Workshop",
    date: "2025-11-22",
    startTime: "09:30",
    endTime: "12:30",
    attendance: "Virtual",
    url: "https://lu.ma/",
    host: "MVP School",
    price: "$25",
    tags: ["AI", "Prototyping"],
  },
  {
    id: "evt-h2",
    title: "Campus Mini-Hack",
    category: "Hackathon",
    date: "2025-11-29",
    startTime: "10:00",
    endTime: "17:00",
    attendance: "In-Person",
    venue: "Student Union",
    city: "Ann Arbor",
    state: "MI",
    country: "USA",
    url: "https://example.org/",
    host: "Hackers@U",
    price: "Free",
  },
  {
    id: "evt-cf2",
    title: "Diversity in Tech Career Expo",
    category: "Career Fair",
    date: "2025-12-03",
    startTime: "12:00",
    endTime: "17:00",
    attendance: "Virtual",
    url: "https://hopin.com/",
    host: "EqualTech",
    price: "Free",
    tags: ["Remote", "Diversity"],
  },
];

function toDate(d: string): Date {
  // Ensure we interpret as local date at midnight for consistent compare
  const [y, m, day] = d.split("-").map((n) => Number(n));
  return new Date(y, m - 1, day);
}

function formatDate(d: string): string {
  return toDate(d).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function NetworkEventsPage() {
  const [query, setQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<Category>>(new Set());
  const [attendance, setAttendance] = useState<Attendance | "All">("All");
  const [when, setWhen] = useState<"All" | "This Week" | "This Month">("All");

  const today = new Date();

  const filtered = useMemo(() => {
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // Monday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    return EVENTS.filter((e) => {
      const date = toDate(e.date);

      // Only upcoming or today
      if (date < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
        return false;
      }

      if (when === "This Week" && (date < startOfWeek || date > endOfWeek)) return false;
      if (when === "This Month" && (date < startOfMonth || date > endOfMonth)) return false;

      if (attendance !== "All" && e.attendance !== attendance) return false;

      if (selectedCategories.size > 0 && !selectedCategories.has(e.category)) return false;

      const q = query.trim().toLowerCase();
      if (q.length) {
        const hay = [
          e.title,
          e.host ?? "",
          e.venue ?? "",
          e.city ?? "",
          e.state ?? "",
          e.country ?? "",
          ...(e.tags ?? []),
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    }).sort((a, b) => toDate(a.date).getTime() - toDate(b.date).getTime());
  }, [today, query, attendance, selectedCategories, when]);

  function toggleCategory(cat: Category) {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="mb-8 text-4xl font-bold">Networking Events</h1>

      {/* Controls */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-1 flex-col gap-3">
          <label className="text-sm font-medium" htmlFor="search">
            Search (title, host, city, tags)
          </label>
          <input
            id="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Try: Austin, AI, Career Fair..."
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">When</label>
            <select
              value={when}
              onChange={(e) => setWhen(e.target.value as typeof when)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            >
              <option>All</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Attendance</label>
            <select
              value={attendance}
              onChange={(e) => setAttendance(e.target.value as Attendance | "All")}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
            >
              <option>All</option>
              <option>In-Person</option>
              <option>Virtual</option>
              <option>Hybrid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category chips */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const active = selectedCategories.has(cat);
          return (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              aria-pressed={active}
              className={
                "rounded-full border px-3 py-1 text-sm transition-colors " +
                (active
                  ? "border-purple-600 bg-purple-600 text-white hover:bg-purple-700"
                  : "border-gray-300 bg-white text-gray-700 hover:border-purple-300 hover:text-purple-700")
              }
            >
              {cat}
            </button>
          );
        })}
        {selectedCategories.size > 0 && (
          <button
            onClick={() => setSelectedCategories(new Set())}
            className="rounded-full border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 hover:border-red-300 hover:text-red-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="py-16 text-center text-gray-600">No events match your filters.</p>
      ) : (
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => {
            const location =
              e.attendance === "Virtual"
                ? "Online"
                : [e.venue, e.city, e.state, e.country].filter(Boolean).join(", ");
            return (
              <article
                key={e.id}
                className="group rounded-lg border border-gray-200 bg-white p-5 transition-all hover:border-purple-300 hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                    {e.category}
                  </span>
                  <span className="text-sm text-gray-600">{formatDate(e.date)}</span>
                </div>
                <h3 className="mb-1 line-clamp-2 text-lg font-semibold text-gray-900">
                  {e.title}
                </h3>
                {e.host && (
                  <p className="text-sm text-gray-600">Hosted by {e.host}</p>
                )}
                <p className="mt-2 text-sm text-gray-700">
                  {location}
                  {e.startTime && (
                    <>
                      {" "}• {e.startTime}
                      {e.endTime ? `–${e.endTime}` : ""}
                    </>
                  )}
                </p>
                {e.tags && e.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {e.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs text-gray-700"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-600">{e.attendance}{e.price ? ` • ${e.price}` : ""}</span>
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-purple-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-purple-700"
                  >
                    Details
                  </a>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* Note */}
      <p className="mt-10 text-center text-xs text-gray-500">
        Don’t see an event you love? In a future update you’ll be able to submit your own and we’ll feature it here.
      </p>
    </main>
  );
}
