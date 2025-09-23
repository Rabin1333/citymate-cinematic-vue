export interface Movie {
  id: number;
  title: string;
  genre: string[];
  rating: string;
  duration: string;
  releaseYear: string;
  poster: string;
  synopsis: string;
  director: string;
  cast: string[];
  showtimes: string[];
  pricing: {
    regular: number;
    premium: number;
    vip: number;
  };
  status: 'now-showing' | 'coming-soon';
  featured?: boolean;
  releaseDate?: string;
}

export const movies: Movie[] = [
  {
    id: 1,
    title: "The Dark Knight",
    genre: ["Action", "Crime", "Drama"],
    rating: "PG-13",
    duration: "152 min",
    releaseYear: "2008",
    poster: "/posters/the-dark-knight.jpg",
    synopsis: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    director: "Christopher Nolan",
    cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine"],
    showtimes: ["2:30 PM", "5:45 PM", "8:30 PM", "11:15 PM"],
    pricing: { regular: 12, premium: 18, vip: 25 },
    status: "now-showing",
    featured: true
  },
  {
    id: 2,
    title: "Inception",
    genre: ["Sci-Fi", "Thriller", "Action"],
    rating: "PG-13",
    duration: "148 min",
    releaseYear: "2010",
    poster: "/posters/inception.jpg",
    synopsis: "A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project.",
    director: "Christopher Nolan",
    cast: ["Leonardo DiCaprio", "Marion Cotillard", "Tom Hardy", "Ellen Page"],
    showtimes: ["1:45 PM", "4:30 PM", "7:15 PM", "10:00 PM"],
    pricing: { regular: 12, premium: 18, vip: 25 },
    status: "now-showing"
  },
  {
    id: 3,
    title: "The Grand Budapest Hotel",
    genre: ["Comedy", "Drama", "Adventure"],
    rating: "R",
    duration: "99 min",
    releaseYear: "2014",
    poster: "/posters/grand-budapest-hotel.jpg",
    synopsis: "A writer encounters the owner of an aging high-class hotel, who tells him of his early years serving as a lobby boy in the hotel's glorious years under an exceptional concierge.",
    director: "Wes Anderson",
    cast: ["Ralph Fiennes", "F. Murray Abraham", "Mathieu Amalric", "Adrien Brody"],
    showtimes: ["3:00 PM", "6:00 PM", "9:00 PM"],
    pricing: { regular: 12, premium: 18, vip: 25 },
    status: "now-showing"
  },
  {
    id: 4,
    title: "Parasite",
    genre: ["Thriller", "Drama", "Comedy"],
    rating: "R",
    duration: "132 min",
    releaseYear: "2019",
    poster: "/posters/parasite.jpg",
    synopsis: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.",
    director: "Bong Joon Ho",
    cast: ["Kang-ho Song", "Sun-kyun Lee", "Yeo-jeong Jo", "Woo-sik Choi"],
    showtimes: ["2:15 PM", "5:30 PM", "8:45 PM"],
    pricing: { regular: 12, premium: 18, vip: 25 },
    status: "now-showing"
  },
  {
    id: 5,
    title: "Dune",
    genre: ["Sci-Fi", "Adventure", "Drama"],
    rating: "PG-13",
    duration: "155 min",
    releaseYear: "2021",
    poster: "/posters/dune.jpg",
    synopsis: "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family.",
    director: "Denis Villeneuve",
    cast: ["Timothée Chalamet", "Rebecca Ferguson", "Oscar Isaac", "Josh Brolin"],
    showtimes: ["1:30 PM", "4:45 PM", "8:00 PM", "11:30 PM"],
    pricing: { regular: 12, premium: 18, vip: 25 },
    status: "now-showing"
  },
  {
    id: 6,
    title: "Spider-Man: No Way Home",
    genre: ["Action", "Adventure", "Sci-Fi"],
    rating: "PG-13",
    duration: "148 min",
    releaseYear: "2021",
    poster: "/posters/spiderman-no-way-home.jpg",
    synopsis: "With Spider-Man's identity now revealed, Peter asks Doctor Strange for help. When a spell goes wrong, dangerous foes from other worlds start to appear, forcing Peter to discover what it truly means to be Spider-Man.",
    director: "Jon Watts",
    cast: ["Tom Holland", "Zendaya", "Benedict Cumberbatch", "Jacob Batalon"],
    showtimes: ["12:30 PM", "3:45 PM", "7:00 PM", "10:15 PM"],
    pricing: { regular: 12, premium: 18, vip: 25 },
    status: "coming-soon",
    releaseDate: "2024-12-25"
  },
  {
    id: 7,
    title: "Avengers: Secret Wars",
    genre: ["Action", "Adventure", "Sci-Fi"],
    rating: "PG-13",
    duration: "160 min",
    releaseYear: "2025",
    poster: "/posters/dune.jpg",
    synopsis: "The Avengers face their biggest challenge yet as multiple universes collide in an epic battle for the fate of reality itself.",
    director: "Russo Brothers",
    cast: ["Robert Downey Jr.", "Chris Evans", "Scarlett Johansson", "Mark Ruffalo"],
    showtimes: ["2:00 PM", "5:30 PM", "8:45 PM"],
    pricing: { regular: 15, premium: 22, vip: 30 },
    status: "coming-soon",
    releaseDate: "2025-01-15"
  }
];

export const featuredMovie = movies.find(movie => movie.featured) || movies[0];

export const nowShowingMovies = movies.filter(movie => movie.status === 'now-showing');

export const comingSoonMovies = movies.filter(movie => movie.status === 'coming-soon');