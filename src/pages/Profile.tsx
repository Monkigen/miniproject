import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, MapPin } from "lucide-react";

const Profile = () => {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={currentUser.photoURL || undefined} alt={currentUser.displayName || "User"} />
                <AvatarFallback className="text-lg">
                  {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{currentUser.displayName || "User"}</h2>
                <p className="text-gray-500">{currentUser.email}</p>
              </div>
            </div>

            {/* Profile Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-gray-500" />
                <span>{currentUser.email}</span>
              </div>
              {currentUser.phoneNumber && (
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <span>{currentUser.phoneNumber}</span>
                </div>
              )}
              {currentUser.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <span>{currentUser.address}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <Button variant="outline" className="flex-1">
                Edit Profile
              </Button>
              <Button variant="outline" className="flex-1">
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile; 