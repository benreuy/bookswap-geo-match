-- Update the books RLS policy to allow viewing all available books
DROP POLICY IF EXISTS "Users can view their own books" ON public.books;

CREATE POLICY "Users can view all available books for swap" 
ON public.books 
FOR SELECT 
USING (available_for_swap = true OR auth.uid() = user_id);

-- Also ensure users can still manage their own books
CREATE POLICY "Users can view their own books" 
ON public.books 
FOR SELECT 
USING (auth.uid() = user_id);