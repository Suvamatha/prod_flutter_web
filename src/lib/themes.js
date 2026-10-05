/**
 * Visual themes for preview artwork (project card thumbnails + screen picker).
 * In production, thumbnails come from screenshots captured by the build
 * pipeline (`project.previewImageUrl`); this artwork is the fallback.
 */
export const THEMES = {
  uzina: {
    accent: '#0F766E', soft: '#E3F4F1', surface: '#F5F6F4', tint: '#EAF3F0',
    greeting: 'Good morning, Amina', headline: 'Find your next home',
    hero: { title: 'Modern Villa, Kilimani', meta: '4 bd · 3 ba · 320 m²', tag: 'KSh 45M' },
    items: [
      { title: 'Garden Apartment', meta: 'Westlands', tag: 'KSh 18.5M' },
      { title: 'Lake View Townhouse', meta: 'Naivasha', tag: 'KSh 27M' },
      { title: 'Studio Loft', meta: 'Kilimani', tag: 'KSh 85K/mo' },
      { title: 'Family Bungalow', meta: 'Karen', tag: 'KSh 62M' },
    ],
    images: [['#D8C6A9', '#7B654C'], ['#A9C2B6', '#3F6357'], ['#E0CDBE', '#93705B'], ['#BCC8D6', '#4E637C']],
    chips: ['Buy', 'Rent', 'Villas', 'Land'], cta: 'Book a viewing',
    screens: [['home', '/', 'Home'], ['properties', '/explore', 'Properties'], ['details', '/details', 'Details'], ['profile', '/profile', 'Profile']],
  },
  wellness: {
    accent: '#D9467A', soft: '#FCE8F0', surface: '#FFF8FA', tint: '#FCEEF3',
    greeting: 'Hi, Sarah', headline: 'Day 14 of your cycle',
    hero: { title: 'Ovulation window', meta: 'High energy · Fertile days', tag: 'Day 14' },
    items: [
      { title: 'Mood check-in', meta: 'Logged · Calm', tag: '😌' },
      { title: 'Sleep', meta: 'Last night', tag: '7h 40m' },
      { title: 'Hydration', meta: '6 of 8 glasses', tag: '75%' },
      { title: 'Gentle yoga flow', meta: '20 min', tag: 'New' },
    ],
    images: [['#F6C3D3', '#C9577F'], ['#F8D9C4', '#D98A63'], ['#D9CCF5', '#7E64C4'], ['#C9E7DD', '#4E9D86']],
    chips: ['Cycle', 'Mood', 'Sleep', 'Food'], cta: 'Log today',
    screens: [['today', '/', 'Today'], ['cycle', '/explore', 'Cycle'], ['insights', '/details', 'Insights'], ['profile', '/profile', 'Profile']],
  },
  medical: {
    accent: '#2563EB', soft: '#E5EEFF', surface: '#F6F8FC', tint: '#EAF0FB',
    greeting: 'Dr. Patel', headline: '12 reports to review',
    hero: { title: 'Complete Blood Count', meta: 'Ravi K. · Today, 09:20', tag: 'Ready' },
    items: [
      { title: 'Lipid Panel', meta: 'Maya S. · Reviewed', tag: 'Normal' },
      { title: 'Chest X-Ray', meta: 'John D. · Pending', tag: 'Urgent' },
      { title: 'Thyroid Profile', meta: 'Anita R. · Reviewed', tag: 'Normal' },
      { title: 'MRI Brain', meta: 'Leo M. · Processing', tag: 'Pending' },
    ],
    images: [['#C8D8F7', '#3E67C9'], ['#CFE6F2', '#3A86A8'], ['#D7DCEA', '#5B6787'], ['#CDEBE3', '#3D8F7A']],
    chips: ['All', 'Pending', 'Reviewed', 'Urgent'], cta: 'Share report',
    screens: [['dashboard', '/', 'Dashboard'], ['reports', '/explore', 'Reports'], ['report', '/details', 'Report'], ['profile', '/profile', 'Profile']],
  },
  finance: {
    accent: '#4F46E5', soft: '#ECEBFF', surface: '#F7F7FB', tint: '#EEEDFB',
    greeting: 'Welcome back, Kiran', headline: '$12,480.20',
    hero: { title: 'Total balance', meta: '+4.2% this month', tag: '$12,480' },
    items: [
      { title: 'Salary', meta: 'Today · Income', tag: '+$4,200' },
      { title: 'Groceries', meta: 'Yesterday · Food', tag: '−$86.40' },
      { title: 'Spotify', meta: 'Sep 28 · Subscriptions', tag: '−$9.99' },
      { title: 'Coffee Lab', meta: 'Sep 27 · Food', tag: '−$4.50' },
    ],
    images: [['#C9C5FA', '#4F46E5'], ['#C6EBD6', '#1F9D5C'], ['#F7D9B8', '#D98327'], ['#D6D9E0', '#5B6375']],
    chips: ['Week', 'Month', 'Year', 'All'], cta: 'Send money',
    screens: [['overview', '/', 'Overview'], ['transactions', '/explore', 'Transactions'], ['budget', '/details', 'Budget'], ['account', '/profile', 'Account']],
  },
  foodie: {
    accent: '#EA580C', soft: '#FFEEE3', surface: '#FFF9F5', tint: '#FDF0E7',
    greeting: 'Hungry, Leo?', headline: 'Great food near you',
    hero: { title: 'Sora Ramen House', meta: 'Japanese · 1.2 km', tag: '4.8 ★' },
    items: [
      { title: 'Trattoria Nonna', meta: 'Italian · 0.8 km', tag: '4.7 ★' },
      { title: 'Green Bowl', meta: 'Vegan · 1.5 km', tag: '4.6 ★' },
      { title: 'Taco Libre', meta: 'Mexican · 2.1 km', tag: '4.5 ★' },
      { title: 'Le Petit Café', meta: 'French · 0.4 km', tag: '4.9 ★' },
    ],
    images: [['#F5C9A3', '#C2541C'], ['#F3DEA0', '#B8862A'], ['#CDE5B5', '#5D8F33'], ['#EFC2B5', '#A9473A']],
    chips: ['Nearby', 'Top rated', 'Vegan', 'Open now'], cta: 'Reserve a table',
    screens: [['discover', '/', 'Discover'], ['explore', '/explore', 'Explore'], ['restaurant', '/details', 'Restaurant'], ['profile', '/profile', 'Profile']],
  },
  default: {
    accent: '#1A5CF5', soft: '#E7EFFF', surface: '#F7F8FA', tint: '#EDF1F8',
    greeting: 'Welcome', headline: 'Your Flutter app',
    hero: { title: 'Featured', meta: 'Tap to explore', tag: 'New' },
    items: [
      { title: 'Getting started', meta: 'Onboarding', tag: '1' },
      { title: 'Components', meta: 'Material 3', tag: '24' },
      { title: 'Settings', meta: 'Preferences', tag: '›' },
      { title: 'About', meta: 'Version 1.0.0', tag: '›' },
    ],
    images: [['#C7D7FB', '#1A5CF5'], ['#CDE8F5', '#1C86B8'], ['#DCD3F7', '#6A4FD1'], ['#D3E9DE', '#2F8A63']],
    chips: ['All', 'Popular', 'Recent', 'Saved'], cta: 'Get started',
    screens: [['home', '/', 'Home'], ['explore', '/explore', 'Explore'], ['details', '/details', 'Details'], ['profile', '/profile', 'Profile']],
  },
}

export const getTheme = (key) => THEMES[key] || THEMES.default

export const screensFor = (key) =>
  getTheme(key).screens.map(([id, route, name]) => ({ id, route, name, kind: route }))

/** Picks a theme for a newly analyzed repository (mock heuristic). */
export function guessTheme(text = '') {
  const s = text.toLowerCase()
  const w = s.split(/[^a-z0-9]+/)
  const has = (re) => w.some((x) => re.test(x))
  if (has(/^(estate|real|property|properties|house|housing|rent|rental|uzina)$/)) return 'uzina'
  if (has(/^(wellness|health|cycle|fitness|fit|yoga|period|habit|habits)$/)) return 'wellness'
  if (has(/^(medical|medic|reports?|clinic|patients?|lab|doctor)$/)) return 'medical'
  if (has(/^(finance|financial|money|budget|bank|banking|wallet|expenses?)$/)) return 'finance'
  if (has(/^(food|foodie|restaurants?|recipes?|eat|eats|delivery|cafe)$/)) return 'foodie'
  return 'default'
}
