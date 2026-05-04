export type SnsType = "X" | "Instagram" | "Threads";

export type TargetReaction =
  | "いいね"
  | "保存"
  | "コメント"
  | "フォロー";

export type Genre =
  | "副業"
  | "育児"
  | "料理"
  | "美容"
  | "ビジネス"
  | "趣味"
  | "その他";

export type DiagnoseFormPayload = {
  postText: string;
  sns: SnsType;
  targetReaction: TargetReaction;
  genre: Genre;
  customGenre?: string;
};

export type DiagnoseResult = {
  score: number;
  goodPoints: string[];
  improvements: string[];
  rewrite: string;
  hashtags: string[];
};
