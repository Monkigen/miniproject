import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Utensils, 
  Clock, 
  Truck, 
  Shield, 
  Star,
  ArrowRight,
  ChevronRight,
  CheckCircle2
} from "lucide-react";

const Home = () => {
  const features = [
    {
      icon: Utensils,
      title: "Campus Dining Made Easy",
      description: "Order your favorite meals from campus restaurants with just a few taps."
    },
    {
      icon: Clock,
      title: "Quick Delivery",
      description: "Get your food delivered to your location within minutes."
    },
    {
      icon: Truck,
      title: "Campus-Wide Delivery",
      description: "We deliver to all major locations across the campus."
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Safe and secure payment options with our token system."
    }
  ];

  const benefits = [
    "No delivery fees for campus locations",
    "Real-time order tracking",
    "Secure token-based payments",
    "24/7 customer support",
    "Special student discounts",
    "Eco-friendly packaging"
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Student",
      comment: "Campus Kitchen has made my life so much easier! The delivery is always on time and the food is amazing.",
      rating: 5,
      image: "/testimonial-1.jpg"
    },
    {
      name: "Mike Chen",
      role: "Faculty",
      comment: "As a busy professor, I love being able to order lunch between classes. The service is excellent!",
      rating: 5,
      image: "/testimonial-2.jpg"
    },
    {
      name: "Emily Davis",
      role: "Student",
      comment: "The token system is brilliant! It's so convenient to have my meals delivered right to my dorm.",
      rating: 5,
      image: "/testimonial-3.jpg"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-campus-green to-campus-green/80 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Campus Food Delivery Made Simple
            </h1>
            <p className="text-xl mb-8">
              Order from your favorite campus restaurants and get your food delivered right to your location.
            </p>
            <Link to="/restaurants">
              <Button size="lg" className="bg-white text-campus-green hover:bg-white/90">
                Order Now <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Campus Kitchen?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center p-6">
                <feature.icon className="h-12 w-12 mx-auto mb-4 text-campus-green" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Benefits of Using Campus Kitchen</h2>
            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle2 className="h-6 w-6 text-campus-green flex-shrink-0" />
                  <span className="text-lg">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6">
                <div className="flex items-center mb-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-semibold">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">{testimonial.comment}</p>
                <div className="flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-campus-green text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8">Join thousands of students and faculty members using Campus Kitchen.</p>
          <Link to="/auth">
            <Button size="lg" className="bg-white text-campus-green hover:bg-white/90">
              Sign Up Now <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home; 