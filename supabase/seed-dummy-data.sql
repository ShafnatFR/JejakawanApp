-- DUMMY DATA SEED — JejakawanApp
-- Run AFTER schema.sql and seed.sql (badges + destinations)

-- 1. USER PROFILES
INSERT INTO public.user_profiles (id, display_name, avatar_url, bio, current_mode, preferred_interests, budget_min, budget_max, transport_modes, ktp_verified, phone_verified, rating_avg, rating_count, xp_total, level, badge_count, subscription, is_active) VALUES
('a0000000-0000-0000-0000-000000000001', 'Shafnat Ramadhan', NULL, 'Full-stack developer & adventurer. Founder Jejakawan.', 'explorer', '{"alam","pendakian","budaya"}', 500000, 5000000, '{"mobil","motor"}', true, true, 4.80, 15, 3200, 5, 6, 'exclusive', true),
('a0000000-0000-0000-0000-000000000002', 'Andi Prasetyo', NULL, 'Wisatawan casual. Suka healing weekend.', 'tourist', '{"pantai","kuliner"}', 200000, 2000000, '{"mobil"}', true, true, 4.50, 8, 850, 3, 3, 'weekly', true),
('a0000000-0000-0000-0000-000000000003', 'Sari Dewi', NULL, 'Explorer & local guide Jabar. Kenal semua hidden gem!', 'explorer', '{"alam","air_terjun","foto"}', 100000, 3000000, '{"motor","umum"}', true, true, 4.90, 22, 5100, 7, 8, 'monthly', true),
('a0000000-0000-0000-0000-000000000004', 'Budi Santoso', NULL, 'Owner Budi Adventure Travel.', 'tourist', '{"alam","pendakian"}', 500000, 10000000, '{"mobil","bus"}', true, true, 4.60, 12, 1200, 4, 4, 'exclusive', true),
('a0000000-0000-0000-0000-000000000005', 'Rina Wati', NULL, 'Solo traveler. Suka tempat sepi dan underrated.', 'explorer', '{"alam","budaya","gua"}', 150000, 1500000, '{"umum","motor"}', false, true, 4.20, 5, 620, 2, 2, 'free', true),
('a0000000-0000-0000-0000-000000000006', 'Dedi Kurniawan', NULL, 'Baru mulai traveling.', 'tourist', '{"pantai","kuliner","kota"}', 300000, 2500000, '{"mobil"}', false, false, 0.00, 0, 50, 1, 1, 'free', true),
('a0000000-0000-0000-0000-000000000007', 'Maya Putri', NULL, 'Travel photographer & content creator.', 'explorer', '{"alam","foto","budaya"}', 200000, 4000000, '{"mobil","pesawat"}', true, true, 4.70, 18, 4500, 6, 7, 'exclusive', true),
('a0000000-0000-0000-0000-000000000008', 'Rizky Firmansyah', NULL, 'Community manager & moderator.', 'tourist', '{"budaya","kuliner"}', 300000, 3000000, '{"mobil"}', true, true, 4.40, 10, 2800, 5, 5, 'monthly', true)
ON CONFLICT (id) DO NOTHING;

-- 2. USER PREFERENCES
INSERT INTO public.user_preferences (user_id) VALUES
('a0000000-0000-0000-0000-000000000001'),
('a0000000-0000-0000-0000-000000000002'),
('a0000000-0000-0000-0000-000000000003'),
('a0000000-0000-0000-0000-000000000004'),
('a0000000-0000-0000-0000-000000000005'),
('a0000000-0000-0000-0000-000000000006'),
('a0000000-0000-0000-0000-000000000007'),
('a0000000-0000-0000-0000-000000000008')
ON CONFLICT (user_id) DO NOTHING;

-- 3. USER ROLES
INSERT INTO public.user_roles (user_id, role, status) VALUES
('a0000000-0000-0000-0000-000000000001', 'explorer', 'active'),
('a0000000-0000-0000-0000-000000000001', 'admin', 'active'),
('a0000000-0000-0000-0000-000000000002', 'tourist', 'active'),
('a0000000-0000-0000-0000-000000000003', 'explorer', 'active'),
('a0000000-0000-0000-0000-000000000003', 'guide', 'active'),
('a0000000-0000-0000-0000-000000000004', 'tourist', 'active'),
('a0000000-0000-0000-0000-000000000004', 'agency', 'active'),
('a0000000-0000-0000-0000-000000000005', 'explorer', 'active'),
('a0000000-0000-0000-0000-000000000006', 'tourist', 'active'),
('a0000000-0000-0000-0000-000000000007', 'explorer', 'active'),
('a0000000-0000-0000-0000-000000000008', 'tourist', 'active'),
('a0000000-0000-0000-0000-000000000008', 'admin', 'active')
ON CONFLICT (user_id, role) DO NOTHING;

