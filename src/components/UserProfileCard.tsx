
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const UserProfileCard = () => {
  return (
    <div className="p-4 bg-secondary rounded-lg">
      <div className="flex items-center gap-4">
        <Avatar>
          <AvatarImage src="/placeholder.svg" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-white">Username</h3>
          <p className="text-sm text-gray-400">Trusted Trader</p>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;
