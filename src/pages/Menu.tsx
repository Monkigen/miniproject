import React, { useState } from "react";
import MenuCard from "@/components/MenuCard";
import CategoryTabs from "@/components/CategoryTabs";

export interface MealDay {
  day: string;
  image: string;
}

export interface MealPlan {
  id: string;
  title: string;
  type: string;
  description: string;
  images: { url: string }[];
  days: MealDay[];
  isLocked?: boolean;
}

const mealPlans: MealPlan[] = [
  {
    id: "breakfast-premium",
    title: "Breakfast Special",
    type: "Breakfast",
    description: "Start your day with our nutritious breakfast special including idli, dosa, vada, and sambar.",
    images: [
      { url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=500" }
    ],
    days: [
      { day: "MON", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=500" },
      { day: "TUE", image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=500" },
      { day: "WED", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=500" },
      { day: "THU", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=500" },
      { day: "FRI", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=500" },
      { day: "SAT", image: "https://images.unsplash.com/photo-1551326844-4df70f78d0e9?q=80&w=500" }
    ],
    isLocked: true
  },
  {
    id: "lunch-premium",
    title: "Lunch Combo",
    type: "Lunch",
    description: "A complete meal with rice, curry, dal, roti, and a variety of side dishes.",
    images: [
      { url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=500" }
    ],
    days: [
      { day: "MON", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=500" },
      { day: "TUE", image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?q=80&w=500" },
      { day: "WED", image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=500" },
      { day: "THU", image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=500" },
      { day: "FRI", image: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?q=80&w=500" },
      { day: "SAT", image: "https://images.unsplash.com/photo-1551326844-4df70f78d0e9?q=80&w=500" }
    ],
    isLocked: false
  },
  {
    id: "breakfast-special",
    title: "North Indian Breakfast",
    type: "Breakfast",
    description: "Enjoy a hearty North Indian breakfast with paratha, sabzi, and lassi.",
    images: [
      { url: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&auto=format&fit=crop&q=60" }
    ],
    days: [
      { day: "MON", image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&auto=format&fit=crop&q=60" },
      { day: "TUE", image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&auto=format&fit=crop&q=60" },
      { day: "WED", image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&auto=format&fit=crop&q=60" },
      { day: "THU", image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&auto=format&fit=crop&q=60" },
      { day: "FRI", image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&auto=format&fit=crop&q=60" },
      { day: "SAT", image: "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&auto=format&fit=crop&q=60" }
    ]
  },
  {
    id: "lunch-special",
    title: "South Indian Lunch",
    type: "Lunch",
    description: "Traditional South Indian lunch with rice, sambar, rasam, and a variety of curries.",
    images: [
      { url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60" }
    ],
    days: [
      { day: "MON", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60" },
      { day: "TUE", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60" },
      { day: "WED", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60" },
      { day: "THU", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60" },
      { day: "FRI", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60" },
      { day: "SAT", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=60" }
    ]
  }
];

const Menu = () => {
  const [activeCategory, setActiveCategory] = useState("Breakfast");
  const [filterLoading, setFilterLoading] = useState(false);
  
  // Define the meal plan categories
  const categories = ["Breakfast", "Lunch"];

  // Handle category changes with loading state
  const handleCategoryChange = (category: string) => {
    setFilterLoading(true);
    setActiveCategory(category);
    // Simulate a small delay to show loading state
    setTimeout(() => setFilterLoading(false), 300);
  };

  // Filter plans by category with memoization
  const filteredPlans = React.useMemo(() => {
    if (!activeCategory) return mealPlans;
    return mealPlans.filter(plan => plan.type === activeCategory);
  }, [activeCategory]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Our Menu</h1>
      
      {/* Category Tabs */}
      <CategoryTabs 
        categories={categories} 
        activeCategory={activeCategory} 
        onChange={handleCategoryChange}
        disabled={filterLoading}
      />

      {/* Meal Plans Grid */}
      {filterLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-48 rounded-lg mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {filteredPlans.map(plan => (
          <MenuCard key={plan.id} plan={plan} />
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">No meal plans found in this category.</p>
        </div>
          )}
        </>
      )}
    </div>
  );
};

export default Menu;