-- 4. GUIDE PROFILES
INSERT INTO public.guide_profiles (user_id, guide_name, bio, operating_locations, price_per_day, languages, bank_account, bank_name, rating_avg, rating_count, is_verified) VALUES
('a0000000-0000-0000-0000-000000000003', 'Sari - Guide Jabar', 'Guide lokal Jawa Barat. Spesialis air terjun.', '{"Jawa Barat","Bandung","Sukabumi"}', 250000, '{"Indonesia","English"}', '1234567890', 'BCA', 4.90, 22, true),
('a0000000-0000-0000-0000-000000000007', 'Maya - Photo Guide', 'Guide sekaligus fotographer profesional.', '{"Jawa Tengah","DIY","Jawa Timur"}', 350000, '{"Indonesia","English"}', '0987654321', 'Mandiri', 4.70, 15, true),
('a0000000-0000-0000-0000-000000000008', 'Rizky Cultural Guide', 'Guide budaya & sejarah.', '{"Jawa Tengah","DIY"}', 200000, '{"Indonesia"}', '1122334455', 'BNI', 4.40, 8, true)
ON CONFLICT (user_id) DO NOTHING;

-- 5. AGENCY PROFILES
INSERT INTO public.agency_profiles (user_id, agency_name, description, phone, email, rating_avg, rating_count, is_verified) VALUES
('a0000000-0000-0000-0000-000000000004', 'Budi Adventure Travel', 'Open trip specialist Jawa-Bali.', '081234567890', 'budi.adventure@email.com', 4.60, 45, true),
('a0000000-0000-0000-0000-000000000001', 'ShafDev Travel Lab', 'Experimental travel tech.', '085215376975', 'shafnat@shafdev.com', 4.80, 12, true)
ON CONFLICT (user_id) DO NOTHING;

-- 6. TRIP REQUESTS
INSERT INTO public.trip_requests (creator_id, destination_name, date_from, date_to, duration_days, budget_min, budget_max, transport_modes, max_members, current_members, notes, status) VALUES
('a0000000-0000-0000-0000-000000000002', 'Bandung Weekend', '2026-10-15', '2026-10-17', 3, 500000, 1500000, '{"mobil"}', 4, 1, 'Mau healing weekend di Bandung.', 'open'),
('a0000000-0000-0000-0000-000000000001', 'Bromo - Ijen Expedition', '2026-11-01', '2026-11-03', 3, 800000, 2000000, '{"mobil"}', 6, 3, 'Sunrise Bromo + blue fire Ijen.', 'matched'),
('a0000000-0000-0000-0000-000000000005', 'Dieng Solo Trip', '2026-10-20', '2026-10-22', 3, 300000, 800000, '{"umum","motor"}', 2, 1, 'Mau ke Dieng, sikunir, telaga warna.', 'open'),
('a0000000-0000-0000-0000-000000000007', 'Nusa Penida Photo Trip', '2026-11-10', '2026-11-12', 3, 1000000, 3000000, '{"pesawat"}', 4, 2, 'Photo hunting di Nusa Penida.', 'matched'),
('a0000000-0000-0000-0000-000000000006', 'Yogyakarta First Trip', '2026-12-01', '2026-12-03', 3, 500000, 1500000, '{"kereta"}', 4, 1, 'Baru pertama ke Jogja.', 'open'),
('a0000000-0000-0000-0000-000000000003', 'Curug Cikaso Exploration', '2026-10-25', '2026-10-25', 1, 100000, 300000, '{"motor"}', 3, 2, 'Day trip ke Curug Cikaso.', 'open');

