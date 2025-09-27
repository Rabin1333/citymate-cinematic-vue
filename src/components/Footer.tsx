import { Facebook, Instagram, Youtube, Twitter } from "lucide-react";

const Footer = () => {
  const socialLinks = [
    { 
      icon: <Facebook className="w-5 h-5" />, 
      href: "https://facebook.com/citymate", 
      label: "Facebook",
      color: "hover:text-blue-400"
    },
    { 
      icon: <Instagram className="w-5 h-5" />, 
      href: "https://instagram.com/citymate", 
      label: "Instagram",
      color: "hover:text-pink-400"
    },
    { 
      icon: <Youtube className="w-5 h-5" />, 
      href: "https://youtube.com/citymate", 
      label: "YouTube",
      color: "hover:text-red-400"
    },
    { 
      icon: <Twitter className="w-5 h-5" />, 
      href: "https://twitter.com/citymate", 
      label: "Twitter",
      color: "hover:text-blue-300"
    }
  ];

  return (
    <footer className="bg-background/95 border-t border-border/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Logo & Copyright */}
          <div className="mb-4 md:mb-0">
            <h3 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              City Mate Movie
            </h3>
            <p className="text-sm text-muted-foreground">
              © 2024 City Mate Movie. Experience cinema like never before.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center space-x-6">
            <span className="text-sm text-muted-foreground hidden md:block">
              Follow us:
            </span>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-full bg-primary/10 text-muted-foreground transition-all duration-300 hover:bg-primary/20 hover:scale-110 ${social.color}`}
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Links */}
        <div className="mt-6 pt-6 border-t border-border/20 text-center">
          <div className="flex flex-wrap justify-center space-x-6 text-sm text-muted-foreground">
            <a href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </a>
            <a href="/contact" className="hover:text-primary transition-colors">
              Contact Us
            </a>
            <a href="/help" className="hover:text-primary transition-colors">
              Help Center
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;