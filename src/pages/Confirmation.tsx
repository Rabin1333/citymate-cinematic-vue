// src/pages/Confirmation.tsx - FUNCTIONAL VERSION
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { CheckCircle, Download, Mail, Calendar, QrCode, Home, Loader2 } from 'lucide-react';
import { getBookingById } from '@/services/api';

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

const Confirmation = () => {
  const { id } = useParams(); // This is the booking ID
  const navigate = useNavigate();
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!id) {
        navigate('/');
        return;
      }

      try {
        const data = await getBookingById(id);
        setBooking(data);
      } catch (error) {
        console.error('Error:', error);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cinema-red" />
      </div>
    );
  }

  if (!booking) {
    return <div>Booking not found</div>;
  }

  const bookingDate = new Date(booking.createdAt).toLocaleDateString();

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-lg text-muted-foreground">
            Your tickets have been booked successfully
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ticket Details */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">E-Ticket</h2>
                <div className="text-sm text-muted-foreground">
                  Booking ID: <span className="font-mono text-foreground">{booking.bookingReference}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Movie Poster */}
                <div className="md:col-span-1">
                  <img 
                    src={booking.movieId.poster} 
                    alt={booking.movieId.title}
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>

                {/* Movie Details */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{booking.movieId.title}</h3>
                    <p className="text-muted-foreground">{booking.movieId.rating} • {booking.movieId.duration}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Cinema</div>
                      <div className="font-medium text-foreground">{booking.cinema}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Date</div>
                      <div className="font-medium text-foreground">{bookingDate}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Time</div>
                      <div className="font-medium text-foreground">{booking.showtime}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Seats</div>
                      <div className="font-medium text-foreground">{booking.seats.join(', ')}</div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-foreground">Total Paid</span>
                      <span className="text-2xl font-bold text-cinema-red">${booking.totalAmount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="border-t border-border pt-6">
                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      <QrCode className="w-20 h-20 text-gray-600" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Show this QR code at the cinema</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Present this ticket at the entrance for scanning. Reference: {booking.bookingReference}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <h4 className="font-medium text-amber-800 mb-2">Important Information</h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>• Please arrive 15 minutes before showtime</li>
                <li>• Outside food and beverages are not permitted</li>
                <li>• Tickets are non-refundable and non-transferable</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">What's Next?</h3>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate('/movies')}
                    className="w-full bg-cinema-red text-white py-2 rounded-lg hover:bg-cinema-red/90"
                  >
                    Book Another Movie
                  </button>
                  
                  <button 
                    onClick={() => navigate('/')}
                    className="w-full border border-border py-2 rounded-lg hover:bg-muted flex items-center justify-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    Back to Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;