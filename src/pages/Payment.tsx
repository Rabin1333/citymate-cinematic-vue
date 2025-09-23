import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getBookingById } from "../services/api";
import { useToast } from "@/hooks/use-toast";

interface BookingData {
  _id: string;
  movieId: {
    _id: string;
    title: string;
    poster: string;
    rating: string;
    duration: string;
  };
  showtime: string;
  seats: string[];
  cinema: string;
  bookingReference: string;
  totalAmount: number;
  createdAt: string;
}

const Payment = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);

  const bookingId = searchParams.get("bookingId");

  useEffect(() => {
    if (!bookingId) {
      navigate("/");
      return;
    }
    
    let alive = true;
    (async () => {
      try {
        const bookingData = await getBookingById(bookingId);
        if (alive) setBooking(bookingData);
      } catch (e) {
        console.error("Failed to load booking on Payment page", e);
        if (alive) {
          toast({
            title: "Booking Not Found",
            description: "The booking could not be loaded.",
            variant: "destructive",
          });
          navigate("/");
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [bookingId, navigate, toast]);

  if (loading) return <div className="p-8">Loading…</div>;
  if (!booking) {
    return (
      <div className="p-8">
        <h2 className="text-xl font-bold mb-2">Booking not found</h2>
        <p className="mb-4">The booking you're trying to pay for could not be loaded.</p>
        <button className="btn-cinema" onClick={() => navigate("/")}>Go Home</button>
      </div>
    );
  }

  const bookingDate = new Date(booking.createdAt).toLocaleDateString();

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-6">
          Payment
        </h1>

        <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={booking.movieId.poster}
              alt={booking.movieId.title}
              className="w-20 h-28 object-cover rounded-lg"
            />
            <div>
              <h2 className="text-xl font-semibold text-foreground">{booking.movieId.title}</h2>
              <p className="text-foreground-secondary">
                {booking.cinema} • {bookingDate} • {booking.showtime}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2 text-foreground">Seats</h3>
            <p className="text-foreground">{booking.seats.join(", ")}</p>
          </div>

          <div className="flex justify-between text-lg font-bold">
            <span className="text-foreground">Total</span>
            <span className="text-cinema-red">${booking.totalAmount}</span>
          </div>

          <button
            className="btn-cinema w-full"
            onClick={() => {
              toast({
                title: "Payment Confirmed",
                description: "Your booking has been confirmed!",
              });
              navigate(`/confirmation/${booking._id}`);
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