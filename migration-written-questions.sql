-- Supabase SQL Editor-এ একবার চালাও।
alter table public.questions add column if not exists official_answer text;
alter table public.questions alter column options drop not null, alter column correct_index drop not null;
alter table public.questions drop constraint if exists questions_correct_index_check;
-- পুরোনো MCQ প্রশ্নগুলো থাকবে; নতুন লিখিত প্রশ্নে options/correct_index NULL থাকবে।
