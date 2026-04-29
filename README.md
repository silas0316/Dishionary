# Dishionary

**Understand the meals from all around the world.**

Dishionary is a mobile-friendly web app that translates restaurant menu photos. Snap a picture of a menu in any language, and it tells you what each dish is, what's in it, and flags anything you're allergic to.

🔗 **Live site:** https://silas0316.github.io/Dishionary/

---

## What it does

1. **Tell it your allergens** — milk, eggs, peanuts, shellfish, etc.
2. **Take or upload photos** of a menu (up to 5 photos)
3. **Get back a translated menu** with:
   - Original dish name + English translation
   - Description of what the dish is
   - Ingredients
   - ⚠️ Allergen warnings highlighted in red
   - Diet tags (vegetarian, vegan, halal, kosher, "no pork", etc.)
   - Cooking method (grilled, fried, steamed, etc.)
   - A "show this to the waiter" cart in the original language

---

## How to use it

### 1. Get a free Gemini API key

Dishionary uses Google's Gemini AI to read and translate menus. The app asks each user to bring their own key so no one shares costs.

1. Go to **https://aistudio.google.com/apikey**
2. Sign in with a Google account
3. Click **"Create API key"**
4. Copy the key (it starts with `AIza...`)

The free tier is generous — plenty for personal use.

### 2. Open the app

Visit **https://silas0316.github.io/Dishionary/** on your phone or laptop.

### 3. Paste your key and tap Start

Your key is saved only in your own browser (localStorage). It is never sent to any server other than Google's.

### 4. Use the app

- Pick your allergens
- Take a photo of the menu, or upload one from your camera roll
- Tap **Translate the Menu**
- Wait ~10–30 seconds while it reads, translates, and analyzes

---

## Privacy

- Your API key stays in your browser. Anyone you share the link with brings their own key.
- Photos are sent directly from your browser to Google's Gemini API. They are not stored anywhere by this app.
- No analytics, no tracking, no backend server.

---

## Tech stack

- React + TypeScript + Vite
- Google Gemini API (`gemini-2.5-flash`)
- Hosted on GitHub Pages
- Mobile-first design (optimized for iPhone-sized screens)

---

## Team

A team project by:

- Tiyasha Banerjee
- Zhan Lou
- Chia-Le Luan
- Ying Zhong (backend)

With guidance from **Professor Francesco Cafaro**.

---

## Built with

Designed in Figma, built with [Claude Code](https://claude.com/claude-code).
