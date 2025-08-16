
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome to BookSwap</h1>
        <p className="text-xl text-muted-foreground">
          Hello, {user?.user_metadata?.full_name || user?.email}!
        </p>
      </div>
      
      <div className="text-center py-16">
        <h2 className="text-2xl font-semibold mb-4">Your Book Swapping Journey Starts Here</h2>
        <p className="text-lg text-muted-foreground mb-8">
          Connect with fellow book lovers and discover your next great read.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
          <div className="p-6 border rounded-lg text-center card-glow bg-card">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h3 className="font-semibold mb-2">Manage Your Library</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Upload books you're willing to swap with others
            </p>
            <Button onClick={() => navigate('/library')} variant="gradient" className="w-full">
              My Library
            </Button>
          </div>
          <div className="p-6 border rounded-lg text-center card-glow bg-card">
            <Users className="h-12 w-12 mx-auto mb-4 text-secondary" />
            <h3 className="font-semibold mb-2">Create Wishlist</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Keep track of books you want to read
            </p>
            <Button onClick={() => navigate('/wishlist')} variant="secondary" className="w-full">
              My Wishlist
            </Button>
          </div>
          <div className="p-6 border rounded-lg text-center card-glow bg-card">
            <RefreshCw className="h-12 w-12 mx-auto mb-4 text-accent" />
            <h3 className="font-semibold mb-2">Make Swaps</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Connect with other users and arrange book exchanges
            </p>
            <Button disabled className="w-full" variant="outline">
              Coming Soon
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
