import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getBookingById, spinReward, createBooking, getToken, confirmParking, releaseParking, type FoodOrderItem, type ParkingReservation } from "../services/api";
import { useToast } from "@/hooks/use-toast";
import SpinWheelModal from "@/components/SpinWheelModal";
import FoodMenu from "@/components/FoodMenu";
import ParkingSection from "@/components/ParkingSection";
const normalizeCinemaId = (c?: string) => {
  const s = (c || "").toLowerCase();
  if (s.includes("downtown")) return "downtown";
  return s || "downtown"; // fallback
};

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
  const [showSpinModal, setShowSpinModal] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodOrderItem[]>([]);
  const [parkingReservation, setParkingReservation] = useState<ParkingReservation | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

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

  // Check if booking has 3+ premium or VIP seats (Premium: rows C, D, E; VIP: rows A, B)
  const checkPremiumVipEligibility = (seats: string[]) => {
    const premiumRows = ['C', 'D', 'E'];
    const vipRows = ['A', 'B'];
    const eligibleSeats = seats.filter(seatId => {
      const row = seatId.charAt(0);
      return premiumRows.includes(row) || vipRows.includes(row);
    });
    return eligibleSeats.length >= 3;
  };

  const handlePayment = async () => {
    if (!booking || processingPayment) return;

    setProcessingPayment(true);
    const token = getToken();
    
    try {
      // Process payment first
      let finalBookingId = booking._id;
      
      // If there are food items, create a new booking with food
      if (selectedFood.length > 0) {
        const updatedBooking = await createBooking(token!, {
          movieId: booking.movieId._id,
          showtime: booking.showtime,
          seats: booking.seats,
          cinema: booking.cinema,
          foodItems: selectedFood
        });
        finalBookingId = updatedBooking._id;
      }

      // Confirm parking if reserved
      if (parkingReservation) {
        try {
          await confirmParking(parkingReservation.reservationId, finalBookingId);
        } catch (parkingError) {
          console.error('Failed to confirm parking:', parkingError);
          // Don't fail the entire payment for parking confirmation failure
          toast({
            title: "Payment Confirmed",
            description: "Booking confirmed, but parking confirmation failed. Please contact support.",
            variant: "destructive",
          });
        }
      }
      
      toast({
        title: "Payment Confirmed",
        description: "Your booking has been confirmed!",
      });

      // Check if eligible for spin wheel (Premium OR VIP)
      const isEligible = checkPremiumVipEligibility(booking.seats);
      if (isEligible) {
        setShowSpinModal(true);
      } else {
        navigate(`/confirmation/${finalBookingId}`);
      }
    } catch (error) {
      // If payment fails, release parking hold
      if (parkingReservation) {
        try {
          await releaseParking(parkingReservation.reservationId);
        } catch (releaseError) {
          console.error('Failed to release parking after payment failure:', releaseError);
        }
      }
      
      toast({
        title: "Payment Failed",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleSpin = async () => {
    if (!booking) throw new Error("No booking found");
    const result = await spinReward(booking._id);
    return result.reward;
  };

  const handleSpinModalClose = () => {
    setShowSpinModal(false);
    if (booking) {
      navigate(`/confirmation/${booking._id}`);
    }
  };

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

          <div className="border-t border-border pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-foreground">Seats</span>
              <span className="text-foreground">${booking.totalAmount}</span>
            </div>
            {selectedFood.length > 0 && (
              <div className="flex justify-between">
                <span className="text-foreground">Food</span>
                <span className="text-foreground">${selectedFood.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
              </div>
            )}
            {parkingReservation && (
              <div className="flex justify-between">
                <span className="text-foreground">Parking</span>
                <span className="text-foreground">${parkingReservation.price.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t border-border pt-2">
              <span className="text-foreground">Total</span>
              <span className="text-cinema-red">
                ${(booking.totalAmount + 
                   selectedFood.reduce((sum, item) => sum + item.price, 0) + 
                   (parkingReservation?.price || 0)
                ).toFixed(2)}
              </span>
            </div>
          </div>

          <button
            className="btn-cinema w-full"
            onClick={handlePayment}
            disabled={processingPayment}
          >
            {processingPayment ? "Processing..." : "Pay Now"}
          </button>
        </div>

        {/* Food Pre-ordering Section */}
        <div className="mt-8">
          <FoodMenu 
            selectedItems={selectedFood}
            onSelectionChange={setSelectedFood}
          />
        </div>

        {/* Parking Section */}
        <div className="mt-8">
          <ParkingSection
  bookingId={(booking as any)._id || (booking as any).id}
  cinema={normalizeCinemaId(booking.cinema || (booking as any).cinemaId)}   // force "downtown"
  showtime={booking.showtime}
  onParkingChange={setParkingReservation}
/>
        </div>

        <SpinWheelModal
          isOpen={showSpinModal}
          onClose={handleSpinModalClose}
          onSpin={handleSpin}
          onContinue={() => navigate(`/confirmation/${booking._id}`)}
        />
      </div>
    </div>
  );
};

export default Payment;