
import { GameType, PlatformType, GameModeType, LadderType } from "@/types/trading";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GameSettingsProps {
  game: GameType;
  setGame: (value: GameType) => void;
  platform: PlatformType;
  setPlatform: (value: PlatformType) => void;
  gameMode: GameModeType;
  setGameMode: (value: GameModeType) => void;
  ladderStatus: LadderType;
  setLadderStatus: (value: LadderType) => void;
}

const GameSettings = ({
  game,
  setGame,
  platform,
  setPlatform,
  gameMode,
  setGameMode,
  ladderStatus,
  setLadderStatus,
}: GameSettingsProps) => {
  const renderGameModes = () => {
    return (
      <>
        <SelectItem value="softcore">Softcore</SelectItem>
        <SelectItem value="hardcore">Hardcore</SelectItem>
      </>
    );
  };

  const renderSecondaryOptions = () => {
    if (game === 'diablo2_resurrected') {
      return (
        <div>
          <Label>Ladder Status</Label>
          <Select value={ladderStatus} onValueChange={setLadderStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select ladder status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ladder">Ladder</SelectItem>
              <SelectItem value="non_ladder">Non-Ladder</SelectItem>
            </SelectContent>
          </Select>
        </div>
      );
    }
    
    return (
      <div>
        <Label>Season Type</Label>
        <Select value={ladderStatus} onValueChange={setLadderStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Select season type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ladder">Seasonal</SelectItem>
            <SelectItem value="non_ladder">Eternal</SelectItem>
          </SelectContent>
        </Select>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label>Game</Label>
        <Select value={game} onValueChange={(value: GameType) => setGame(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select game" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="diablo4">Diablo 4</SelectItem>
            <SelectItem value="diablo2_resurrected">Diablo 2: Resurrected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Platform</Label>
        <Select value={platform} onValueChange={(value: PlatformType) => setPlatform(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pc">PC</SelectItem>
            <SelectItem value="playstation">PlayStation</SelectItem>
            <SelectItem value="xbox">Xbox</SelectItem>
            <SelectItem value="nintendo_switch">Nintendo Switch</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Game Mode</Label>
        <Select value={gameMode} onValueChange={(value: GameModeType) => setGameMode(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select game mode" />
          </SelectTrigger>
          <SelectContent>
            {renderGameModes()}
          </SelectContent>
        </Select>
      </div>
      {renderSecondaryOptions()}
    </div>
  );
};

export default GameSettings;
