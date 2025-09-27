// src/components/ParkingSection.tsx
import { useState, useEffect, useCallback } from "react";
import { Car, Clock, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import {
  getParkingLots,
  holdParking,
  releaseParking,
  type ParkingLot,
  type ParkingReservation,
} from "@/services/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ParkingSectionProps {
  bookingId: string;
  cinema: string;             // e.g., "downtown"
  showtime: string;           // e.g., "2:30 PM"
  onParkingChange: (reservation: ParkingReservation | null) => void;
}

/** ---------- Helpers: robust time handling ---------- */

// Parse "2:32 PM" -> { h: 14, min: 32 }
function parse12h(time12: string) {
  const m = time12.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!m) throw new Error(`Bad time string: "${time12}"`);
  let h = parseInt(m[1], 10);
  const min = parseInt(m[2], 10);
  const mer = m[3].toUpperCase();
  if (mer === "PM" && h !== 12) h += 12;
  if (mer === "AM" && h === 12) h = 0;
  return { h, min };
}

// Build ISO for "today + timeStr" in *local* time (handles DST), then to ISO
function buildISOForTodayTime(timeStr: string, today = new Date()) {
  const [yyyy, mm, dd] = today.toISOString().split("T")[0].split("-").map(Number);
  const { h, min } = parse12h(timeStr);
  const local = new Date(yyyy, mm - 1, dd, h, min, 0, 0);
  if (Number.isNaN(local.getTime())) throw new Error("Invalid Date after merge");
  return local.toISOString();
}

