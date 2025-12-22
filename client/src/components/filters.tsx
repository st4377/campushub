import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { CATEGORIES, PLATFORMS } from "@/lib/mock-data";
import { Globe, User, RotateCcw } from "lucide-react";

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public", icon: Globe },
  { value: "boys-only", label: "Boys Only", icon: User },
  { value: "girls-only", label: "Girls Only", icon: User },
];

export interface FilterState {
  visibility: string[];
  platforms: string[];
  categories: string[];
}

interface FiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
}

export function Filters({ filters, onFilterChange, onReset }: FiltersProps) {
  const handleVisibilityChange = (value: string, checked: boolean) => {
    const newVisibility = checked
      ? [...filters.visibility, value]
      : filters.visibility.filter((v) => v !== value);
    onFilterChange({ ...filters, visibility: newVisibility });
  };

  const handlePlatformChange = (platform: string, checked: boolean) => {
    const newPlatforms = checked
      ? [...filters.platforms, platform]
      : filters.platforms.filter((p) => p !== platform);
    onFilterChange({ ...filters, platforms: newPlatforms });
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...filters.categories, category]
      : filters.categories.filter((c) => c !== category);
    onFilterChange({ ...filters, categories: newCategories });
  };

  const hasActiveFilters = 
    filters.visibility.length > 0 || 
    filters.platforms.length > 0 || 
    filters.categories.length > 0;

  return (
    <div className="space-y-8">
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onReset}
          className="w-full border-[#FFC400]/30 text-[#FFC400] hover:bg-[#FFC400]/10 hover:text-[#FFC400] hover:border-[#FFC400] uppercase tracking-wider font-bold"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset Filters
        </Button>
      )}

      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#FFC400] mb-5 flex items-center before:w-2 before:h-2 before:bg-[#FFC400] before:mr-2">Visibility</h3>
        <div className="space-y-3 pl-2">
          {VISIBILITY_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isChecked = filters.visibility.includes(option.value);
            return (
              <div key={option.value} className="flex items-center space-x-3 group cursor-pointer">
                <Checkbox 
                  id={`visibility-${option.value}`} 
                  checked={isChecked}
                  onCheckedChange={(checked) => handleVisibilityChange(option.value, checked as boolean)}
                  className="border-[#333] data-[state=checked]:bg-[#FFC400] data-[state=checked]:text-black data-[state=checked]:border-[#FFC400] rounded h-4 w-4" 
                />
                <Label 
                  htmlFor={`visibility-${option.value}`} 
                  className={`text-sm font-bold uppercase tracking-wide peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-colors cursor-pointer flex items-center gap-2 ${isChecked ? 'text-[#FFC400]' : 'text-gray-400 group-hover:text-white'}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {option.label}
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      <Separator className="bg-[#222]" />

      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#FFC400] mb-5 flex items-center before:w-2 before:h-2 before:bg-[#FFC400] before:mr-2">Platform</h3>
        <div className="space-y-3 pl-2">
          {PLATFORMS.map((platform) => {
            const isChecked = filters.platforms.includes(platform);
            return (
              <div key={platform} className="flex items-center space-x-3 group cursor-pointer">
                <Checkbox 
                  id={`platform-${platform}`} 
                  checked={isChecked}
                  onCheckedChange={(checked) => handlePlatformChange(platform, checked as boolean)}
                  className="border-[#333] data-[state=checked]:bg-[#FFC400] data-[state=checked]:text-black data-[state=checked]:border-[#FFC400] rounded h-4 w-4" 
                />
                <Label 
                  htmlFor={`platform-${platform}`} 
                  className={`text-sm font-bold uppercase tracking-wide peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-colors cursor-pointer ${isChecked ? 'text-[#FFC400]' : 'text-gray-400 group-hover:text-white'}`}
                >
                  {platform}
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      <Separator className="bg-[#222]" />

      <Accordion type="single" collapsible defaultValue="categories" className="w-full">
        <AccordionItem value="categories" className="border-0">
          <AccordionTrigger className="text-xs font-bold uppercase tracking-widest text-[#FFC400] py-2 hover:no-underline hover:text-white flex items-center before:w-2 before:h-2 before:bg-[#FFC400] before:mr-2">
            Categories
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-4 pl-2">
              {CATEGORIES.map((category) => {
                const isChecked = filters.categories.includes(category);
                return (
                  <div key={category} className="flex items-center space-x-3 group cursor-pointer">
                    <Checkbox 
                      id={`category-${category}`} 
                      checked={isChecked}
                      onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                      className="border-[#333] data-[state=checked]:bg-[#FFC400] data-[state=checked]:text-black data-[state=checked]:border-[#FFC400] rounded h-4 w-4" 
                    />
                    <Label 
                      htmlFor={`category-${category}`} 
                      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-colors cursor-pointer ${isChecked ? 'text-[#FFC400]' : 'text-gray-400 group-hover:text-white'}`}
                    >
                      {category}
                    </Label>
                  </div>
                );
              })}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
