import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string;
  onChange: (category: string) => void;
  disabled?: boolean;
}

const CategoryTabs: React.FC<CategoryTabsProps> = ({ 
  categories, 
  activeCategory, 
  onChange,
  disabled = false
}) => {
  const handleChange = (value: string) => {
    if (!disabled) {
      onChange(value);
    }
  };

  return (
    <Tabs value={activeCategory} onValueChange={handleChange} className="w-full">
      <TabsList className="flex w-full justify-center gap-4 pb-2 mb-6 scrollbar-hide">
        {categories.map((category) => (
          <TabsTrigger 
            key={category} 
            value={category}
            disabled={disabled}
            className={`rounded-full px-8 py-2 text-base font-medium ${
              activeCategory === category 
                ? "bg-campus-green text-white" 
                : "border-2 border-campus-green text-campus-green"
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {category}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};

export default CategoryTabs;
