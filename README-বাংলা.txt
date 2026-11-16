অনলাইন পরীক্ষা কেন্দ্র — সেটআপ নির্দেশিকা

এই ফোল্ডারটি একটি ওয়েবসাইটের প্রাথমিক সংস্করণ। GitHub Pages-এ ওয়েবসাইটের ফাইল প্রকাশ করা যাবে; প্রশ্ন সবার কাছে অনলাইনে দেখাতে Supabase ডেটাবেস লাগবে।

১) Supabase তৈরি
- supabase.com-এ গিয়ে একটি project তৈরি করো।
- Project Settings → API থেকে Project URL এবং anon/public key কপি করো।
- config.js ফাইলে YOUR_SUPABASE_PROJECT_URL এবং YOUR_SUPABASE_ANON_KEY-এর জায়গায় আসল মান বসাও।
- Supabase → SQL Editor-এ গিয়ে supabase-schema.sql ফাইলের সব SQL চালাও।

২) অ্যাডমিন অ্যাকাউন্ট
- Supabase → Authentication → Users থেকে একজন user তৈরি করো (ইমেইল ও পাসওয়ার্ড)।
- ওই user-এর UUID কপি করো।
- Supabase → SQL Editor-এ নিচের SQL চালিয়ে UUID বসাও:
  insert into public.admins (user_id) values ('এখানে-user-uuid');
- এরপর ওয়েবসাইটের অ্যাডমিন ট্যাবে ওই ইমেইল-পাসওয়ার্ড দিয়ে লগইন করো।
- এই ডেমোতে শুধু admins টেবিলে যোগ করা অ্যাকাউন্টই অ্যাডমিন প্যানেল ব্যবহার করতে পারবে।

৩) GitHub Pages-এ প্রকাশ
- GitHub-এ নতুন public repository তৈরি করো।
- এই ফোল্ডারের সব ফাইল repository-তে upload করো।
- Repository → Settings → Pages → Deploy from a branch নির্বাচন করো।
- Branch হিসেবে main এবং folder হিসেবে /(root) দিয়ে Save করো।
- কিছুক্ষণ পর GitHub Pages-এর URL-এ ওয়েবসাইট দেখা যাবে।

৪) TXT প্রশ্ন ফাইলের নিয়ম
প্রতিটি প্রশ্নের মাঝে একটি খালি লাইন রাখবে। প্রতিটি প্রশ্নে প্রশ্ন, A/B/C/D চারটি অপশন এবং উত্তর দিতে হবে। উত্তর A, B, C বা D হবে। ব্যাখ্যা ঐচ্ছিক।

নমুনা:
প্রশ্ন: বাংলাদেশের রাজধানী কোনটি?
A) চট্টগ্রাম
B) ঢাকা
C) রাজশাহী
D) খুলনা
উত্তর: B
ব্যাখ্যা: ঢাকা বাংলাদেশের রাজধানী।

আরও একটি নমুনা দেখতে sample-questions.txt ফাইলটি খোলো।

গুরুত্বপূর্ণ:
- এই সংস্করণে শিক্ষার্থীদের আলাদা অ্যাকাউন্ট নেই; পরীক্ষা শেষে ফলাফল স্ক্রিনে দেখা যায়।
- Supabase-এর anon key ওয়েবসাইটে ব্যবহার করার জন্যই তৈরি; কখনো service_role key বা database password config.js-এ বসাবে না।
- বাস্তব ব্যবহারের আগে admin access, data policies, backup, এবং প্রশ্নের নিরাপত্তা ভালোভাবে পরীক্ষা করো।
- MCQ সঠিক উত্তর ডেটাবেসে থাকে এবং এই সাধারণ সংস্করণে ব্রাউজার থেকে দেখা সম্ভব হতে পারে। উচ্চ-নিরাপত্তার পরীক্ষার জন্য server-side grading প্রয়োজন।
