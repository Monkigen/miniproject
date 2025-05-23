import React, { useState } from "react";
import MenuCard from "@/components/MenuCard";
import CategoryTabs from "@/components/CategoryTabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Utensils } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
  // Breakfast Items
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
    ]
  },
  {
    id: "breakfast-north",
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
    id: "breakfast-continental",
    title: "Continental Breakfast",
    type: "Breakfast",
    description: "Classic continental breakfast with eggs, toast, bacon, and fresh fruits.",
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
    id: "breakfast-healthy",
    title: "Healthy Breakfast Bowl",
    type: "Breakfast",
    description: "Nutritious breakfast bowl with oats, yogurt, nuts, and seasonal fruits.",
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
    id: "breakfast-sandwich",
    title: "Breakfast Sandwich",
    type: "Breakfast",
    description: "Hearty breakfast sandwich with eggs, cheese, and your choice of meat.",
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
    id: "breakfast-plain-dosa",
    title: "Plain Dosa",
    type: "Breakfast",
    description: "Crispy and thin South Indian crepe made from fermented rice and lentil batter. Prep time <15 mins, Cooking time <20 mins.",
    images: [
      { url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" }
    ],
    days: [
      { day: "MON", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "TUE", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "WED", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "THU", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "FRI", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "SAT", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" }
    ]
  },
  {
    id: "breakfast-masala-dosa",
    title: "Masala Dosa",
    type: "Breakfast",
    description: "Crispy dosa filled with spiced potato filling. Prep time <15 mins, Cooking time <20 mins.",
    images: [
      { url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" }
    ],
    days: [
      { day: "MON", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "TUE", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "WED", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "THU", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "FRI", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "SAT", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" }
    ]
  },
  {
    id: "breakfast-rava-dosa",
    title: "Rava Dosa",
    type: "Breakfast",
    description: "Crispy dosa made with semolina and rice flour. Prep time <15 mins, Cooking time <20 mins.",
    images: [
      { url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" }
    ],
    days: [
      { day: "MON", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "TUE", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "WED", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "THU", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "FRI", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "SAT", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" }
    ]
  },
  {
    id: "breakfast-wheat-dosa",
    title: "Gothuma / Wheat Dosa",
    type: "Breakfast",
    description: "Healthy dosa made with whole wheat flour. Prep time <15 mins, Cooking time <20 mins.",
    images: [
      { url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" }
    ],
    days: [
      { day: "MON", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "TUE", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "WED", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "THU", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "FRI", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "SAT", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" }
    ]
  },
  {
    id: "breakfast-onion-uttappam",
    title: "Onion Uttappam",
    type: "Breakfast",
    description: "Thick and fluffy dosa topped with onions and spices. Prep time <15 mins, Cooking time <20 mins.",
    images: [
      { url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" }
    ],
    days: [
      { day: "MON", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "TUE", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "WED", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "THU", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "FRI", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "SAT", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" }
    ]
  },
  {
    id: "breakfast-oats-dosa",
    title: "Oats Dosa",
    type: "Breakfast",
    description: "Healthy dosa made with oats and rice flour. Prep time <15 mins, Cooking time <20 mins.",
    images: [
      { url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" }
    ],
    days: [
      { day: "MON", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "TUE", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "WED", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "THU", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "FRI", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "SAT", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" }
    ]
  },
  {
    id: "breakfast-masala-oats-dosa",
    title: "Masala Oats Dosa",
    type: "Breakfast",
    description: "Oats dosa filled with spiced potato filling. Prep time <15 mins, Cooking time <20 mins.",
    images: [
      { url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" }
    ],
    days: [
      { day: "MON", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "TUE", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "WED", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "THU", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "FRI", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "SAT", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" }
    ]
  },
  {
    id: "breakfast-spring-roll-dosa",
    title: "Vegetable Spring Roll Dosa",
    type: "Breakfast",
    description: "Dosa filled with stir-fried vegetables in spring roll style. Prep time <15 mins, Cooking time <20 mins.",
    images: [
      { url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" }
    ],
    days: [
      { day: "MON", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "TUE", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "WED", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "THU", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "FRI", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "SAT", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" }
    ]
  },
  {
    id: "breakfast-ragi-dosa",
    title: "Ragi Dosa",
    type: "Breakfast",
    description: "Nutritious dosa made with finger millet flour. Prep time <15 mins, Cooking time <20 mins.",
    images: [
      { url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" }
    ],
    days: [
      { day: "MON", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "TUE", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "WED", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "THU", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "FRI", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "SAT", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" }
    ]
  },
  {
    id: "breakfast-maida-dosa",
    title: "Maida Dosa",
    type: "Breakfast",
    description: "Crispy dosa made with all-purpose flour. Prep time <15 mins, Cooking time <20 mins.",
    images: [
      { url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" }
    ],
    days: [
      { day: "MON", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "TUE", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "WED", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "THU", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "FRI", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "SAT", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" }
    ]
  },
  {
    id: "breakfast-tomato-dosa",
    title: "Instant Tomato Dosa",
    type: "Breakfast",
    description: "Quick and easy dosa made with tomato and rice flour. Prep time <15 mins, Cooking time <20 mins.",
    images: [
      { url: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" }
    ],
    days: [
      { day: "MON", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "TUE", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "WED", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "THU", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "FRI", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" },
      { day: "SAT", image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&auto=format&fit=crop&q=60" }
    ]
  },

  // Lunch Items
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
    ]
  },
  {
    id: "lunch-south",
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
  },
  {
    id: "lunch-thali",
    title: "Special Thali",
    type: "Lunch",
    description: "Complete Indian thali with multiple curries, breads, rice, and desserts.",
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
  },
  {
    id: "lunch-biryani",
    title: "Hyderabadi Biryani",
    type: "Lunch",
    description: "Authentic Hyderabadi biryani with aromatic rice, tender meat, and special spices.",
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
  },
  {
    id: "lunch-healthy",
    title: "Healthy Lunch Bowl",
    type: "Lunch",
    description: "Nutritious lunch bowl with quinoa, grilled vegetables, and protein of your choice.",
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
  },
  {
    id: "lunch-veggie-burger",
    title: "Indian Spiced Veggie Burgers",
    type: "Lunch",
    description: "Flavorful vegetarian burgers made with Indian spices and fresh vegetables.",
    images: [
      { url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60" }
    ],
    days: [
      { day: "MON", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60" },
      { day: "TUE", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60" },
      { day: "WED", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60" },
      { day: "THU", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60" },
      { day: "FRI", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60" },
      { day: "SAT", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60" }
    ]
  },
  {
    id: "lunch-naan",
    title: "Naan (Indian Yeast Flatbread)",
    type: "Lunch",
    description: "Soft and fluffy leavened flatbread, perfect with curries and gravies.",
    images: [
      { url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=60" }
    ],
    days: [
      { day: "MON", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=60" },
      { day: "TUE", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=60" },
      { day: "WED", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=60" },
      { day: "THU", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=60" },
      { day: "FRI", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=60" },
      { day: "SAT", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=60" }
    ]
  },
  {
    id: "lunch-roti",
    title: "Roti (Indian Flatbread)",
    type: "Lunch",
    description: "Traditional unleavened whole wheat flatbread, healthy and nutritious.",
    images: [
      { url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=60" }
    ],
    days: [
      { day: "MON", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=60" },
      { day: "TUE", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=60" },
      { day: "WED", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=60" },
      { day: "THU", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=60" },
      { day: "FRI", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=60" },
      { day: "SAT", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=60" }
    ]
  },
  {
    id: "lunch-tandoori-burger",
    title: "Tandoori Chicken Burgers",
    type: "Lunch",
    description: "Spiced chicken patties with tandoori flavors, served in a bun with mint chutney.",
    images: [
      { url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60" }
    ],
    days: [
      { day: "MON", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60" },
      { day: "TUE", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60" },
      { day: "WED", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60" },
      { day: "THU", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60" },
      { day: "FRI", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60" },
      { day: "SAT", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=60" }
    ]
  },
  {
    id: "lunch-raita",
    title: "Raita (Indian Yogurt Condiments)",
    type: "Lunch",
    description: "Cooling yogurt-based condiment with cucumber, mint, and spices.",
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
  },
  {
    id: "lunch-butter-chicken",
    title: "Chicken Makhani (Butter Chicken Curry)",
    type: "Lunch",
    description: "Creamy tomato-based curry with tender chicken pieces, a North Indian classic.",
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
  },
  {
    id: "lunch-mango-chicken",
    title: "Mango Chicken Curry",
    type: "Lunch",
    description: "Sweet and tangy chicken curry with fresh mangoes and aromatic spices.",
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
  },
  {
    id: "lunch-masala-bhindi",
    title: "Masala Bhindi",
    type: "Lunch",
    description: "Spiced okra stir-fry with onions and aromatic spices.",
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
  },
  {
    id: "lunch-chana-kulcha",
    title: "Chana Kulcha",
    type: "Lunch",
    description: "Spiced chickpea curry served with soft kulcha bread.",
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
  },
  {
    id: "lunch-shahi-egg",
    title: "Shahi Egg Curry",
    type: "Lunch",
    description: "Rich and creamy egg curry with royal spices and cashew gravy.",
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
  },
  {
    id: "lunch-gujarati-kadhi",
    title: "Gujarati Kadhi",
    type: "Lunch",
    description: "Sweet and sour yogurt-based curry with gram flour dumplings.",
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
  },
  {
    id: "lunch-allahabad-tehri",
    title: "Allahabad Ki Tehri",
    type: "Lunch",
    description: "Traditional rice dish with vegetables and aromatic spices from Uttar Pradesh.",
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
  },
  {
    id: "lunch-dahi-chicken",
    title: "Low Fat Dahi Chicken",
    type: "Lunch",
    description: "Healthy yogurt-based chicken curry with minimal oil and maximum flavor.",
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
  },
  {
    id: "lunch-kolhapuri-veg",
    title: "Kolhapuri Vegetables",
    type: "Lunch",
    description: "Spicy mixed vegetable curry with authentic Kolhapuri masala.",
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
  },
  {
    id: "lunch-black-channa",
    title: "Black Channa and Coconut Stew",
    type: "Lunch",
    description: "Hearty black chickpea curry in a rich coconut-based gravy.",
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
  },
  {
    id: "lunch-spinach-paratha",
    title: "Stuffed Spinach Paratha",
    type: "Lunch",
    description: "Whole wheat flatbread stuffed with spiced spinach and paneer.",
    images: [
      { url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=60" }
    ],
    days: [
      { day: "MON", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=60" },
      { day: "TUE", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=60" },
      { day: "WED", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=60" },
      { day: "THU", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=60" },
      { day: "FRI", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=60" },
      { day: "SAT", image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&auto=format&fit=crop&q=60" }
    ]
  },
  {
    id: "lunch-masala-corn",
    title: "Masala Corn",
    type: "Lunch",
    description: "Spiced sweet corn with onions, tomatoes, and chaat masala.",
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
  },
  {
    id: "lunch-rava-idli",
    title: "Quick Rava Idli and Coconut Chutney",
    type: "Lunch",
    description: "Instant semolina idlis served with fresh coconut chutney.",
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
  },
  {
    id: "lunch-punjabi-dals",
    title: "Punjabi Dals",
    type: "Lunch",
    description: "Assortment of traditional Punjabi lentil preparations.",
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
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  
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

  const filteredMenu = React.useMemo(() => {
    if (!searchQuery) return filteredPlans;
    return filteredPlans.filter(plan =>
      plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [filteredPlans, searchQuery]);

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Menu</h1>
          <p className="text-sm sm:text-base text-gray-600">Browse our delicious meals</p>
        </div>
        <div className="w-full sm:w-auto">
          <Input
            type="search"
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-[300px]"
          />
        </div>
      </div>

      {/* Add CategoryTabs component */}
      <div className="mb-6">
        <CategoryTabs
          categories={categories}
          activeCategory={activeCategory}
          onCategoryChange={handleCategoryChange}
        />
      </div>

      {loading || filterLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredMenu.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8 sm:py-12">
            <Utensils className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mb-3 sm:mb-4" />
            <h2 className="text-lg sm:text-xl font-semibold mb-2">No items found</h2>
            <p className="text-sm sm:text-base text-gray-600 mb-4 text-center">
              {searchQuery ? "Try a different search term" : "No menu items available"}
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredMenu.map((item) => (
            <MenuCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Menu;
