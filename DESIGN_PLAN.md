# Modern UI/UX Design Plan for Tic-Tac-Toe

This document outlines a plan to modernize the visual design of the Phaser Tic-Tac-Toe game, focusing on a cleaner, more engaging user experience.

## 1. Global Styles & Theme

- [x] **Color Palette:**
    - [x] **Primary Background:** A soft off-white (`#F8F9FA`) or a light gray (`#E9ECEF`).
    - [x] **Primary Text:** A dark charcoal color (`#212529`).
    - [x] **Accent/Primary Action Color:** A vibrant blue (`#007BFF`).
    - [x] **Secondary Action Color:** A friendly green (`#28a745`).
    - [x] **Winning/Alert Color:** A clear red/pink (`#DC3545`).
- [x] **Typography:**
    - [x] Use a modern, sans-serif font from Google Fonts (e.g., 'Poppins').
    - [x] Apply this font to all HTML elements.
- [x] **Layout:**
    - [x] Center the entire experience on the page.

## 2. Game Setup Screen (`index.html`)

- [x] **Layout:**
    - [x] Style `div#setupForm` as a "card" with a light background, rounded corners, and a box shadow.
    - [x] Use Flexbox to center the card's content.
- [x] **Header:**
    - [x] Add an `<h1>` title like "Game Setup".
- [x] **Player Configuration Sections:**
    - [x] Group each player's controls into their own `div`.
    - [x] Use Flexbox for side-by-side layout on larger screens and stacked on smaller screens (media queries).
- [x] **Form Elements:**
    - [x] **Text Inputs:** Apply modern, custom styles.
    - [x] **Symbol Selects:**
        - [x] Apply modern, custom styles to `<select>` elements.
        - [x] Style the `option[disabled]` state to be visually clear.
    - [x] **Color Pickers:** Apply modern, custom styles.
- [x] **Start Game Button:**
    - [x] Make the button larger and more prominent.
    - [x] Add hover and active states for better interactivity.

## 3. Game Board Scene (Phaser)

- [x] **Board & Cells:**
    - [x] Soften the cell stroke color.
    - [x] Add a hover effect to cells.
- [x] **Buttons:**
    - [x] Style "New Round" and "New Game" buttons to match the CSS buttons.
- [x] **Text:**
    - [x] Ensure all Phaser text objects use the chosen modern font.
    - [x] Make the status text larger and more prominent.
- [x] **Winning Line:**
    - [x] Animate the winning line using a Phaser tween.

This plan aims to create a cohesive and modern look and feel, improving the user's overall experience from setup to gameplay. 