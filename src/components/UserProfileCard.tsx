
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";

interface UserProfileCardProps {
  username?: string;
  avatarUrl?: string;
}

const UserProfileCard = ({ username, avatarUrl }: UserProfileCardProps) => {
  const { user } = useAuth();
  
  // If no username is provided, use a default or extract from email
  const displayName = username || (user?.email ? user.email.split('@')[0] : 'User');
  
  // Get initials for avatar fallback
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div className="p-4 bg-secondary rounded-lg">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src={avatarUrl || "/placeholder.svg"} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-white">{displayName}</h3>
          <p className="text-sm text-gray-400">Trusted Trader</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;
