import { useState } from "react";
import { Search, ChevronDown, ChevronRight, Layout, CheckCircle, FileText, Share2, CreditCard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { FAQ_CATEGORIES, MOCK_FAQ, searchFAQ, getFAQByCategory, FAQCategory, FAQItem } from "@/data/mockSupport";

const CATEGORY_ICONS: Record<FAQCategory, React.ComponentType<{ className?: string }>> = {
  platform: Layout,
  validation: CheckCircle,
  editorial: FileText,
  social: Share2,
  billing: CreditCard,
};

export function FAQSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<FAQCategory | null>(null);
  
  const filteredFAQ = searchQuery 
    ? searchFAQ(searchQuery)
    : selectedCategory 
      ? getFAQByCategory(selectedCategory)
      : MOCK_FAQ;

  const groupedFAQ = filteredFAQ.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<FAQCategory, FAQItem[]>);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher dans la FAQ..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2">
        <Badge
          variant={selectedCategory === null ? "default" : "outline"}
          className="cursor-pointer hover:bg-primary/90"
          onClick={() => setSelectedCategory(null)}
        >
          Toutes les catégories
        </Badge>
        {(Object.keys(FAQ_CATEGORIES) as FAQCategory[]).map((category) => {
          const Icon = CATEGORY_ICONS[category];
          return (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/10 flex items-center gap-1"
              onClick={() => setSelectedCategory(category)}
            >
              <Icon className="h-3 w-3" />
              {FAQ_CATEGORIES[category].label}
            </Badge>
          );
        })}
      </div>

      {/* FAQ Items */}
      {Object.entries(groupedFAQ).length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Aucun résultat pour "{searchQuery}"
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Essayez avec d'autres termes ou contactez votre CM
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {(Object.entries(groupedFAQ) as [FAQCategory, FAQItem[]][]).map(([category, items]) => {
            const Icon = CATEGORY_ICONS[category];
            return (
              <Card key={category}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-medium">{FAQ_CATEGORIES[category].label}</h3>
                    <Badge variant="secondary" className="ml-auto">
                      {items.length}
                    </Badge>
                  </div>
                  
                  <Accordion type="single" collapsible className="space-y-1">
                    {items.map((item) => (
                      <AccordionItem 
                        key={item.id} 
                        value={item.id}
                        className="border-0 bg-muted/30 rounded-lg px-3"
                      >
                        <AccordionTrigger className="text-sm text-left hover:no-underline py-3">
                          {item.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-sm text-muted-foreground pb-3">
                          {item.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
