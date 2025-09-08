-- Add image_urls column to deep_search_results table for storing related images
ALTER TABLE public.deep_search_results 
ADD COLUMN image_urls TEXT[];