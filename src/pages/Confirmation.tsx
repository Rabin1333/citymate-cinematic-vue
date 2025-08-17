import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Download, Mail, Calendar, QrCode, Home } from 'lucide-react';
import { movies } from '../data/movies';

const Confirmation = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const movie = movies.find(m => m.id === parseInt(id || '0'));
  const bookingId = searchParams.get('bookingId');
  const seats = searchParams.get('seats')?.split(',') || [];
  const date = searchParams.get('date');
  const time = searchParams.get('time');
  const cinema = searchParams.get('cinema');
  const total = searchParams.get('total');

  if (!movie) {
    return <div>Movie not found</div>;
  }

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
          <p className="text-lg text-foreground-secondary">
            Your tickets have been booked successfully
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ticket Details */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">E-Ticket</h2>
                <div className="text-sm text-foreground-secondary">
                  Booking ID: <span className="font-mono text-foreground">{bookingId}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Movie Poster */}
                <div className="md:col-span-1">
                  <img 
                    src={movie.poster} 
                    alt={movie.title}
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>

                {/* Movie Details */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground">{movie.title}</h3>
                    <p className="text-foreground-secondary">{movie.rating} • {movie.duration}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-foreground-secondary">Cinema</div>
                      <div className="font-medium text-foreground">{cinema}</div>
                    </div>
                    <div>
                      <div className="text-foreground-secondary">Date</div>
                      <div className="font-medium text-foreground">{date}</div>
                    </div>
                    <div>
                      <div className="text-foreground-secondary">Time</div>
                      <div className="font-medium text-foreground">{time}</div>
                    </div>
                    <div>
                      <div className="text-foreground-secondary">Seats</div>
                      <div className="font-medium text-foreground">{seats.join(', ')}</div>
                    </div>
                  </div>

                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold text-foreground">Total Paid</span>
                      <span className="text-2xl font-bold text-cinema-red">${total}</span>
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
                    <p className="text-sm text-foreground-secondary mb-4">
                      Present this ticket at the entrance for scanning. You can also show the digital version on your phone.
                    </p>
                    <div className="text-xs text-foreground-secondary">
                      Ticket valid only for the specified date, time, and seats.
                    </div>
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
                <li>• Valid ID required for R-rated movies</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4">
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">Ticket Actions</h3>
                
                <div className="space-y-3">
                  <button className="w-full btn-cinema-outline flex items-center justify-center gap-2">
                    <Download className="w-4 h-4" />
                    Download PDF
                  </button>
                  
                  <button className="w-full btn-cinema-outline flex items-center justify-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Tickets
                  </button>
                  
                  <button className="w-full btn-cinema-outline flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Add to Calendar
                  </button>
                </div>
              </div>

              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="text-lg font-bold text-foreground mb-4">What's Next?</h3>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate('/movies')}
                    className="w-full btn-cinema"
                  >
                    Book Another Movie
                  </button>
                  
                  <button 
                    onClick={() => navigate('/')}
                    className="w-full btn-cinema-outline flex items-center justify-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    Back to Home
                  </button>
                </div>
              </div>

              {/* Customer Support */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">Need Help?</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Contact our customer support if you have any questions about your booking.
                </p>
                <button className="text-sm text-blue-600 font-medium hover:text-blue-800">
                  Contact Support →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Confirmation;