-- 7. OPEN TRIPS
INSERT INTO public.open_trips (agency_id, title, description, price, start_date, end_date, max_participants, current_participants, includes, excludes, itinerary) VALUES
((SELECT id FROM agency_profiles WHERE user_id = 'a0000000-0000-0000-0000-000000000004' LIMIT 1), 'Bromo Midnight Sunrise', 'Sunrise Bromo dari Penanjakan. Include jeep & guide.', 450000, '2026-11-01', '2026-11-02', 20, 12, '{"Jeep 4x4","Guide","Tiket"}', '{"Transport","Makan"}', '[{"day":1,"title":"Midnight Start"}]'),
((SELECT id FROM agency_profiles WHERE user_id = 'a0000000-0000-0000-0000-000000000004' LIMIT 1), 'Ijen Blue Fire Trek', 'Trekking malam ke Kawah Ijen.', 550000, '2026-11-02', '2026-11-03', 15, 8, '{"Guide","Tiket","Masker"}', '{"Transport","Makan"}', '[{"day":1,"title":"Night Trek"}]'),
((SELECT id FROM agency_profiles WHERE user_id = 'a0000000-0000-0000-0000-000000000001' LIMIT 1), 'Nusa Penida 3D2N', 'Eksplorasi lengkap Nusa Penida.', 1800000, '2026-11-10', '2026-11-12', 10, 4, '{"Speedboat","Hotel"}', '{"Tiket pesawat","Makan"}', '[{"day":1,"title":"Arrival"}]'),
((SELECT id FROM agency_profiles WHERE user_id = 'a0000000-0000-0000-0000-000000000004' LIMIT 1), 'Dieng Culture Festival', 'Jelajahi Dieng: Candi, Telaga Warna, Sikunir.', 650000, '2026-12-05', '2026-12-07', 25, 15, '{"Transport","Homestay","Guide"}', '{"Makan"}', '[{"day":1,"title":"Candi Arjuna"}]'),
((SELECT id FROM agency_profiles WHERE user_id = 'a0000000-0000-0000-0000-000000000004' LIMIT 1), 'Bali Hidden Gems', 'Bali selain Kuta: Amed, Sidemen, Munduk.', 2200000, '2026-12-15', '2026-12-18', 12, 6, '{"Transport","Hotel","Guide"}', '{"Tiket pesawat","Makan"}', '[{"day":1,"title":"Amed"}]');

-- 8. OPEN TRIP BOOKINGS
INSERT INTO public.open_trip_bookings (trip_id, user_id, status, payment_status) VALUES
((SELECT id FROM open_trips WHERE title = 'Bromo Midnight Sunrise' LIMIT 1), 'a0000000-0000-0000-0000-000000000002', 'confirmed', 'paid'),
((SELECT id FROM open_trips WHERE title = 'Bromo Midnight Sunrise' LIMIT 1), 'a0000000-0000-0000-0000-000000000005', 'confirmed', 'paid'),
((SELECT id FROM open_trips WHERE title = 'Ijen Blue Fire Trek' LIMIT 1), 'a0000000-0000-0000-0000-000000000006', 'pending', 'pending'),
((SELECT id FROM open_trips WHERE title = 'Nusa Penida 3D2N' LIMIT 1), 'a0000000-0000-0000-0000-000000000002', 'confirmed', 'paid'),
((SELECT id FROM open_trips WHERE title = 'Dieng Culture Festival' LIMIT 1), 'a0000000-0000-0000-0000-000000000007', 'confirmed', 'paid'),
((SELECT id FROM open_trips WHERE title = 'Bali Hidden Gems' LIMIT 1), 'a0000000-0000-0000-0000-000000000001', 'pending', 'pending');

-- 9. MISSIONS
INSERT INTO public.missions (title, description, xp_reward, max_claims, current_claims, is_active) VALUES
('Jelajahi 3 Air Terjun Jabar', 'Kunjungi minimal 3 air terjun di Jawa Barat.', 300, 50, 12, true),
('Sunrise Hunter', 'Dokumentasikan sunrise di 3 destinasi berbeda.', 250, 30, 8, true),
('Cultural Immersion', 'Kunjungi 2 kampung adat dan tulis review.', 200, 40, 5, true),
('Underrated Explorer', 'Temukan 5 destinasi underrated.', 500, 20, 3, true),
('Bromo Ijen Double', 'Selesaikan trip Bromo + Ijen.', 400, 25, 6, true);

