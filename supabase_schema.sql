-- Dynamic Supabase Database Schema for CropGPT

-- 1. CROPS TABLE
CREATE TABLE public.crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key_name TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    soil TEXT NOT NULL,
    fertilizer TEXT NOT NULL,
    watering TEXT NOT NULL,
    harvest TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for crops
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to crops" ON public.crops FOR SELECT USING (true);
CREATE POLICY "Allow admin write access to crops" ON public.crops FOR ALL USING (auth.uid() IS NOT NULL);


-- 2. WEATHER ADVISORIES TABLE
CREATE TABLE public.weather_advisories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district TEXT UNIQUE NOT NULL,
    temp TEXT NOT NULL,
    soil TEXT NOT NULL,
    ideal_crops TEXT NOT NULL,
    wind TEXT NOT NULL,
    humidity TEXT NOT NULL,
    rain TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for weather
ALTER TABLE public.weather_advisories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to weather" ON public.weather_advisories FOR SELECT USING (true);
CREATE POLICY "Allow admin write access to weather" ON public.weather_advisories FOR ALL USING (auth.uid() IS NOT NULL);


-- 3. MARKET PRICES TABLE
CREATE TABLE public.market_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district TEXT NOT NULL,
    crop TEXT NOT NULL,
    price TEXT NOT NULL,
    demand INT NOT NULL CHECK (demand >= 0 AND demand <= 100),
    supply INT NOT NULL CHECK (supply >= 0 AND supply <= 100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for market prices
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to market" ON public.market_prices FOR SELECT USING (true);
CREATE POLICY "Allow admin write access to market" ON public.market_prices FOR ALL USING (auth.uid() IS NOT NULL);


-- 4. GOVT SCHEMES TABLE
CREATE TABLE public.schemes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for schemes
ALTER TABLE public.schemes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to schemes" ON public.schemes FOR SELECT USING (true);
CREATE POLICY "Allow admin write access to schemes" ON public.schemes FOR ALL USING (auth.uid() IS NOT NULL);


-- 5. FORUM POSTS (Farmer Community)
CREATE TABLE public.forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_name TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for forum posts
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to forum posts" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Allow public write access to forum posts" ON public.forum_posts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin delete access to forum posts" ON public.forum_posts FOR DELETE USING (auth.uid() IS NOT NULL);


-- 6. FORUM ANSWERS (Farmer Community Replies)
CREATE TABLE public.forum_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for forum answers
ALTER TABLE public.forum_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to forum answers" ON public.forum_answers FOR SELECT USING (true);
CREATE POLICY "Allow public write access to forum answers" ON public.forum_answers FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admin delete access to forum answers" ON public.forum_answers FOR DELETE USING (auth.uid() IS NOT NULL);


-- 7. INITIAL STATIC DATA INSERT SCRIPTS (Optional, to populate database)
/*
INSERT INTO public.crops (key_name, name, soil, fertilizer, watering, harvest) VALUES
('rice', 'Rice (Paddy)', 'Clayey and loamy soils', 'Nitrogen (Urea), Phosphorus, Potassium', 'Requires standing water (2-5 cm), frequent irrigation', 'Approx. 90-120 days after planting'),
('maize', 'Maize (Corn)', 'Well-drained loamy soils', 'High Nitrogen, Phosphorus', 'Once every 5-7 days during peak growth', 'Approx. 60-100 days, when silks are dry');

INSERT INTO public.weather_advisories (district, temp, soil, ideal_crops, wind, humidity, rain) VALUES
('Sambalpur', '32°C', 'Red and Yellow', 'Rice, Pulses, Oilseeds, Sugarcane', '11 km/h', '77%', '35% chance of rain'),
('Cuttack', '31°C', 'Alluvial, Laterite', 'Rice, Jute, Sugarcane, Vegetables', '13 km/h', '80%', '50% chance of showers'),
('Bargarh', '32°C', 'Mixed Red and Black', 'Rice, Pulses, Groundnut, Sugarcane', '11 km/h', '76%', '35% chance of rain');

INSERT INTO public.market_prices (district, crop, price, demand, supply) VALUES
('Sambalpur', 'Paddy', '₹2183', 85, 75),
('Sambalpur', 'Pulses', '₹7000', 60, 65),
('Sambalpur', 'Oilseeds', '₹6377', 50, 45),
('Cuttack', 'Paddy', '₹2190', 90, 80),
('Cuttack', 'Jute', '₹5050', 70, 65),
('Cuttack', 'Sugarcane', '₹3500', 60, 65),
('Bargarh', 'Paddy (Grade A)', '₹2203', 95, 90),
('Bargarh', 'Groundnut', '₹6400', 55, 50),
('Bargarh', 'Mung (Pulses)', '₹8558', 65, 60);

INSERT INTO public.schemes (title, description) VALUES
('KALIA (Krushak Assistance for Livelihood and Income Augmentation)', 'Provides financial support to small and marginal farmers for cultivation, livelihood, and insurance.'),
('PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)', 'A central government scheme providing an income support of ₹6,000 per year in three equal installments to all landholding farmer families.');
*/
