import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { Menu, User, ShoppingBag, LogOut, LayoutDashboard, Coins, Utensils, Package, CreditCard, Home as HomeIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const location = useLocation();
  const { currentUser, signOut, isAdmin, isDeliveryPartner } = useAuth();
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = isAdmin 
    ? [
        {
          name: "Home",
          href: "/",
          icon: HomeIcon,
        },
        {
          name: "Dashboard",
          href: "/admin",
          icon: LayoutDashboard,
        },
      ]
    : isDeliveryPartner
    ? [
        {
          name: "Home",
          href: "/",
          icon: HomeIcon,
        }
      ]
    : currentUser
    ? [
        {
          name: "Home",
          href: "/",
          icon: HomeIcon,
        },
        {
          name: "Menu",
          href: "/menu",
          icon: Utensils,
        },
        {
          name: "Orders",
          href: "/orders",
          icon: Package,
        },
        {
          name: "Tokens",
          href: "/tokens",
          icon: Coins,
        },
        {
          name: "Subscription",
          href: "/subscription",
          icon: CreditCard,
        },
      ]
    : [
        {
          name: "Home",
          href: "/",
          icon: HomeIcon,
        },
        {
          name: "Menu",
          href: "/menu",
          icon: Utensils,
        },
        {
          name: "Orders",
          href: "/orders",
          icon: Package,
        },
        {
          name: "Subscription",
          href: "/subscription",
          icon: CreditCard,
        },
      ];

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to={isAdmin ? "/admin" : isDeliveryPartner ? "/delivery" : "/"} className="flex items-center">
            {/* <img src="/logo.png" alt="Campus Kitchen" className="h-8 w-auto" /> */}
            <span className="ml-2 text-xl font-bold">Campus <span className="text-campus-orange">Kitchen</span></span>
          </Link>

          {/* Desktop Navigation */}
          {!isDeliveryPartner && (
            <div className="hidden md:flex space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`font-medium hover:text-campus-green transition-colors flex flex-col items-center ${
                    location.pathname === item.href
                      ? "text-campus-green"
                      : "text-gray-700"
                  }`}
                >
                  <item.icon className="h-5 w-5 mb-1" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Right side - Auth & Cart */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Cart Button - Only show for non-admin and non-delivery users */}
            {!isDeliveryPartner && !isAdmin && (
              <Link to="/cart" className="relative">
                <Button variant="outline" size="icon">
                  <ShoppingBag size={20} />
                  {totalItems > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-campus-orange text-white">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            {/* Auth */}
            {currentUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.displayName || "User"} />
                      <AvatarFallback>
                        {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {currentUser.displayName || currentUser.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {!isDeliveryPartner && !isAdmin && currentUser && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/tokens" className="flex items-center">
                          <Coins className="h-4 w-4 mr-2" />
                          My Tokens
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/orders" className="flex items-center">
                          <Package className="h-4 w-4 mr-2" />
                          My Orders
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/subscription" className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Subscription
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem onClick={signOut} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="default" className="bg-campus-green hover:bg-campus-green/90">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center space-x-3">
            {/* Cart Button (Mobile) - Only show for non-admin and non-delivery users */}
            {!isDeliveryPartner && !isAdmin && (
              <Link to="/cart" className="relative">
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <ShoppingBag size={18} />
                  {totalItems > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-campus-orange text-white text-xs">
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}
            
            {/* Mobile Menu Trigger */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Menu size={18} />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[300px]">
                <div className="flex flex-col h-full">
                  <div className="flex-grow py-6">
                    <div className="flex flex-col space-y-4">
                      {navItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          onClick={closeMobileMenu}
                          className={`text-lg font-medium py-2 hover:text-campus-green transition-colors flex items-center ${
                            location.pathname === item.href
                              ? "text-campus-green"
                              : "text-gray-700"
                          }`}
                        >
                          <item.icon className="h-5 w-5 mr-2" />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="py-6 border-t border-gray-200">
                    {currentUser ? (
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarImage src={currentUser.photoURL || undefined} />
                            <AvatarFallback>
                              {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{currentUser.displayName || currentUser.email}</p>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start" 
                          onClick={() => {
                            signOut();
                            closeMobileMenu();
                          }}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </Button>
                      </div>
                    ) : (
                      <Link to="/auth" onClick={closeMobileMenu}>
                        <Button className="w-full bg-campus-green hover:bg-campus-green/90">
                          Sign In
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