-- 10. MISSION CLAIMS
INSERT INTO public.mission_claims (mission_id, user_id, status, completed_at) VALUES
((SELECT id FROM missions WHERE title = 'Jelajahi 3 Air Terjun Jabar' LIMIT 1), 'a0000000-0000-0000-0000-000000000003', 'completed', NOW() - INTERVAL '5 days'),
((SELECT id FROM missions WHERE title = 'Jelajahi 3 Air Terjun Jabar' LIMIT 1), 'a0000000-0000-0000-0000-000000000001', 'in_progress', NULL),
((SELECT id FROM missions WHERE title = 'Sunrise Hunter' LIMIT 1), 'a0000000-0000-0000-0000-000000000007', 'completed', NOW() - INTERVAL '3 days'),
((SELECT id FROM missions WHERE title = 'Sunrise Hunter' LIMIT 1), 'a0000000-0000-0000-0000-000000000005', 'claimed', NULL),
((SELECT id FROM missions WHERE title = 'Cultural Immersion' LIMIT 1), 'a0000000-0000-0000-0000-000000000001', 'completed', NOW() - INTERVAL '10 days'),
((SELECT id FROM missions WHERE title = 'Underrated Explorer' LIMIT 1), 'a0000000-0000-0000-0000-000000000003', 'in_progress', NULL),
((SELECT id FROM missions WHERE title = 'Bromo Ijen Double' LIMIT 1), 'a0000000-0000-0000-0000-000000000001', 'claimed', NULL),
((SELECT id FROM missions WHERE title = 'Bromo Ijen Double' LIMIT 1), 'a0000000-0000-0000-0000-000000000007', 'completed', NOW() - INTERVAL '7 days');

-- 11. REVIEWS
INSERT INTO public.reviews (reviewer_id, target_type, target_id, rating, comment) VALUES
('a0000000-0000-0000-0000-000000000003', 'destination', (SELECT id FROM destinations WHERE slug = 'curug-cikaso' LIMIT 1), 5, 'Air terjunnya luar biasa! Tiga curug sekaligus.'),
('a0000000-0000-0000-0000-000000000007', 'destination', (SELECT id FROM destinations WHERE slug = 'bukit-sikunir' LIMIT 1), 5, 'Golden sunrise terbaik! Wajib camping.'),
('a0000000-0000-0000-0000-000000000001', 'destination', (SELECT id FROM destinations WHERE slug = 'kampung-naga' LIMIT 1), 4, 'Kampung adat yang masih autentik.'),
('a0000000-0000-0000-0000-000000000002', 'destination', (SELECT id FROM destinations WHERE slug = 'dieng-plateau' LIMIT 1), 5, 'Telaga warnanya magical pagi hari.'),
('a0000000-0000-0000-0000-000000000005', 'destination', (SELECT id FROM destinations WHERE slug = 'pantai-menganti' LIMIT 1), 5, 'Hidden gem banget. Sepi, tebingnya epik.'),
('a0000000-0000-0000-0000-000000000003', 'user', 'a0000000-0000-0000-0000-000000000001', 5, 'Travel partner yang seru dan well-prepared.'),
('a0000000-0000-0000-0000-000000000007', 'user', 'a0000000-0000-0000-0000-000000000003', 5, 'Guide terbaik! Tau semua spot foto.'),
('a0000000-0000-0000-0000-000000000001', 'user', 'a0000000-0000-0000-0000-000000000007', 4, 'Fotographer jago.'),
('a0000000-0000-0000-0000-000000000006', 'destination', (SELECT id FROM destinations WHERE slug = 'lawang-sewu' LIMIT 1), 4, 'Gedung bersejarah yang megah.'),
('a0000000-0000-0000-0000-000000000002', 'destination', (SELECT id FROM destinations WHERE slug = 'ciletuh-geopark' LIMIT 1), 5, 'Geopark underrated. Tebingnya spektakuler.');

-- 12. CHAT ROOMS
INSERT INTO public.chat_rooms (type) VALUES
('group'), ('group'), ('direct');

-- 13. CHAT ROOM MEMBERS (assign rooms dynamically)
WITH rooms AS (SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn FROM chat_rooms)
INSERT INTO public.chat_room_members (room_id, user_id) SELECT id, 'a0000000-0000-0000-0000-000000000001' FROM rooms WHERE rn = 1;
INSERT INTO public.chat_room_members (room_id, user_id) SELECT id, 'a0000000-0000-0000-0000-000000000003' FROM rooms WHERE rn = 1;
INSERT INTO public.chat_room_members (room_id, user_id) SELECT id, 'a0000000-0000-0000-0000-000000000007' FROM rooms WHERE rn = 1;
INSERT INTO public.chat_room_members (room_id, user_id) SELECT id, 'a0000000-0000-0000-0000-000000000007' FROM rooms WHERE rn = 2;
INSERT INTO public.chat_room_members (room_id, user_id) SELECT id, 'a0000000-0000-0000-0000-000000000005' FROM rooms WHERE rn = 2;
INSERT INTO public.chat_room_members (room_id, user_id) SELECT id, 'a0000000-0000-0000-0000-000000000001' FROM rooms WHERE rn = 3;
INSERT INTO public.chat_room_members (room_id, user_id) SELECT id, 'a0000000-0000-0000-0000-000000000002' FROM rooms WHERE rn = 3;

