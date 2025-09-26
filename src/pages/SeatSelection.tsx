// src/pages/SeatSelection.tsx
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Monitor, Eye } from "lucide-react";
import { getMovies, createBooking } from "../services/api"; // <-- API calls
import type { UiMovie } from "../services/api";
import { useToast } from "@/hooks/use-toast";
import SeatPreviewModal from "@/components/SeatPreviewModal";

type SeatType = "regular" | "premium" | "vip";
type SeatStatus = "available" | "selected" | "booked";

interface Seat {
  id: string;
  row: string;
  number: number;
  type: SeatType;
  status: SeatStatus;
  price: number;
}

const SeatSelection = () => {
  console.log("=== SeatSelection Component Started ===");
  
  const { id } = useParams(); // movie id (string)
  console.log("Movie ID from useParams:", id);
  console.log("Type of ID:", typeof id);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  console.log("Search params:", {
    date: searchParams.get("date"),
    time: searchParams.get("time"), 
    cinema: searchParams.get("cinema")
  });

  const [movie, setMovie] = useState<UiMovie | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewZone, setPreviewZone] = useState<{ zoneId: string; zoneName: string } | null>(null);
  const date = searchParams.get("date") ?? "Today";
  const time = searchParams.get("time") ?? "";
  const cinema = searchParams.get("cinema") ?? "Downtown Cinema";

  // --- Load movie from API ---
  useEffect(() => {
    console.log("useEffect triggered, looking for movie with ID:", id);
    let alive = true;
    (async () => {
      try {
        console.log("Fetching movies...");
        const all = await getMovies(false);
        console.log("Received movies:", all.length, "total");
        console.log("Available movie IDs:", all.map(x => x.id));
        console.log("Looking for ID:", id);
        
        const m = all.find((x) => x.id === id);
        console.log("Found movie:", m ? `${m.title} (ID: ${m.id})` : "NOT FOUND");
        
        if (alive) setMovie(m ?? null);
      } catch (e) {
        console.error("Failed to load movie", e);
        if (alive) setMovie(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  // --- Generate seat map once we know pricing ---
  const seats = useMemo<Seat[]>(() => {
    if (!movie) return [];
    const rows = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const out: Seat[] = [];

    rows.forEach((row, rowIndex) => {
      const seatsPerRow = 12;
      for (let i = 1; i <= seatsPerRow; i++) {
        let type: SeatType = "regular";
        let price = movie.pricing.regular;

        if (rowIndex <= 1) {
          type = "vip";
          price = movie.pricing.vip;
        } else if (rowIndex <= 4) {
          type = "premium";
          price = movie.pricing.premium;
        }

        // simple demo: randomly mark some seats booked
        const isBooked = Math.random() < 0.15;

        out.push({
          id: `${row}${i}`,
          row,
          number: i,
          type,
          status: isBooked ? "booked" : "available",
          price,
        });
      }
    });

    return out;
  }, [movie]);

  const handleSeatClick = (clicked: Seat) => {
    if (clicked.status === "booked") return;
    setSelectedSeats((prev) =>
      prev.some((s) => s.id === clicked.id)
        ? prev.filter((s) => s.id !== clicked.id)
        : [...prev, clicked]
    );
  };

  const getSeatClassName = (seat: Seat) => {
    const isSelected = selectedSeats.some((s) => s.id === seat.id);
    const base =
      "w-8 h-8 rounded-t-lg border-2 cursor-pointer transition-all duration-200 text-xs font-medium flex items-center justify-center";

    if (seat.status === "booked") return `${base} bg-red-500 border-red-600 cursor-not-allowed text-white`;
    if (isSelected) return `${base} bg-cinema-red border-cinema-red text-white scale-110`;

    switch (seat.type) {
      case "vip":
        return `${base} bg-amber-100 border-amber-300 hover:bg-amber-200 text-amber-800`;
      case "premium":
        return `${base} bg-blue-100 border-blue-300 hover:bg-blue-200 text-blue-800`;
      default:
        return `${base} bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-800`;
    }
  };

  const totalPrice = selectedSeats.reduce((sum, s) => sum + s.price, 0);

  // Handle seat preview
  const handlePreviewSeat = (seatType: SeatType) => {
    const zoneMap = {
      regular: { zoneId: "regular", zoneName: "Regular" },
      premium: { zoneId: "premium", zoneName: "Premium" },
      vip: { zoneId: "vip", zoneName: "VIP" }
    };
    
    const zone = zoneMap[seatType];
    setPreviewZone(zone);
    setPreviewModalOpen(true);
  };

  const getAuditoriumId = () => {
    // Create auditorium ID that matches backend seeded data
    return "downtown-screen-1"; // Match the seeded auditorium ID
  };

  // --- Step 6: Create booking via API ---
  const handleProceedToPayment = async () => {
    if (!movie) return;
    if (!time) {
      toast({
        title: "Showtime Required",
        description: "Please choose a showtime first.",
        variant: "destructive",
      });
      return;
    }
    if (selectedSeats.length === 0) return;

    // token saved on login (Local Storage)
    const token = localStorage.getItem("token")?.replace(/^"+|"+$/g, "");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const seatIds = selectedSeats.map((s) => s.id);
      
      // Create the payload object that matches CreateBookingBody interface
      const payload = {
        movieId: movie.id,
        showtime: time,
        seats: seatIds,
        cinema: cinema // optional field
      };
      
      // Call createBooking with the correct signature - get the booking ID
      const response = await createBooking(token, payload);
      
      toast({
        title: "Booking Created",
        description: "Redirecting to payment...",
      });
      
      // Navigate to payment page with booking ID
      navigate(`/payment?bookingId=${response._id}`);
    } catch (err) {
      console.error(err);
      toast({
        title: "Booking Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) return <div className="p-8">Loading…</div>;
  if (!movie) return <div className="p-8">Movie not found</div>;

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-card rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Select Seats</h1>
            <p className="text-foreground-secondary">
              {movie.title} • {cinema} • {date} • {time || "Select time"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Seat Map */}
          <div className="lg:col-span-3">
            <div className="bg-card rounded-2xl p-6 border border-border">
              {/* Screen */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center gap-2 bg-gradient-to-r from-cinema-red/20 to-cinema-accent/20 px-6 py-3 rounded-2xl">
                  <Monitor className="w-6 h-6 text-cinema-red" />
                  <span className="text-foreground font-medium">SCREEN</span>
                </div>
              </div>

              {/* Legend with Preview Buttons */}
              <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded-t"></div>
                  <span className="text-foreground-secondary">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-cinema-red border border-cinema-red rounded-t"></div>
                  <span className="text-foreground-secondary">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 border border-red-600 rounded-t"></div>
                  <span className="text-foreground-secondary">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded-t"></div>
                  <span className="text-foreground-secondary">Premium</span>
                  <button
                    onClick={() => handlePreviewSeat("premium")}
                    className="ml-1 p-1 text-blue-600 hover:text-blue-800 transition-colors"
                    title="Preview Premium seats"
                    aria-label="Preview Premium seating area"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-100 border border-amber-300 rounded-t"></div>
                  <span className="text-foreground-secondary">VIP</span>
                  <button
                    onClick={() => handlePreviewSeat("vip")}
                    className="ml-1 p-1 text-amber-600 hover:text-amber-800 transition-colors"
                    title="Preview VIP seats"
                    aria-label="Preview VIP seating area"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-foreground-secondary">Regular</span>
                  <button
                    onClick={() => handlePreviewSeat("regular")}
                    className="ml-1 p-1 text-gray-600 hover:text-gray-800 transition-colors"
                    title="Preview Regular seats"
                    aria-label="Preview Regular seating area"
                  >
                    <Eye className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Seats */}
              <div className="space-y-4">
                {["A", "B", "C", "D", "E", "F", "G", "H"].map((row) => (
                  <div key={row} className="flex items-center justify-center gap-2">
                    <div className="w-8 text-center text-foreground-secondary font-medium">{row}</div>
                    <div className="flex gap-1">
                      {seats
                        .filter((s) => s.row === row)
                        .slice(0, 6)
                        .map((seat) => (
                          <button
                            key={seat.id}
                            onClick={() => handleSeatClick(seat)}
                            className={getSeatClassName(seat)}
                            title={`${seat.id} - $${seat.price} (${seat.type})`}
                          >
                            {seat.number}
                          </button>
                        ))}
                    </div>
                    <div className="w-8"></div>
                    <div className="flex gap-1">
                      {seats
                        .filter((s) => s.row === row)
                        .slice(6, 12)
                        .map((seat) => (
                          <button
                            key={seat.id}
                            onClick={() => handleSeatClick(seat)}
                            className={getSeatClassName(seat)}
                            title={`${seat.id} - $${seat.price} (${seat.type})`}
                          >
                            {seat.number}
                          </button>
                        ))}
                    </div>
                    <div className="w-8 text-center text-foreground-secondary font-medium">{row}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="text-xl font-bold text-foreground mb-4">Booking Summary</h3>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-secondary">Movie</span>
                    <span className="text-foreground">{movie.title}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-secondary">Cinema</span>
                    <span className="text-foreground">{cinema}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-secondary">Date</span>
                    <span className="text-foreground">{date}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-secondary">Time</span>
                    <span className="text-foreground">{time || "-"}</span>
                  </div>
                </div>

                {selectedSeats.length > 0 && (
                  <>
                    <div className="border-t border-border pt-4 mb-4">
                      <h4 className="font-medium text-foreground mb-2">Selected Seats</h4>
                      <div className="space-y-2">
                        {selectedSeats.map((seat) => (
                          <div key={seat.id} className="flex justify-between text-sm">
                            <span className="text-foreground-secondary">
                              {seat.id} ({seat.type})
                            </span>
                            <span className="text-foreground">${seat.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-border pt-4 mb-6">
                      <div className="flex justify-between font-bold text-lg">
                        <span className="text-foreground">Total</span>
                        <span className="text-cinema-red">${totalPrice}</span>
                      </div>
                    </div>
                  </>
                )}

                <button
                  onClick={handleProceedToPayment}
                  disabled={selectedSeats.length === 0}
                  className="w-full btn-cinema disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedSeats.length === 0 ? "Select Seats" : "Proceed to Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Seat Preview Modal */}
        {previewZone && (
          <SeatPreviewModal
            isOpen={previewModalOpen}
            onClose={() => {
              setPreviewModalOpen(false);
              setPreviewZone(null);
            }}
            auditoriumId={getAuditoriumId()}
            zoneId={previewZone.zoneId}
            zoneName={previewZone.zoneName}
          />
        )}
      </div>
    </div>
  );
};

export default SeatSelection;