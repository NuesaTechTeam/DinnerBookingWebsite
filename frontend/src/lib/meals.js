// Meal options per ticket tier. Keep in sync with the backend copy at
// backend/utils/meals.js
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

export const getMealOptions = (type) =>
  MEAL_OPTIONS[String(type || "").toUpperCase()] || MEAL_OPTIONS.REGULAR;
