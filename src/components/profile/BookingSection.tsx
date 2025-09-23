import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, MapPin, Users, Download, Mail, X, Edit, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { 
  getUserBookings, 
  cancelUserBooking, 
  downloadTicket, 
  emailTicket, 
  type UiBooking 
} from "@/services/api";

export const BookingSection = () => {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<UiBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{ [key: string]: boolean }>({});

  // Load user's real bookings
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const data = await getUserBookings();
        setBookings(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load bookings",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookings();
  }, [toast]);

  const handleCancelBooking = async (bookingId: string) => {
    setActionLoading(prev => ({ ...prev, [`cancel-${bookingId}`]: true }));
    try {
      await cancelUserBooking(bookingId);
      setBookings(prev => prev.map(booking => 
        booking._id === bookingId 
          ? { ...booking, status: "cancelled" }
          : booking
      ));
      toast({
        title: "Booking cancelled",
        description: "Your booking has been successfully cancelled.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel booking. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [`cancel-${bookingId}`]: false }));
    }
  };

  const handleDownloadTicket = async (bookingId: string) => {
    setActionLoading(prev => ({ ...prev, [`download-${bookingId}`]: true }));
    try {
      const blob = await downloadTicket(bookingId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ticket-${bookingId}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Ticket downloaded",
        description: "Your ticket has been downloaded successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to download ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [`download-${bookingId}`]: false }));
    }
  };

  const handleEmailTicket = async (bookingId: string) => {
    setActionLoading(prev => ({ ...prev, [`email-${bookingId}`]: true }));
    try {
      await emailTicket(bookingId);
      toast({
        title: "Ticket emailed",
        description: "Your ticket has been sent to your email address.",
      });
    } catch (error: any) {
      toast({
        title: "Error", 
        description: error.message || "Failed to email ticket. Please try again.",
        variant: "destructive",
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [`email-${bookingId}`]: false }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-500/10 text-green-700 border-green-500/20";
      case "cancelled": return "bg-red-500/10 text-red-700 border-red-500/20";
      case "completed": return "bg-blue-500/10 text-blue-700 border-blue-500/20";
      case "pending": return "bg-yellow-500/10 text-yellow-700 border-yellow-500/20";
      default: return "bg-gray-500/10 text-gray-700 border-gray-500/20";
    }
  };

  // Separate upcoming and past bookings
  const now = new Date();
  const upcomingBookings = bookings.filter(booking => {
    if (booking.status === "cancelled") return false;
    // For simplicity, consider all confirmed bookings as upcoming for now
    // In a real app, you'd compare actual showtime dates
    return booking.status === "confirmed";
  });
  
  const pastBookings = bookings.filter(booking => 
    booking.status === "completed" || booking.status === "cancelled"
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upcoming Bookings */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Bookings</CardTitle>
          <CardDescription>
            Your confirmed bookings for upcoming shows
          </CardDescription>
        </CardHeader>
        <CardContent>
          {upcomingBookings.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-2">No upcoming bookings found</p>
              <p className="text-sm text-muted-foreground">
                Book a movie to see your tickets here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div key={booking._id} className="border rounded-lg p-4">
                  <div className="flex flex-col md:flex-row gap-4">
                    <img 
                      src={booking.moviePoster || "/placeholder-movie.jpg"} 
                      alt={booking.movieTitle}
                      className="w-20 h-28 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{booking.movieTitle}</h3>
                          <p className="text-sm text-muted-foreground">
                            Ref: {booking.bookingReference}
                          </p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {booking.date ? format(new Date(booking.date), "PPP") : "Date TBD"}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {booking.showtime}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {booking.cinema} {booking.screen && `- ${booking.screen}`}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Seats: {booking.seats.join(", ")}
                        </div>
                      </div>
                      
                      {booking.totalAmount && (
                        <div className="text-sm font-medium mb-3">
                          Total: ${booking.totalAmount.toFixed(2)}
                        </div>
                      )}
                      
                      <div className="flex flex-wrap gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadTicket(booking._id)}
                          disabled={actionLoading[`download-${booking._id}`]}
                        >
                          {actionLoading[`download-${booking._id}`] ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="mr-2 h-4 w-4" />
                          )}
                          Download
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEmailTicket(booking._id)}
                          disabled={actionLoading[`email-${booking._id}`]}
                        >
                          {actionLoading[`email-${booking._id}`] ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Mail className="mr-2 h-4 w-4" />
                          )}
                          Email
                        </Button>
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                              <X className="mr-2 h-4 w-4" />
                              Cancel
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to cancel this booking for {booking.movieTitle}? 
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Keep Booking</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => handleCancelBooking(booking._id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                disabled={actionLoading[`cancel-${booking._id}`]}
                              >
                                {actionLoading[`cancel-${booking._id}`] ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                Cancel Booking
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Bookings */}
      {pastBookings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past Bookings</CardTitle>
            <CardDescription>
              Your booking history and completed shows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pastBookings.map((booking) => (
                <div key={booking._id} className="border rounded-lg p-4 opacity-75">
                  <div className="flex flex-col md:flex-row gap-4">
                    <img 
                      src={booking.moviePoster || "/placeholder-movie.jpg"} 
                      alt={booking.movieTitle}
                      className="w-20 h-28 object-cover rounded"
                    />
                    <div className="flex-1">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{booking.movieTitle}</h3>
                          <p className="text-sm text-muted-foreground">
                            Ref: {booking.bookingReference}
                          </p>
                        </div>
                        <Badge className={getStatusColor(booking.status)}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {booking.date ? format(new Date(booking.date), "PPP") : "Date TBD"}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {booking.showtime}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {booking.cinema} {booking.screen && `- ${booking.screen}`}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Seats: {booking.seats.join(", ")}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDownloadTicket(booking._id)}
                          disabled={actionLoading[`download-${booking._id}`]}
                        >
                          {actionLoading[`download-${booking._id}`] ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Download className="mr-2 h-4 w-4" />
                          )}
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};