-- 14. CHAT MESSAGES
WITH rooms AS (SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn FROM chat_rooms)
INSERT INTO public.chat_messages (room_id, sender_id, content, type) SELECT id, 'a0000000-0000-0000-0000-000000000001', 'Halo tim! Ada yang mau bahas itinerary?', 'text' FROM rooms WHERE rn = 1;
INSERT INTO public.chat_messages (room_id, sender_id, content, type) SELECT id, 'a0000000-0000-0000-0000-000000000003', 'Aku suggest kita camping dulu sebelum ke Bromo', 'text' FROM rooms WHERE rn = 1;
INSERT INTO public.chat_messages (room_id, sender_id, content, type) SELECT id, 'a0000000-0000-0000-0000-000000000007', 'Setuju! Aku bawa drone', 'text' FROM rooms WHERE rn = 1;
INSERT INTO public.chat_messages (room_id, sender_id, content, type) SELECT id, 'a0000000-0000-0000-0000-000000000007', 'Rina, kamu sudah pernah ke Nusa Penida?', 'text' FROM rooms WHERE rn = 2;
INSERT INTO public.chat_messages (room_id, sender_id, content, type) SELECT id, 'a0000000-0000-0000-0000-000000000005', 'Belum, tapi udah research spotnya', 'text' FROM rooms WHERE rn = 2;
INSERT INTO public.chat_messages (room_id, sender_id, content, type) SELECT id, 'a0000000-0000-0000-0000-000000000001', 'Hai Andi, mau join trip Bandung?', 'text' FROM rooms WHERE rn = 3;
INSERT INTO public.chat_messages (room_id, sender_id, content, type) SELECT id, 'a0000000-0000-0000-0000-000000000002', 'Wah seru! Kapan?', 'text' FROM rooms WHERE rn = 3;

-- 15. NOTIFICATIONS
INSERT INTO public.notifications (user_id, type, title, body, data) VALUES
('a0000000-0000-0000-0000-000000000001', 'match_invitation', 'Undangan Match Baru!', 'Sari mengajakmu ke Curug Cikaso', '{}'),
('a0000000-0000-0000-0000-000000000001', 'xp_earned', '+100 XP!', 'Dari menyelesaikan trip', '{"amount":100}'),
('a0000000-0000-0000-0000-000000000002', 'trip_reminder', 'Trip Besok!', 'Bromo Midnight Sunrise besok malam', '{}'),
('a0000000-0000-0000-0000-000000000003', 'mission_progress', 'Misi Update', 'Progress: 2/3 air terjun', '{}'),
('a0000000-0000-0000-0000-000000000007', 'match_accepted', 'Match Diterima!', 'Rina menerima undangan Nusa Penida', '{}'),
('a0000000-0000-0000-0000-000000000004', 'payment_success', 'Booking Baru!', 'Andi booking Bromo Midnight', '{}'),
('a0000000-0000-0000-0000-000000000006', 'subscription_reminder', 'Coba Premium!', 'Upgrade untuk rekomendasi unlimited', '{}'),
('a0000000-0000-0000-0000-000000000008', 'report_update', 'Laporan Ditinjau', 'Laporan sedang ditinjau admin', '{}');

-- 16. USER FAVORITES
INSERT INTO public.user_favorites (user_id, destination_id) VALUES
('a0000000-0000-0000-0000-000000000001', (SELECT id FROM destinations WHERE slug = 'curug-cikaso' LIMIT 1)),
('a0000000-0000-0000-0000-000000000001', (SELECT id FROM destinations WHERE slug = 'dieng-plateau' LIMIT 1)),
('a0000000-0000-0000-0000-000000000001', (SELECT id FROM destinations WHERE slug = 'karimun-jawa' LIMIT 1)),
('a0000000-0000-0000-0000-000000000002', (SELECT id FROM destinations WHERE slug = 'pantai-menganti' LIMIT 1)),
('a0000000-0000-0000-0000-000000000002', (SELECT id FROM destinations WHERE slug = 'lawang-sewu' LIMIT 1)),
('a0000000-0000-0000-0000-000000000003', (SELECT id FROM destinations WHERE slug = 'gunung-papandayan' LIMIT 1)),
('a0000000-0000-0000-0000-000000000003', (SELECT id FROM destinations WHERE slug = 'bukit-sikunir' LIMIT 1)),
('a0000000-0000-0000-0000-000000000007', (SELECT id FROM destinations WHERE slug = 'bukit-sikunir' LIMIT 1)),
('a0000000-0000-0000-0000-000000000007', (SELECT id FROM destinations WHERE slug = 'ciletuh-geopark' LIMIT 1)),
('a0000000-0000-0000-0000-000000000005', (SELECT id FROM destinations WHERE slug = 'pantai-menganti' LIMIT 1))
ON CONFLICT (user_id, destination_id) DO NOTHING;

