import { useState, useEffect } from "react";
import { Plus, Minus, ShoppingCart } from "lucide-react";
import { getFoodItems, type FoodItem, type FoodOrderItem } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

interface FoodMenuProps {
  selectedItems: FoodOrderItem[];
  onSelectionChange: (items: FoodOrderItem[]) => void;
}

const FoodMenu = ({ selectedItems, onSelectionChange }: FoodMenuProps) => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<"snacks" | "drinks" | "combos">("snacks");
  const { toast } = useToast();

  useEffect(() => {
    loadFoodItems();
  }, []);

  const loadFoodItems = async () => {
    try {
      const items = await getFoodItems();
      setFoodItems(items);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load food menu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: "snacks" as const, label: "Snacks", icon: "🍿" },
    { id: "drinks" as const, label: "Drinks", icon: "🥤" },
    { id: "combos" as const, label: "Combos", icon: "🎬" },
  ];

  const filteredItems = foodItems.filter(item => item.category === activeCategory);

  const getItemQuantity = (itemId: string) => {
    const item = selectedItems.find(item => item.itemId === itemId);
    return item ? item.quantity : 0;
  };

  const updateQuantity = (foodItem: FoodItem, newQuantity: number) => {
    const existingItems = selectedItems.filter(item => item.itemId !== foodItem._id);
    
    if (newQuantity > 0) {
      const newItem: FoodOrderItem = {
        itemId: foodItem._id,
        quantity: newQuantity,
        price: foodItem.price * newQuantity
      };
      onSelectionChange([...existingItems, newItem]);
    } else {
      onSelectionChange(existingItems);
    }
  };

  const totalItems = selectedItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = selectedItems.reduce((sum, item) => sum + item.price, 0);

  if (loading) {
    return (
      <div className="bg-card rounded-2xl p-6 border border-border">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 border border-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground">Pre-order Snacks</h3>
        {totalItems > 0 && (
          <div className="flex items-center gap-2 text-cinema-red">
            <ShoppingCart className="w-5 h-5" />
            <span className="font-medium">{totalItems} items • ${totalPrice.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Category Tabs */}
      <div className="flex space-x-1 mb-6 bg-muted p-1 rounded-lg">
        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeCategory === category.id
                ? "bg-background text-foreground shadow-sm"
                : "text-foreground-secondary hover:text-foreground"
            }`}
          >
            <span className="mr-2">{category.icon}</span>
            {category.label}
          </button>
        ))}
      </div>

      {/* Food Items */}
      <div className="space-y-3">
        {filteredItems.length === 0 ? (
          <p className="text-center text-foreground-secondary py-8">
            No {activeCategory} available
          </p>
        ) : (
          filteredItems.map(item => {
            const quantity = getItemQuantity(item._id);
            return (
              <div key={item._id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.src = "/food/placeholder.jpg";
                    }}
                  />
                  <div>
                    <h4 className="font-medium text-foreground">{item.name}</h4>
                    <p className="text-sm text-foreground-secondary">{item.description}</p>
                    <p className="text-sm font-medium text-cinema-red">${item.price.toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(item, Math.max(0, quantity - 1))}
                    disabled={quantity === 0}
                    className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  
                  <span className="w-8 text-center font-medium text-foreground">
                    {quantity}
                  </span>
                  
                  <button
                    onClick={() => updateQuantity(item, quantity + 1)}
                    className="w-8 h-8 rounded-full bg-cinema-red text-white flex items-center justify-center hover:bg-cinema-red/90"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {totalItems > 0 && (
        <div className="mt-6 p-4 bg-cinema-red/10 rounded-lg border border-cinema-red/20">
          <p className="text-sm text-foreground-secondary mb-1">
            Items will be ready for pickup at the concession counter before your movie starts.
          </p>
          <p className="text-xs text-foreground-secondary">
            Show your booking confirmation to collect your order.
          </p>
        </div>
      )}
    </div>
  );
};

export default FoodMenu;