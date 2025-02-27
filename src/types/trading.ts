
export type GameType = 'diablo2_resurrected' | 'diablo4';
export type PlatformType = 'pc' | 'playstation' | 'xbox' | 'nintendo_switch';
export type GameModeType = 'softcore' | 'hardcore' | 'eternal' | 'seasonal';
export type LadderType = 'ladder' | 'non_ladder' | 'not_applicable';
export type PaymentType = 'currency' | 'items';

export interface Trade {
  id: string;
  user_id: string;
  title: string;
  description: string;
  game: GameType;
  platform: PlatformType;
  game_mode: GameModeType;
  ladder_status: LadderType;
  price: number | null;
  payment_type: PaymentType;
  payment_items: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
  };
}

export interface TradeOffer {
  id: string;
  trade_id: string;
  user_id: string;
  offer_details: string;
  status: string;
  created_at: string;
  updated_at: string;
  price_offered?: number | null;
  items_offered?: string | null;
  payment_type?: 'currency' | 'items';
  profiles?: {
    username: string;
  };
}

export interface PriceCheck {
  id: string;
  user_id: string;
  item_name: string;
  game: GameType;
  platform: PlatformType;
  game_mode: GameModeType;
  ladder_status: LadderType;
  responses_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
  };
}
