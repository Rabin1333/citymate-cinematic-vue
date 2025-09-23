// src/pages/Payment.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getMovieById } from "../services/api";
import type { UiMovie } from "../services/api";

const Payment = () => {
  const { id } = useParams(); // movie id (string, Mongo _id)
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [movie, setMovie] = useState<UiMovie | null>(null);
  const [loading, setLoading] = useState(true);

  // Read query params sent from SeatSelection
  const seatsParam = searchParams.get("seats") || "";
  const date = searchParams.get("date") || "Today";
  const time = searchParams.get("time") || "";
  const cinema = searchParams.get("cinema") || "Downtown Cinema";
  const total = searchParams.get("total") || "0";

  const seats = useMemo(() => {
    return seatsParam ? seatsParam.split(",").filter(Boolean) : [];
  }, [seatsParam]);

  useEffect(() => {
    if (!id) return;
    
    let alive = true;
    (async () => {
      try {
        // Use getMovieById for better performance (single API call)
        const movie = await getMovieById(id);
        if (alive) setMovie(movie);
      } catch (e) {
        console.error("Failed to load movie on Payment page", e);
        if (alive) setMovie(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) return <div className="p-8">Loading…</div>;
  if (!movie) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-bold mb-2">Movie not found</h2>
        <p className="mb-4">The movie you're trying to pay for could not be loaded.</p>
        <button className="btn-cinema" onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-6">
          Payment
        </h1>

        <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-20 h-28 object-cover rounded-lg"
            />
            <div>
              <h2 className="text-xl font-semibold text-foreground">{movie.title}</h2>
              <p className="text-foreground-secondary">
                {cinema} • {date} • {time}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-foreground">Seats</h3>
            {seats.length ? (
              <p className="text-foreground">{seats.join(", ")}</p>
            ) : (
              <p className="text-foreground-secondary">No seats selected</p>
            )}
          </div>

          <div className="flex justify-between text-lg font-bold">
            <span className="text-foreground">Total</span>
            <span className="text-cinema-red">${total}</span>
          </div>

          {/* Stub payment action (Iteration-2: no real gateway needed) */}
          <button
            className="btn-cinema w-full"
            onClick={() => {
              // You already created the booking before navigating here.
              // For Iteration-2, it's enough to show a "success" and route home.
              alert("Payment simulated — booking confirmed!");
              navigate("/");
            }}
          >
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;