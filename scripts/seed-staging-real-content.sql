-- Staging-only content seed from draft.cjacanada.ca (preferred) + shared About copy.
-- Do NOT run against production.

DELETE FROM officials;

INSERT INTO official_categories (name, display_order, active)
VALUES
  ('Directors', 1, 1),
  ('Executives', 2, 1),
  ('Corporate Secretary', 3, 1)
ON CONFLICT(name) DO UPDATE SET display_order = excluded.display_order, active = 1, updated_at = datetime('now');

INSERT INTO officials (
  id, full_name, designation, category, photo_url, short_bio,
  display_order, status, created_at, updated_at
) VALUES
  (1, 'Director 1', 'Director', 'Directors',
   NULL, 'Placeholder — name to be confirmed by CJA.',
   1, 'active', datetime('now'), datetime('now')),
  (2, 'Director 2', 'Director', 'Directors',
   NULL, 'Placeholder — name to be confirmed by CJA.',
   2, 'active', datetime('now'), datetime('now')),
  (3, 'Director 3', 'Director', 'Directors',
   NULL, 'Placeholder — name to be confirmed by CJA.',
   3, 'active', datetime('now'), datetime('now')),
  (4, 'Sumit Rana', 'Executive Member', 'Executives',
   '/images/members/sumitr.jpg',
   'Mississauga · 437-259-4035 (public on draft.cjacanada.ca).',
   1, 'active', datetime('now'), datetime('now')),
  (5, 'Subhash Punia', 'Executive Member', 'Executives',
   '/images/members/subhashp.jpg',
   'Brampton · 416-569-3442 (public on draft.cjacanada.ca).',
   2, 'active', datetime('now'), datetime('now')),
  (6, 'Virendra Sheoran', 'Executive Member', 'Executives',
   '/images/members/virenders.jpg',
   'Mississauga · 647-231-4561 (public on draft.cjacanada.ca).',
   3, 'active', datetime('now'), datetime('now')),
  (7, 'Executive 4', 'Executive Member', 'Executives',
   NULL, 'Placeholder — name to be confirmed by CJA.',
   4, 'active', datetime('now'), datetime('now')),
  (8, 'Executive 5', 'Executive Member', 'Executives',
   NULL, 'Placeholder — name to be confirmed by CJA.',
   5, 'active', datetime('now'), datetime('now')),
  (9, 'Executive 6', 'Executive Member', 'Executives',
   NULL, 'Placeholder — name to be confirmed by CJA.',
   6, 'active', datetime('now'), datetime('now')),
  (10, 'Executive 7', 'Executive Member', 'Executives',
   NULL, 'Placeholder — name to be confirmed by CJA.',
   7, 'active', datetime('now'), datetime('now')),
  (11, 'Executive 8', 'Executive Member', 'Executives',
   NULL, 'Placeholder — name to be confirmed by CJA.',
   8, 'active', datetime('now'), datetime('now')),
  (12, 'Executive 9', 'Executive Member', 'Executives',
   NULL, 'Placeholder — name to be confirmed by CJA.',
   9, 'active', datetime('now'), datetime('now')),
  (13, 'Corporate Secretary', 'Corporate Secretary', 'Corporate Secretary',
   NULL, 'Placeholder — name to be confirmed by CJA.',
   1, 'active', datetime('now'), datetime('now'));

DELETE FROM news_articles;

INSERT INTO news_articles (
  id, title, slug, meta_description, body, published, published_at, author, featured,
  created_at, updated_at
) VALUES
  (1,
   'CJA Annual Diwali Mahotsav 2026',
   'diwali-mahotasav-2026',
   'You''re invited to a Spectacular Diwali Celebration presented by Canadian Jats Association — Saturday, 24 October 2026, 6 PM onwards. Venue details TBA.',
   'You''re Invited to a Spectacular Diwali Celebration! presented by Canadian Jats Association !!

✨ Join Us for an Evening of Light, Joy, and Togetherness! ✨

Date: Saturday, 24 October 2026. Time: 6 PM onwards. Location: Venue details TBA.

Celebrate the Festival of Lights with us! Enjoy a night filled with delicious food, vibrant music, cultural performances, and the joy of togetherness. This event is a wonderful opportunity to come together, celebrate and enjoy the festive spirit of Diwali with other Jat families. It will be a fun-filled day for all ages and will be a great chance for newcomers in Canada to meet and greet other Jat families.

Highlights of the Evening: Delicious Indian Snacks and Dinner; Live music and dance performances; Fun games and activities for all ages.

Ticket Price: Adult — $70; Early bird — $10 off (expires 10 October 2026); CJA member — $5 off (early bird and member discounts can be combined); Child (6 to 12) — $60; Child (Under 6) — free.

Please send your request email to info@cjacanada.com with the number of tickets or contact CJA Executives. Warm wishes, CJA Executive Team.',
   1, '2026-09-01', 'CJA Executive Team', 1, datetime('now'), datetime('now')),
  (2,
   'About the Canadian Jats Association',
   'about-cja-community',
   'CJA is a non-for-profit for the Jat community in Canada — networking, newcomer support, and cultural celebrations since 2006.',
   'The Canadian Jats Association (CJA) is a non-for-profit organization for the Jat community residing in Canada, located in Toronto, Ontario, with the primary objective of providing networking and support to new immigrants.

CJA was formed in 2006 as a common forum where members could meet, exchange views, and participate in social celebrations including Holi and Diwali. With currently over 400 members, CJA continues to enroll new members regularly.

For tickets and questions, email info@cjacanada.com.',
   1, '2026-08-15', 'CJA', 1, datetime('now'), datetime('now'));
