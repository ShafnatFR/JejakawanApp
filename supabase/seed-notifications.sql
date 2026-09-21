-- Seed notifications for testing
-- Replace <USER_ID> with actual user UUID before running

-- Welcome notification
INSERT INTO notifications (user_id, type, title, body, data, created_at)
VALUES (
  '<USER_ID>',
  'system',
  'Selamat datang di Jejakawan! 🎉',
  'Mulai petualanganmu sekarang. Jelajahi destinasi menarik dan temukan teman perjalanan!',
  '{"link": "/discover"}',
  NOW()
);

-- Trip created notification
INSERT INTO notifications (user_id, type, title, body, data, created_at)
VALUES (
  '<USER_ID>',
  'trip',
  'Trip berhasil dibuat! 🗺️',
  'Trip ke Bali sudah aktif. Tunggu calon teman perjalanan mengirim permintaan match.',
  '{"link": "/match"}',
  NOW() - INTERVAL '1 hour'
);

-- Match request notification
INSERT INTO notifications (user_id, type, title, body, data, created_at)
VALUES (
  '<USER_ID>',
  'match',
  'Ada yang ingin match denganmu! 🤝',
  'Andi mengirim permintaan match untuk trip ke Yogyakarta. Lihat profilnya sekarang!',
  '{"link": "/match"}',
  NOW() - INTERVAL '2 hours'
);

-- Badge earned notification
INSERT INTO notifications (user_id, type, title, body, data, created_at)
VALUES (
  '<USER_ID>',
  'badge',
  'Badge baru diraih! 🏆',
  'Selamat! Kamu mendapatkan badge "Petualang Pemula" karena telah menyelesaikan trip pertama.',
  '{"link": "/gamification"}',
  NOW() - INTERVAL '1 day'
);

-- Review notification
INSERT INTO notifications (user_id, type, title, body, data, created_at)
VALUES (
  '<USER_ID>',
  'review',
  'Review baru dari teman trip ⭐',
  'Rina memberikan rating 5 bintang untuk trip ke Labuan Bajo. Lihat reviewnya!',
  '{"link": "/profile"}',
  NOW() - INTERVAL '2 days'
);

-- System notification
INSERT INTO notifications (user_id, type, title, body, data, created_at)
VALUES (
  '<USER_ID>',
  'system',
  'Tips: Lengkapi profilmu! 📝',
  'Profil yang lengkap meningkatkan peluang match hingga 3x. Tambahkan foto dan bio kamu.',
  '{"link": "/profile"}',
  NOW() - INTERVAL '3 days'
);