// Make a human display time from "HH:mm" (24h)
function prettyTimeFromHHmm(hhmm: string) {
  const [hStr, mStr] = hhmm.split(":");
  const local = new Date(2024, 0, 1, Number(hStr), Number(mStr), 0, 0);
  return local.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

const ParkingSection = ({ bookingId, cinema, showtime, onParkingChange }: ParkingSectionProps) => {
  const [expanded, setExpanded] = useState(false);
  const [lots, setLots] = useState<ParkingLot[]>([]);
  const [selectedLot, setSelectedLot] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [holding, setHolding] = useState(false);
  const [currentReservation, setCurrentReservation] = useState<ParkingReservation | null>(null);
  const [startTime, setStartTime] = useState<string>(""); // "HH:mm"
  const [endTime, setEndTime] = useState<string>("");     // "HH:mm"
  const { toast } = useToast();

  // Calculate default parking window based on showtime
  useEffect(() => {
    if (!showtime) return;
    try {
      // Build a Date for *today* at the show's time, then ± window
      const base = new Date();
      const baseISO = buildISOForTodayTime(showtime, base);
      const showtimeDate = new Date(baseISO);

      const startDate = new Date(showtimeDate.getTime() - 30 * 60 * 1000); // 30 min before
      const endDate = new Date(showtimeDate.getTime() + 3 * 60 * 60 * 1000); // 3 hours after

      const pad = (n: number) => String(n).padStart(2, "0");
      setStartTime(`${pad(startDate.getHours())}:${pad(startDate.getMinutes())}`); // "HH:mm"
      setEndTime(`${pad(endDate.getHours())}:${pad(endDate.getMinutes())}`);       // "HH:mm"
    } catch (e: any) {
      console.error("Failed to compute default parking window:", e?.message || e);
      setStartTime("");
      setEndTime("");
    }
  }, [showtime]);

  // Load parking lots when expanded first time
  const loadParkingLots = useCallback(async () => {
    if (!expanded || lots.length > 0) return;

    setLoading(true);
    try {
      const today = new Date();
      const showtimeISO = buildISOForTodayTime(showtime, today); // robust ISO
      // Use *cinema* prop (not hard-coded)
      const parkingLots = await getParkingLots(cinema || "downtown", showtimeISO);
      setLots(parkingLots);
    } catch (error: any) {
      console.error("Failed to load parking lots:", error);
      toast({
        title: "Parking Error",
        description: "Failed to load parking options",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [expanded, lots.length, cinema, showtime, toast]);

  useEffect(() => {
    loadParkingLots();
  }, [loadParkingLots]);

  const handleHoldSpot = async () => {
    if (!selectedLot || !startTime || !endTime) {
      toast({
        title: "Missing Information",
        description: "Please select a parking lot and time range",
        variant: "destructive",
      });
      return;
    }

    setHolding(true);
    try {
      const today = new Date();
      // startTime / endTime are "HH:mm" -> make ISO correctly
      const startISO = buildISOForTodayTime(
        `${startTime.split(":")[0]}:${startTime.split(":")[1]} ${Number(startTime.split(":")[0]) >= 12 ? "PM" : "AM"}`
          // The helper expects "h:mm AM/PM"; build it from HH:mm
          .replace(/^0?(\d\d?):/, (_, h) => `${(Number(h) % 12) || 12}:`)
      , today);

      const endISO = buildISOForTodayTime(
        `${endTime.split(":")[0]}:${endTime.split(":")[1]} ${Number(endTime.split(":")[0]) >= 12 ? "PM" : "AM"}`
          .replace(/^0?(\d\d?):/, (_, h) => `${(Number(h) % 12) || 12}:`)
      , today);

      const reservation = await holdParking(bookingId, selectedLot, startISO, endISO);
      setCurrentReservation(reservation);
      onParkingChange(reservation);

      toast({
        title: "Parking Reserved",
        description: `Spot held at ${reservation.lotName}`,
      });
    } catch (error: any) {
      console.error("Hold parking error:", error);
      toast({
        title: "Parking Error",
        description: error?.message || "Failed to reserve parking",
        variant: "destructive",
      });
    } finally {
      setHolding(false);
    }
  };

  const handleReleaseSpot = async () => {
    if (!currentReservation) return;
    try {
      await releaseParking(currentReservation.reservationId);
      setCurrentReservation(null);
      setSelectedLot("");
      onParkingChange(null);

      toast({
        title: "Parking Released",
        description: "Your parking spot has been released",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to release parking spot",
        variant: "destructive",
      });
    }
  };

  const formatTime = (timeString: string) => {
    // timeString is "HH:mm"
    return prettyTimeFromHHmm(timeString);
  };

  return (
    <Card className="border-border">
      <CardHeader
        className="cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <Car className="w-5 h-5 text-cinema-red" />
            <span>Add Parking</span>
            {currentReservation && (
              <span className="text-sm font-normal text-green-600">
                (Reserved)
              </span>
            )}
          </div>
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </CardTitle>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4">
          {currentReservation ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Car className="w-4 h-4 text-green-600" />
                  <span className="font-semibold text-green-800">Parking Reserved</span>
                </div>
                <div className="space-y-1 text-sm text-green-700">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3" />
                    <span>{currentReservation.lotName} - {currentReservation.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>
                      {formatTime(new Date(currentReservation.startTime).toTimeString().slice(0, 5))}
                      {" - "}
                      {formatTime(new Date(currentReservation.endTime).toTimeString().slice(0, 5))}
                    </span>
                  </div>
                  <div className="font-semibold">
                    Price: ${currentReservation.price.toFixed(2)}
                  </div>
                  <div className="text-xs text-green-600">
                    Hold expires: {new Date(currentReservation.holdExpiresAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleReleaseSpot}
                className="w-full"
              >
                Change Parking
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-4 text-foreground-secondary">
                  Loading parking options...
                </div>
              ) : lots.length === 0 ? (
                <div className="text-center py-4 text-foreground-secondary">
                  No parking available for this showtime
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Select Parking Lot
                    </label>
                    <Select value={selectedLot} onValueChange={setSelectedLot}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a parking lot" />
                      </SelectTrigger>
                      <SelectContent>
                        {lots.map((lot) => (
                          <SelectItem key={lot.lotId} value={lot.lotId}>
                            <div className="flex flex-col">
                              <span className="font-medium">{lot.name}</span>
                              <span className="text-xs text-foreground-secondary">
                                {lot.available}/{lot.capacity} available • {lot.priceHint}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Entry Time
                      </label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Exit Time
                      </label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                      />
                    </div>
                  </div>

                  {selectedLot && (
                    <div className="bg-cinema-red/10 border border-cinema-red/20 rounded-lg p-3">
                      <p className="text-sm text-foreground-secondary">
                        <strong>Note:</strong> Parking spots are held for 15 minutes during checkout.
                        Complete your payment to confirm the reservation.
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleHoldSpot}
                    disabled={!selectedLot || holding}
                    className="w-full"
                  >
                    {holding ? "Reserving..." : "Hold Parking Spot"}
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default ParkingSection;
