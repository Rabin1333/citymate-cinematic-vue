import { Card, CardContent } from "@/components/ui/card";
import { 
  Calendar, 
  Gift, 
  Car, 
  Play 
} from "lucide-react";

const FeaturesCTA = () => {
  const features = [
    {
      icon: <Calendar className="w-8 h-8 text-neon-blue" />,
      title: "Seamless Online Booking",
      description: "Book tickets instantly with our smart reservation system. No queues, no hassle."
    },
    {
      icon: <Gift className="w-8 h-8 text-neon-red" />,
      title: "Exclusive Rewards",
      description: "Earn points with every booking and unlock exclusive perks and discounts."
    },
    {
      icon: <Car className="w-8 h-8 text-neon-purple" />,
      title: "Smart Parking & Food Ordering",
      description: "Pre-book parking spots and order snacks before you arrive. Pure convenience."
    },
    {
      icon: <Play className="w-8 h-8 text-neon-green" />,
      title: "Immersive Trailers & Previews",
      description: "Experience movies like never before with high-quality trailers and 360° seat previews."
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            Why City Mate Movie?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the future of cinema with our cutting-edge platform designed for movie lovers.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group hover:shadow-neon hover:border-primary/50 transition-all duration-300 hover:-translate-y-2 bg-card/50 backdrop-blur-sm border border-border/20"
            >
              <CardContent className="p-6 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors duration-300">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesCTA;