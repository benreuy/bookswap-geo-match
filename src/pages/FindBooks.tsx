
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, MapPin } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { BookCard } from "@/components/BookCard";

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
}

export default function FindBooks() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string>("");
  const [selectedCondition, setSelectedCondition] = useState<string>("");

  useEffect(() => {
    if (user) {
      fetchAvailableBooks();
    }
  }, [user]);

  const fetchAvailableBooks = async () => {
    try {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("available_for_swap", true)
        .neq("user_id", user?.id) // Exclude user's own books
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBooks(data || []);
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
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBooks.map((book) => (
                <div key={book.id} className="relative">
                  <BookCard
                    book={book}
                    viewMode="grid"
                    onEdit={() => {}} // No edit for other users' books
                    onDelete={() => {}} // No delete for other users' books
                  />
                  <div className="absolute bottom-2 left-2 right-2">
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => handleContactOwner(book.id)}
                    >
                      Request Swap
                    </Button>
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
