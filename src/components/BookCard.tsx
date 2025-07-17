import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Book } from "lucide-react";

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
}

interface BookCardProps {
  book: Book;
  viewMode: "grid" | "list";
  onEdit: () => void;
  onDelete: () => void;
}

const conditionColors = {
  excellent: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  good: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  fair: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  poor: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function BookCard({ book, viewMode, onEdit, onDelete }: BookCardProps) {
  if (viewMode === "list") {
    return (
      <Card className="w-full">
        <div className="flex items-center p-4 gap-4">
          <div className="w-16 h-20 bg-muted rounded flex items-center justify-center flex-shrink-0">
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-full h-full object-cover rounded"
              />
            ) : (
              <Book className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{book.title}</h3>
            <p className="text-muted-foreground truncate">by {book.author}</p>
            {book.genre && (
              <p className="text-sm text-muted-foreground">{book.genre}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="secondary"
                className={conditionColors[book.condition as keyof typeof conditionColors]}
              >
                {book.condition}
              </Badge>
              {book.available_for_swap && (
                <Badge variant="outline">Available for swap</Badge>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="aspect-[3/4] bg-muted rounded-md flex items-center justify-center mb-3">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={book.title}
              className="w-full h-full object-cover rounded-md"
            />
          ) : (
            <Book className="h-12 w-12 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="font-semibold text-lg line-clamp-2 mb-1">{book.title}</h3>
          <p className="text-muted-foreground text-sm mb-2">by {book.author}</p>
          {book.genre && (
            <p className="text-xs text-muted-foreground mb-3">{book.genre}</p>
          )}
          <div className="space-y-2">
            <Badge
              variant="secondary"
              className={conditionColors[book.condition as keyof typeof conditionColors]}
            >
              {book.condition}
            </Badge>
            {book.available_for_swap && (
              <Badge variant="outline" className="block w-fit">
                Available for swap
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 pt-4 mt-auto">
          <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}