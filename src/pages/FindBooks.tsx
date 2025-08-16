
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { BookCard } from "@/components/BookCard";
import { TestDataButton } from "@/components/TestDataButton";

interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  condition: string;
  description?: string;
  genre?: string;
  cover_url?: string;
  available_for_swap: boolean;
  created_at: string;
  user_id: string;
  profiles?: {
    display_name?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
  };
}

interface EnhancedBook extends Book {
  distance?: number;
  isWishlistMatch?: boolean;
  isDoubleMatch?: boolean;
  matchScore?: number;
}

export default function FindBooks() {
  const { user } = useAuth();
  const [books, setBooks] = useState<EnhancedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedCondition, setSelectedCondition] = useState<string>("");
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userWishlist, setUserWishlist] = useState<any[]>([]);
  const [userBooks, setUserBooks] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      Promise.all([
        fetchUserData(),
        fetchAvailableBooks()
      ]);
    }
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch user profile with coordinates
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      setUserProfile(profile);

      // Fetch user's wishlist
      const { data: wishlist } = await supabase
        .from("wishlists")
        .select("*")
        .eq("user_id", user.id);
      setUserWishlist(wishlist || []);

      // Fetch user's books
      const { data: userBooks } = await supabase
        .from("books")
        .select("*")
        .eq("user_id", user.id);
      setUserBooks(userBooks || []);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const checkDoubleMatch = async (bookOwnerId: string, bookTitle: string, bookAuthor: string): Promise<boolean> => {
    // Check if the book owner wants any of our books
    const { data: ownerWishlist } = await supabase
      .from("wishlists")
      .select("title, author")
      .eq("user_id", bookOwnerId);

    if (!ownerWishlist) return false;

    return userBooks.some(userBook => 
      ownerWishlist.some(wish => 
        wish.title.toLowerCase().includes(userBook.title.toLowerCase()) ||
        userBook.title.toLowerCase().includes(wish.title.toLowerCase())
      )
    );
  };

  const fetchAvailableBooks = async () => {
    try {
      // First get books
      const { data: booksData, error: booksError } = await supabase
        .from("books")
        .select("*")
        .eq("available_for_swap", true)
        .neq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (booksError) throw booksError;

      // Then get profiles for each book owner
      const userIds = [...new Set(booksData?.map(book => book.user_id) || [])];
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("user_id, display_name, latitude, longitude, address")
        .in("user_id", userIds);

      // Combine books with their owner profiles
      const booksWithProfiles = booksData?.map(book => ({
        ...book,
        profiles: profilesData?.find(profile => profile.user_id === book.user_id)
      })) || [];

      // Enhance books with distance and match information
      const enhancedBooks: EnhancedBook[] = await Promise.all(
        booksWithProfiles.map(async (book) => {
          let distance: number | undefined;
          let isWishlistMatch = false;
          let isDoubleMatch = false;
          let matchScore = 0;

          // Calculate distance if both users have coordinates
          if (userProfile?.latitude && userProfile?.longitude && 
              book.profiles?.latitude && book.profiles?.longitude) {
            distance = calculateDistance(
              userProfile.latitude,
              userProfile.longitude,
              book.profiles.latitude,
              book.profiles.longitude
            );
          }

          // Check if book is in user's wishlist
          isWishlistMatch = userWishlist.some(wish => 
            wish.title.toLowerCase().includes(book.title.toLowerCase()) ||
            book.title.toLowerCase().includes(wish.title.toLowerCase())
          );

          // Check for double match
          if (isWishlistMatch) {
            isDoubleMatch = await checkDoubleMatch(book.user_id, book.title, book.author);
          }

          // Calculate match score for sorting
          if (isDoubleMatch) matchScore = 1000; // Highest priority
          else if (isWishlistMatch) matchScore = 100; // High priority
          else matchScore = 0;

          // Subtract distance to prioritize closer books within same match tier
          if (distance !== undefined) {
            matchScore -= distance;
          }

          return {
            ...book,
            distance,
            isWishlistMatch,
            isDoubleMatch,
            matchScore
          };
        })
      );

      // Sort by match score (highest first), then by distance (closest first)
      enhancedBooks.sort((a, b) => {
        if (b.matchScore !== a.matchScore) {
          return b.matchScore - a.matchScore;
        }
        if (a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance;
        }
        return 0;
      });

      setBooks(enhancedBooks);
    } catch (error) {
      console.error("Error fetching available books:", error);
      toast({
        title: "Error",
        description: "Failed to load available books",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleContactOwner = (bookId: string) => {
    // Placeholder for future contact functionality
    toast({
      title: "Contact Feature",
      description: "Contact functionality will be implemented soon!",
    });
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.genre?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGenre = !selectedGenre || book.genre === selectedGenre;
    const matchesCondition = !selectedCondition || book.condition === selectedCondition;
    
    return matchesSearch && matchesGenre && matchesCondition;
  });

  const genres = Array.from(new Set(books.map(book => book.genre).filter(Boolean)));
  const conditions = Array.from(new Set(books.map(book => book.condition)));

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to find books</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6">
          <TestDataButton />
          <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Find Books</h1>
            <p className="text-muted-foreground mt-2">
              Discover books available for swap from other users
            </p>
          </div>
          <Button variant="outline" disabled>
            <MapPin className="h-4 w-4 mr-2" />
            Near Me (Coming Soon)
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, author, or genre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="">All Genres</option>
            {genres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>

          <select
            value={selectedCondition}
            onChange={(e) => setSelectedCondition(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="">All Conditions</option>
            {conditions.map((condition) => (
              <option key={condition} value={condition}>
                {condition.charAt(0).toUpperCase() + condition.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading available books...</p>
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No books found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedGenre || selectedCondition
                ? "Try adjusting your search filters"
                : "No books are currently available for swap"}
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Found {filteredBooks.length} book{filteredBooks.length !== 1 ? 's' : ''} available for swap
                {userProfile?.address && " (sorted by distance and matches)"}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <div key={book.id} className="relative">
                  <div className="relative">
                    {book.isDoubleMatch && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="bg-gradient-primary text-white text-xs px-2 py-1 rounded-full font-semibold">
                          🔄 Double Match!
                        </span>
                      </div>
                    )}
                    {book.isWishlistMatch && !book.isDoubleMatch && (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="bg-primary text-white text-xs px-2 py-1 rounded-full font-semibold">
                          ⭐ Wishlist Match
                        </span>
                      </div>
                    )}
                    <BookCard
                      book={book}
                      viewMode="grid"
                      onEdit={() => {}}
                      onDelete={() => {}}
                    />
                  </div>
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="space-y-1">
                      {book.distance && (
                        <p className="text-xs text-muted-foreground text-center bg-background/80 rounded px-1">
                          📍 {book.distance.toFixed(1)} km away
                        </p>
                      )}
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleContactOwner(book.id)}
                        variant={book.isDoubleMatch ? "default" : book.isWishlistMatch ? "secondary" : "outline"}
                      >
                        {book.isDoubleMatch ? "Mutual Swap!" : "Request Swap"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
