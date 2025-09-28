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
				
				// Enhanced Background System
				background: {
					DEFAULT: 'hsl(var(--background))',
					secondary: 'hsl(var(--background-secondary))',
					accent: 'hsl(var(--background-accent))',
					elevated: 'hsl(var(--background-elevated))',
				},
				
				// Enhanced Foreground System
				foreground: {
					DEFAULT: 'hsl(var(--foreground))',
					secondary: 'hsl(var(--foreground-secondary))',
					muted: 'hsl(var(--foreground-muted))',
					dim: 'hsl(var(--foreground-dim))',
				},
				
				// Enhanced Primary System
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					hover: 'hsl(var(--primary-hover))',
					bright: 'hsl(var(--primary-bright))',
					deep: 'hsl(var(--primary-deep))',
					ultra: 'hsl(var(--primary-ultra))',
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
					foreground: 'hsl(var(--card-foreground))',
					elevated: 'hsl(var(--card-elevated))',
				},
				
				// Professional Space Color System
				'space-void': 'hsl(var(--space-void))',
				'space-deep': 'hsl(var(--space-deep))',
				'space-medium': 'hsl(var(--space-medium))',
				'space-surface': 'hsl(var(--space-surface))',
				'space-elevated': 'hsl(var(--space-elevated))',
				
				// Quantum Light System
				'quantum-white': 'hsl(var(--quantum-white))',
				'quantum-light': 'hsl(var(--quantum-light))',
				'quantum-medium': 'hsl(var(--quantum-medium))',
				'quantum-dim': 'hsl(var(--quantum-dim))',
				'quantum-dark': 'hsl(var(--quantum-dark))',
				
				// Enhanced Neon Spectrum
				'neon-crimson': {
					DEFAULT: 'hsl(var(--neon-crimson))',
					bright: 'hsl(var(--neon-crimson-bright))',
					deep: 'hsl(var(--neon-crimson-deep))',
					ultra: 'hsl(var(--neon-crimson-ultra))',
				},
				'neon-azure': 'hsl(var(--neon-azure))',
				'neon-violet': 'hsl(var(--neon-violet))',
				'neon-amber': 'hsl(var(--neon-amber))',
				'neon-emerald': 'hsl(var(--neon-emerald))',
				'neon-magenta': 'hsl(var(--neon-magenta))',
				
				// Legacy Support (mapped to new tokens)
				'neon-red': {
					DEFAULT: 'hsl(var(--neon-crimson))',
					glow: 'hsl(var(--neon-crimson-bright))',
				},
				'neon-blue': 'hsl(var(--neon-azure))',
				'neon-purple': 'hsl(var(--neon-violet))',
				'space-black': 'hsl(var(--space-deep))',
				'space-gray': 'hsl(var(--space-surface))',
				'cyber-border': 'hsl(var(--quantum-dark))',
				
				// Cinema Colors (legacy compatibility)
				'cinema-red': {
					DEFAULT: 'hsl(var(--neon-crimson))',
					hover: 'hsl(var(--neon-crimson-bright))',
				},
				'cinema-dark': 'hsl(var(--space-deep))',
				'cinema-brown': 'hsl(var(--space-surface))',
				'cinema-border': 'hsl(var(--quantum-dark))',
				
				// Status Colors
				success: 'hsl(var(--success))',
				warning: 'hsl(var(--warning))',
				error: 'hsl(var(--error))',
				info: 'hsl(var(--info))',
			},
			
			// Enhanced Background Images
			backgroundImage: {
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-card': 'var(--gradient-card)',
				'gradient-neon': 'var(--gradient-neon)',
				'gradient-cyber': 'var(--gradient-cyber)',
				'gradient-void': 'var(--gradient-void)',
				'gradient-cosmic': 'var(--gradient-cosmic)',
				'gradient-aurora': 'var(--gradient-aurora)',
				'gradient-hologram': 'var(--gradient-hologram)',
				'gradient-neural': 'var(--gradient-neural)',
				'cyber-grid': 'linear-gradient(hsl(var(--quantum-dark) / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--quantum-dark) / 0.1) 1px, transparent 1px)',
			},
			
			// Professional Shadow System
			boxShadow: {
				'card': 'var(--shadow-card)',
				'neon': 'var(--shadow-neon)',
				'glow-lg': 'var(--shadow-glow-lg)',
				'hover': 'var(--shadow-hover)',
				// Enhanced shadow system
				'micro': 'var(--shadow-micro)',
				'subtle': 'var(--shadow-subtle)',
				'soft': 'var(--shadow-soft)',
				'medium': 'var(--shadow-medium)',
				'large': 'var(--shadow-large)',
				'massive': 'var(--shadow-massive)',
				// Glow system
				'glow-micro': 'var(--glow-micro)',
				'glow-subtle': 'var(--glow-subtle)',
				'glow-soft': 'var(--glow-soft)',
				'glow-medium': 'var(--glow-medium)',
				'glow-intense': 'var(--glow-intense)',
				'glow-extreme': 'var(--glow-extreme)',
				// Multi-color glows
				'glow-crimson': 'var(--glow-crimson)',
				'glow-azure': 'var(--glow-azure)',
				'glow-violet': 'var(--glow-violet)',
				'glow-rainbow': 'var(--glow-rainbow)',
			},
			
			// Professional Border Radius
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				// Enhanced radius system
				'none': 'var(--radius-none)',
				'base': 'var(--radius-base)',
				'xl': 'var(--radius-xl)',
				'2xl': 'var(--radius-2xl)',
				'3xl': 'var(--radius-3xl)',
				'full': 'var(--radius-full)',
			},
			
			// Professional Spacing System
			spacing: {
				'0.5': 'var(--space-0-5)',
				'1': 'var(--space-1)',
				'2': 'var(--space-2)',
				'3': 'var(--space-3)',
				'4': 'var(--space-4)',
				'6': 'var(--space-6)',
				'8': 'var(--space-8)',
				'12': 'var(--space-12)',
				'16': 'var(--space-16)',
				'24': 'var(--space-24)',
				'32': 'var(--space-32)',
				'48': 'var(--space-48)',
				'64': 'var(--space-64)',
			},
			
			// Professional Typography
			fontSize: {
				'micro': 'var(--font-size-micro)',
				'tiny': 'var(--font-size-tiny)',
				'small': 'var(--font-size-small)',
				'base': 'var(--font-size-base)',
				'medium': 'var(--font-size-medium)',
				'large': 'var(--font-size-large)',
				'xl': 'var(--font-size-xl)',
				'2xl': 'var(--font-size-2xl)',
				'3xl': 'var(--font-size-3xl)',
				'4xl': 'var(--font-size-4xl)',
				'5xl': 'var(--font-size-5xl)',
				'6xl': 'var(--font-size-6xl)',
			},
			
			// Enhanced Animation System
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				// Professional Animations
				'cosmic-drift': {
					'0%, 100%': { 
						transform: 'rotate(0deg) scale(1)', 
						opacity: '0.8' 
					},
					'25%': { 
						transform: 'rotate(1deg) scale(1.02)', 
						opacity: '0.9' 
					},
					'50%': { 
						transform: 'rotate(0deg) scale(1.05)', 
						opacity: '0.7' 
					},
					'75%': { 
						transform: 'rotate(-1deg) scale(1.02)', 
						opacity: '0.9' 
					},
				},
				'neural-pulse': {
					'0%, 100%': { 'background-position': '0% 50%' },
					'50%': { 'background-position': '100% 50%' },
				},
				'holographic-shift': {
					'0%': { 'background-position': '0% 0%' },
					'100%': { 'background-position': '200% 0%' },
				},
				'quantum-flicker': {
					'0%, 100%': { 
						opacity: '1', 
						filter: 'brightness(1)' 
					},
					'25%': { 
						opacity: '0.9', 
						filter: 'brightness(1.1) saturate(1.2)' 
					},
					'50%': { 
						opacity: '0.95', 
						filter: 'brightness(0.9) saturate(0.8)' 
					},
					'75%': { 
						opacity: '0.85', 
						filter: 'brightness(1.2) saturate(1.4)' 
					},
				},
				'energy-surge': {
					'0%': { 
						'box-shadow': 'var(--glow-subtle)',
						'border-color': 'hsl(var(--primary) / 0.3)'
					},
					'50%': { 
						'box-shadow': 'var(--glow-rainbow)',
						'border-color': 'hsl(var(--primary))',
						transform: 'scale(1.02)'
					},
					'100%': { 
						'box-shadow': 'var(--glow-subtle)',
						'border-color': 'hsl(var(--primary) / 0.3)'
					},
				},
				'aurora-wave': {
					'0%, 100%': { 
						'background-position': '0% 50%',
						filter: 'hue-rotate(0deg)'
					},
					'25%': { 
						'background-position': '25% 25%',
						filter: 'hue-rotate(90deg)'
					},
					'50%': { 
						'background-position': '100% 50%',
						filter: 'hue-rotate(180deg)'
					},
					'75%': { 
						'background-position': '75% 75%',
						filter: 'hue-rotate(270deg)'
					},
				},
				'glitch-effect': {
					'0%, 100%': { 
						transform: 'translateX(0)',
						filter: 'hue-rotate(0deg)',
						opacity: '1'
					},
					'10%': { 
						transform: 'translateX(-2px)',
						filter: 'hue-rotate(90deg)',
						opacity: '0.8'
					},
					'20%': { 
						transform: 'translateX(2px)',
						filter: 'hue-rotate(180deg)',
						opacity: '1'
					},
					'30%': { 
						transform: 'translateX(-1px)',
						filter: 'hue-rotate(270deg)',
						opacity: '0.9'
					},
					'40%': { 
						transform: 'translateX(1px)',
						filter: 'hue-rotate(0deg)',
						opacity: '1'
					},
				},
			},
			
			// Enhanced Animation System
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				
				// Legacy animations
				'fade-in-up': 'fadeInUp 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
				'neon-pulse': 'neonPulse 2s ease-in-out infinite',
				'cyber-scan': 'cyberScan 2s linear infinite',
				'float': 'float 3s ease-in-out infinite',
				'slide-in-right': 'slideInFromRight 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
				
				// Professional animations
				'cosmic-drift': 'cosmic-drift 20s ease-in-out infinite',
				'neural-pulse': 'neural-pulse 8s ease-in-out infinite',
				'holographic-shift': 'holographic-shift 3s linear infinite',
				'quantum-flicker': 'quantum-flicker 4s ease-in-out infinite',
				'energy-surge': 'energy-surge 2s ease-in-out infinite',
				'aurora-wave': 'aurora-wave 10s ease-in-out infinite',
				'glitch-effect': 'glitch-effect 0.3s ease-in-out',
			},
			
			// Professional Transition System
			transitionTimingFunction: {
				'smooth': 'var(--easing-smooth)',
				'swift': 'var(--easing-swift)',
				'bounce': 'var(--easing-bounce)',
				'elastic': 'var(--easing-elastic)',
				'dramatic': 'var(--easing-dramatic)',
			},
			
			transitionDuration: {
				'instant': 'var(--duration-instant)',
				'quick': 'var(--duration-quick)',
				'smooth': 'var(--duration-smooth)',
				'relaxed': 'var(--duration-relaxed)',
				'slow': 'var(--duration-slow)',
				'dramatic': 'var(--duration-dramatic)',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;