-- 17. USER SUBSCRIPTIONS
INSERT INTO public.user_subscriptions (user_id, plan, starts_at, expires_at, status) VALUES
('a0000000-0000-0000-0000-000000000001', 'exclusive', NOW() - INTERVAL '30 days', NOW() + INTERVAL '335 days', 'active'),
('a0000000-0000-0000-0000-000000000003', 'monthly', NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days', 'active'),
('a0000000-0000-0000-0000-000000000004', 'exclusive', NOW() - INTERVAL '60 days', NOW() + INTERVAL '305 days', 'active');

-- 18. TRANSACTIONS
INSERT INTO public.transactions (user_id, type, amount, status, payment_method) VALUES
('a0000000-0000-0000-0000-000000000001', 'subscription', 500000, 'completed', 'bank_transfer'),
('a0000000-0000-0000-0000-000000000003', 'subscription', 75000, 'completed', 'qris'),
('a0000000-0000-0000-0000-000000000004', 'subscription', 500000, 'completed', 'bank_transfer'),
('a0000000-0000-0000-0000-000000000002', 'booking', 450000, 'completed', 'qris'),
('a0000000-0000-0000-0000-000000000005', 'booking', 450000, 'completed', 'bank_transfer'),
('a0000000-0000-0000-0000-000000000007', 'booking', 1800000, 'completed', 'credit_card'),
('a0000000-0000-0000-0000-000000000006', 'booking', 550000, 'pending', 'bank_transfer'),
('a0000000-0000-0000-0000-000000000001', 'booking', 2200000, 'pending', 'qris');

-- 19. DONATIONS
INSERT INTO public.donations (user_id, amount, tier, payment_status) VALUES
('a0000000-0000-0000-0000-000000000007', 500000, 'gold', 'paid'),
('a0000000-0000-0000-0000-000000000001', 200000, 'gold', 'paid'),
('a0000000-0000-0000-0000-000000000002', 50000, 'silver', 'paid'),
('a0000000-0000-0000-0000-000000000003', 25000, 'bronze', 'paid');

-- 20. USER REPORTS
INSERT INTO public.user_reports (reporter_id, reported_type, reported_id, reason, description, status) VALUES
('a0000000-0000-0000-0000-000000000002', 'user', 'a0000000-0000-0000-0000-000000000006', 'spam', 'Mengirim pesan promosi berulang', 'pending'),
('a0000000-0000-0000-0000-000000000008', 'user', 'a0000000-0000-0000-0000-000000000006', 'inappropriate', 'Berkata kasar di chat', 'resolved');

-- 21. TRUST SCORE LOGS
INSERT INTO public.trust_score_logs (user_id, change_amount, reason) VALUES
('a0000000-0000-0000-0000-000000000001', 20, 'KTP verified'),
('a0000000-0000-0000-0000-000000000001', 10, 'Phone verified'),
('a0000000-0000-0000-0000-000000000001', 15, 'Rating above 4.0'),
('a0000000-0000-0000-0000-000000000003', 20, 'KTP verified'),
('a0000000-0000-0000-0000-000000000003', 10, 'Phone verified'),
('a0000000-0000-0000-0000-000000000002', 10, 'Phone verified');

-- 22. ADMIN AUDIT LOGS
INSERT INTO public.admin_audit_logs (admin_id, action, target_type, details) VALUES
('a0000000-0000-0000-0000-000000000008', 'approve', 'user_content', '{"reason":"Foto valid"}'),
('a0000000-0000-0000-0000-000000000001', 'verify', 'agency_profile', '{"documents":"verified"}'),
('a0000000-0000-0000-0000-000000000001', 'verify', 'guide_profile', '{"documents":"verified"}');

SELECT 'Dummy data inserted!' as status;