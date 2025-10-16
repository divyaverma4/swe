// Import Supabase client from the global window object
const { createClient } = window.supabase;

// ✅ Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://psfumeaxgcsemrlzbuwq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzZnVtZWF4Z2NzZW1ybHpidXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MTI4NjcsImV4cCI6MjA3NjE4ODg2N30.MJQ7ctg8kJEKVEW9DKxcQTTt0ZpaQa_n4qcdO2z78Us';

// Initialize the client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Select UI elements
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const signupBtn = document.getElementById('signup-btn');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const statusText = document.getElementById('status');

// --- SIGN UP ---
signupBtn.addEventListener('click', async () => {
  statusText.textContent = 'Signing up...';
  const { data, error } = await supabase.auth.signUp({
    email: emailInput.value,
    password: passwordInput.value
  });

  if (error) {
    statusText.textContent = `❌ ${error.message}`;
    console.error(error);
  } else {
    statusText.textContent = `✅ Sign-up successful! Check your email.`;
    console.log(data);
  }
});

// --- LOG IN ---
loginBtn.addEventListener('click', async () => {
  statusText.textContent = 'Logging in...';
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailInput.value,
    password: passwordInput.value
  });

  if (error) {
    statusText.textContent = `❌ ${error.message}`;
    console.error(error);
  } else {
    statusText.textContent = `✅ Logged in as ${data.user.email}`;
    signupBtn.style.display = loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline';
  }
});

// --- LOG OUT ---
logoutBtn.addEventListener('click', async () => {
  await supabase.auth.signOut();
  statusText.textContent = 'Logged out.';
  signupBtn.style.display = loginBtn.style.display = 'inline';
  logoutBtn.style.display = 'none';
});
