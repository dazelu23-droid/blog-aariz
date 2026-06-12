ALTER TABLE home_types ADD COLUMN build_cost_tier TEXT NOT NULL DEFAULT 'moderate';
ALTER TABLE home_types ADD COLUMN buy_cost_tier TEXT NOT NULL DEFAULT 'moderate';
