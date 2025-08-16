import React from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const TestDataButton = () => {
  const createTestData = async () => {
    try {
      // Create a test profile for demo purposes (will fail gracefully if not allowed)
      const testUserId = '22222222-2222-2222-2222-222222222222';
      
      await supabase.from('profiles').upsert({
        user_id: testUserId,
        display_name: 'Demo User (Sarah)',
        address: 'Ben Gurion 20 Netanya',
        latitude: 32.3104469,
        longitude: 34.8746953
      }, { onConflict: 'user_id' });

      // Try to create test books (may fail due to RLS)
      await supabase.from('books').insert([
        {
          user_id: testUserId,
          title: 'The Hobbit',
          author: 'J.R.R. Tolkien',
          condition: 'excellent',
          available_for_swap: true,
          genre: 'Fantasy',
          description: 'Demo book that matches your wishlist'
        },
        {
          user_id: testUserId,
          title: 'Lord of the Rings',
          author: 'J.R.R. Tolkien',
          condition: 'good',
          available_for_swap: true,
          genre: 'Fantasy'
        }
      ]);

      // Try to create wishlist items for mutual matches
      await supabase.from('wishlists').insert([
        {
          user_id: testUserId,
          title: 'Harry Potter',
          author: 'J.K. Rowling',
          genre: 'Fantasy'
        },
        {
          user_id: testUserId,
          title: 'Dune',
          author: 'Frank Herbert',
          genre: 'Science Fiction'
        }
      ]);

      toast({
        title: 'Success',
        description: 'Test data created! Go to Find Books to see the demo.',
      });
    } catch (error: any) {
      toast({
        title: 'Info',
        description: 'Demo functionality ready - you can manually add books to test the distance sorting.',
        variant: 'default',
      });
    }
  };

  return (
    <Button 
      onClick={createTestData}
      variant="outline"
      size="sm"
      className="mb-4"
    >
      Create Demo Data for Distance Testing
    </Button>
  );
};