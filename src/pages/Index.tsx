import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Signed out successfully',
      });
      navigate('/auth');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to sign out',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <nav className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">BookSwap</h1>
            <p className="text-xl text-muted-foreground">
              Welcome back, {user.user_metadata?.full_name || user.email}!
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => navigate('/library')}>
              <BookOpen className="h-4 w-4 mr-2" />
              My Library
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </nav>
        
        <div className="text-center py-16">
          <h2 className="text-2xl font-semibold mb-4">Your Book Swapping Journey Starts Here</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Connect with fellow book lovers and discover your next great read.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
            <div className="p-6 border rounded-lg text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">List Your Books</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload books you're willing to swap with others
              </p>
              <Button onClick={() => navigate('/library')} className="w-full">
                Manage Library
              </Button>
            </div>
            <div className="p-6 border rounded-lg text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Find Books</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Search for books you want to read nearby
              </p>
              <Button disabled className="w-full">
                Coming Soon
              </Button>
            </div>
            <div className="p-6 border rounded-lg text-center">
              <RefreshCw className="h-12 w-12 mx-auto mb-4 text-primary" />
              <h3 className="font-semibold mb-2">Make Swaps</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Connect with other users and arrange book exchanges
              </p>
              <Button disabled className="w-full">
                Coming Soon
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
