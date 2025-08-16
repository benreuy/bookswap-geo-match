-- Create a test user profile with coordinates near the main user
INSERT INTO public.profiles (user_id, display_name, address, latitude, longitude) 
VALUES ('test-user-123', 'Test User Sarah', 'Ben Gurion 15 Netanya', 32.3104469, 34.8746953)
ON CONFLICT (user_id) DO UPDATE SET 
  display_name = EXCLUDED.display_name,
  address = EXCLUDED.address,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude;

-- Add some test books for the test user that create matches
INSERT INTO public.books (user_id, title, author, condition, available_for_swap, genre) VALUES
-- Book that matches user's wishlist
('test-user-123', 'The Hobbit', 'J.R.R. Tolkien', 'excellent', true, 'Fantasy'),
-- Books that the test user might want (matching main user's books)
('test-user-123', 'Lord of the Rings', 'J.R.R. Tolkien', 'good', true, 'Fantasy'),
('test-user-123', 'Game of Thrones', 'George R.R. Martin', 'good', true, 'Fantasy')
ON CONFLICT (id) DO NOTHING;

-- Add wishlist items for test user that match main user's books (for double matches)
INSERT INTO public.wishlists (user_id, title, author, genre) VALUES
('test-user-123', 'Harry Potter', 'J.K. Rowling', 'Fantasy'),
('test-user-123', 'Dune', 'Frank Herbert', 'Science Fiction')
ON CONFLICT (id) DO NOTHING;