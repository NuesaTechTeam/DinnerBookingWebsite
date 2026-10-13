// Meal options per ticket tier. Keep in sync with the frontend copy at
// frontend/src/lib/meals.js
export const MEAL_OPTIONS = {
  REGULAR: [
    "Rice and Chicken",
    "Amala (basic) with Ponmo and Beef",
  ],
  VIP: [
    "Rice + Large Chicken + Plantain + Cake",
    "Ofada Rice + Chicken + Cake",
    "Amala (large) with Ponmo, Beef and Assorted Meats + Cake",
  ],
  VVIP: [
    "Rice + Large Chicken + Plantain + Moi Moi + Coleslaw + Cake + Dessert",
    "Ofada Rice + Large Chicken + Moi Moi + Coleslaw + Cake + Dessert",
    "Amala (large) with Beef, Fish, Ponmo and Assorted Goat Meat",
  ],
};

// Ranks above VVIP for completeness, but the site only sells REGULAR/VIP/VVIP.
export const getMealOptions = (type) =>
  MEAL_OPTIONS[String(type || "").toUpperCase()] || MEAL_OPTIONS.REGULAR;
