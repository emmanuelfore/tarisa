-- Insert issue categories
INSERT INTO issue_categories (code, name, icon, parent_category, response_time_hours, resolution_time_hours)
VALUES
  -- Roads Department
  ('potholes', 'Potholes', 'pothole', 'roads', 24, 48),
  ('road_damage', 'Road Damage', 'road', 'roads', 24, 72),
  ('streetlights', 'Streetlights', 'sun', 'roads', 12, 24),
  
  -- Water & Sanitation
  ('water_leaks', 'Water Leaks', 'droplets', 'water', 6, 24),
  ('burst_pipes', 'Burst Pipes', 'wrench', 'water', 2, 12),
  ('sewer_overflow', 'Sewer Overflow', 'alert-triangle', 'water', 2, 8),
  
  -- Waste Management
  ('uncollected_waste', 'Uncollected Waste', 'trash', 'waste', 24, 48),
  ('illegal_dumping', 'Illegal Dumping', 'ban', 'waste', 12, 48),
  
  -- Parks & Recreation
  ('damaged_playground', 'Damaged Playground', 'trees', 'parks', 48, 168),
  ('overgrown_grass', 'Overgrown Vegetation', 'leaf', 'parks', 72, 168),
  
  -- Public Health
  ('stray_animals', 'Stray Animals', 'dog', 'health', 12, 48),
  ('pest_infestation', 'Pest Infestation', 'bug', 'health', 24, 72),
  
  -- Public Works
  ('building_damage', 'Building Damage', 'building', 'public_works', 24, 72),
  ('drainage_issues', 'Drainage Issues', 'droplet', 'public_works', 24, 72)
ON CONFLICT (code) DO NOTHING;
