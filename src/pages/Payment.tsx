import { useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, Shield, Lock } from 'lucide-react';
import { movies } from '../data/movies';

const Payment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvc: '',
    cardholderName: '',
    email: '',
    phone: ''
  });

  const movie = movies.find(m => m.id === parseInt(id || '0'));
  const seats = searchParams.get('seats')?.split(',') || [];
  const date = searchParams.get('date');
  const time = searchParams.get('time');
  const cinema = searchParams.get('cinema');
  const total = searchParams.get('total');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format card number
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      setFormData(prev => ({ ...prev, [name]: formatted }));
    }
    // Format expiry date
    else if (name === 'expiryDate') {
      const formatted = value.replace(/\D/g, '').replace(/(.{2})/, '$1/');
      setFormData(prev => ({ ...prev, [name]: formatted }));
    }
    // Format CVC
    else if (name === 'cvc') {
      const formatted = value.replace(/\D/g, '').slice(0, 3);
      setFormData(prev => ({ ...prev, [name]: formatted }));
    }
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Navigate to confirmation
    const bookingId = 'BK' + Date.now().toString().slice(-6);
    navigate(`/confirmation/${id}?bookingId=${bookingId}&seats=${seats.join(',')}&date=${date}&time=${time}&cinema=${cinema}&total=${total}`);
  };

  if (!movie) {
    return <div>Movie not found</div>;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-card rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Payment</h1>
            <div className="flex items-center gap-2 text-sm text-foreground-secondary mt-1">
              <span className="w-2 h-2 bg-cinema-red rounded-full"></span>
              <span>Seat Selection</span>
              <span className="w-2 h-2 bg-cinema-red rounded-full"></span>
              <span className="text-cinema-red">Payment</span>
              <span className="w-2 h-2 bg-border rounded-full"></span>
              <span>Confirmation</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Payment Method */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="text-xl font-bold text-foreground mb-4">Payment Method</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-cinema-red bg-cinema-red/10'
                        : 'border-border hover:border-cinema-red/50'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 mx-auto mb-2 text-foreground" />
                    <div className="text-sm font-medium text-foreground">Credit Card</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === 'paypal'
                        ? 'border-cinema-red bg-cinema-red/10'
                        : 'border-border hover:border-cinema-red/50'
                    }`}
                  >
                    <div className="w-6 h-6 mx-auto mb-2 bg-blue-600 text-white rounded text-xs font-bold flex items-center justify-center">
                      PP
                    </div>
                    <div className="text-sm font-medium text-foreground">PayPal</div>
                  </button>
                </div>
              </div>

              {/* Card Details */}
              {paymentMethod === 'card' && (
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h3 className="text-xl font-bold text-foreground mb-4">Card Details</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Card Number
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="input-cinema"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          maxLength={5}
                          className="input-cinema"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          CVC
                        </label>
                        <input
                          type="text"
                          name="cvc"
                          value={formData.cvc}
                          onChange={handleInputChange}
                          placeholder="123"
                          maxLength={3}
                          className="input-cinema"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        name="cardholderName"
                        value={formData.cardholderName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="input-cinema"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="text-xl font-bold text-foreground mb-4">Contact Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@example.com"
                      className="input-cinema"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 123-4567"
                      className="input-cinema"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    Your payment information is secured with 256-bit SSL encryption
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="w-full btn-cinema flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <Lock className="w-5 h-5" />
                    Confirm Payment ${total}
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="bg-card rounded-2xl p-6 border border-border">
                <h3 className="text-xl font-bold text-foreground mb-4">Booking Summary</h3>
                
                <div className="flex gap-4 mb-4">
                  <img 
                    src={movie.poster} 
                    alt={movie.title}
                    className="w-16 h-24 object-cover rounded-lg"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground">{movie.title}</h4>
                    <p className="text-sm text-foreground-secondary">{movie.rating} • {movie.duration}</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Cinema</span>
                    <span className="text-foreground">{cinema}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Date</span>
                    <span className="text-foreground">{date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Time</span>
                    <span className="text-foreground">{time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-foreground-secondary">Seats</span>
                    <span className="text-foreground">{seats.join(', ')}</span>
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-foreground">Total Amount</span>
                    <span className="text-cinema-red">${total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;