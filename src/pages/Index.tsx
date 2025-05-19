import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, Clock, BadgeCheck, Star, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import FeedbackForm from "@/components/FeedbackForm";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

const Index = () => {
  const { currentUser } = useAuth();
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative hero-section text-white py-32 md:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-campus-green/90 to-campus-orange/90 z-10"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center mix-blend-overlay"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')"
          }}
        ></div>
        <div className="container mx-auto px-4 text-center relative z-20">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
            Campus<span className="text-campus-orange">Kitchen</span>
          </h1>
          <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-10 text-gray-100">
            Experience delicious, fresh meals delivered right to your dorm or campus location. 
            No more waiting in long cafeteria lines!
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/menu">
              <Button size="lg" className="bg-white text-campus-green hover:bg-gray-100 px-8 py-6 text-lg">
                Explore Our Menu
              </Button>
            </Link>
            {!currentUser && (
            <Link to="/auth">
                <Button size="lg" variant="outline" className="bg-transparent text-white border-2 border-white hover:bg-white/10 px-8 py-6 text-lg">
                Sign Up Now
              </Button>
            </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            Why Choose CampusBite?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="flex flex-col items-center text-center p-8 border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="bg-campus-green/10 p-4 rounded-full mb-6">
                <UtensilsCrossed size={40} className="text-campus-green" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Delicious Food</h3>
              <p className="text-gray-600">
                Our menu is crafted by professional chefs using fresh, quality ingredients for meals that satisfy.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="flex flex-col items-center text-center p-8 border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="bg-campus-orange/10 p-4 rounded-full mb-6">
                <Clock size={40} className="text-campus-orange" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Fast Delivery</h3>
              <p className="text-gray-600">
                Quick delivery to your dorm or anywhere on campus, so you can focus on what matters most.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="flex flex-col items-center text-center p-8 border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="bg-campus-yellow/10 p-4 rounded-full mb-6">
                <BadgeCheck size={40} className="text-campus-yellow" />
              </div>
              <h3 className="text-2xl font-semibold mb-4">Meal Plans</h3>
              <p className="text-gray-600">
                Save with our flexible meal subscription plans designed specifically for busy students.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">
            What Our Students Say
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feedback cards */}
            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold">Sarah Johnson</h4>
                    <p className="text-sm text-gray-500">Computer Science</p>
                  </div>
                  <div className="flex items-center">
                    <Star className="text-yellow-400" size={20} />
                    <span className="ml-1 font-semibold">5.0</span>
                  </div>
                </div>
                <p className="text-gray-600">
                  "The meal plans are a game-changer! I save so much time and the food is always fresh and delicious."
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold">Michael Chen</h4>
                    <p className="text-sm text-gray-500">Engineering</p>
                  </div>
                  <div className="flex items-center">
                    <Star className="text-yellow-400" size={20} />
                    <span className="ml-1 font-semibold">4.9</span>
                  </div>
                </div>
                <p className="text-gray-600">
                  "The QR code system is so convenient. I can grab my food quickly between classes."
                </p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold">Emily Rodriguez</h4>
                    <p className="text-sm text-gray-500">Business</p>
                  </div>
                  <div className="flex items-center">
                    <Star className="text-yellow-400" size={20} />
                    <span className="ml-1 font-semibold">5.0</span>
                  </div>
                </div>
                <p className="text-gray-600">
                  "The subscription plans are affordable and the variety of meals keeps me excited for lunch every day!"
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Feedback CTA */}
          <div className="text-center mt-12">
            <Dialog open={showFeedbackForm} onOpenChange={setShowFeedbackForm}>
              <DialogTrigger asChild>
                <Button variant="outline" className="bg-white hover:bg-gray-50 transition-colors duration-300">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Share Your Experience
                </Button>
              </DialogTrigger>
              <DialogContent 
                className="sm:max-w-[425px]"
                title="Order Details"
                description="Review your order information before proceeding"
              >
                <DialogHeader>
                  <DialogTitle>Order Details</DialogTitle>
                  <DialogDescription>
                    Review your order information before proceeding
                  </DialogDescription>
                </DialogHeader>
                <FeedbackForm onClose={() => setShowFeedbackForm(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-campus-green to-campus-orange py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Order Your First Meal?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-10">
            Join hundreds of satisfied students enjoying convenient, delicious meals delivered across campus.
          </p>
          <Link to="/menu">
            <Button size="lg" className="bg-white text-campus-green hover:bg-gray-100 px-8 py-6 text-lg transition-colors duration-300">
              Browse Menu
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h2 className="text-2xl font-bold mb-4">Campus<span className="text-campus-orange">Bite</span></h2>
              <p className="text-gray-400">Delicious food delivered on campus</p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link to="/menu" className="text-gray-400 hover:text-white transition-colors duration-300">Menu</Link></li>
                <li><Link to="/orders" className="text-gray-400 hover:text-white transition-colors duration-300">Orders</Link></li>
                <li><Link to="/subscription" className="text-gray-400 hover:text-white transition-colors duration-300">Subscription</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                {!currentUser && (
                  <li><Link to="/auth" className="text-gray-400 hover:text-white transition-colors duration-300">Sign In</Link></li>
                )}
                <li><Link to="/subscription" className="text-gray-400 hover:text-white transition-colors duration-300">Get Help</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors duration-300">Contact Us</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors duration-300">Privacy Policy</Link></li>
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors duration-300">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
            &copy; {new Date().getFullYear()} CampusBite Kitchen. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
