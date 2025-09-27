import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				jakarta: ['Plus Jakarta Sans', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: {
					DEFAULT: 'hsl(var(--background))',
					secondary: 'hsl(var(--background-secondary))',
					accent: 'hsl(var(--background-accent))',
				},
				foreground: {
					DEFAULT: 'hsl(var(--foreground))',
					secondary: 'hsl(var(--foreground-secondary))',
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					hover: 'hsl(var(--primary-hover))',
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				// Futuristic Neon Colors
				'neon-red': {
					DEFAULT: 'hsl(var(--neon-red))',
					glow: 'hsl(var(--neon-red-glow))',
				},
				'neon-blue': 'hsl(var(--neon-blue))',
				'neon-purple': 'hsl(var(--neon-purple))',
				'space-black': 'hsl(var(--space-black))',
				'space-gray': 'hsl(var(--space-gray))',
				'cyber-border': 'hsl(var(--cyber-border))',
				// Legacy cinema colors (mapped to new tokens)
				'cinema-red': {
					DEFAULT: 'hsl(var(--neon-red))',
					hover: 'hsl(var(--neon-red-glow))',
				},
				'cinema-dark': 'hsl(var(--space-black))',
				'cinema-brown': 'hsl(var(--space-gray))',
				'cinema-border': 'hsl(var(--cyber-border))',
			},
			backgroundImage: {
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-card': 'var(--gradient-card)',
				'gradient-neon': 'var(--gradient-neon)',
				'gradient-cyber': 'var(--gradient-cyber)',
				'cyber-grid': 'linear-gradient(hsl(var(--cyber-border) / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--cyber-border) / 0.1) 1px, transparent 1px)',
			},
			boxShadow: {
				'card': 'var(--shadow-card)',
				'neon': 'var(--shadow-neon)',
				'glow-lg': 'var(--shadow-glow-lg)',
				'hover': 'var(--shadow-hover)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
				'neon-pulse': 'neonPulse 2s ease-in-out infinite',
				'cyber-scan': 'cyberScan 2s linear infinite',
				'float': 'float 3s ease-in-out infinite',
				'slide-in-right': 'slideInFromRight 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
