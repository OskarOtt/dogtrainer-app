export interface DogTitle {
  id: string;
  dogId: string;
  title: string;
  dateEarned: string | null;
  createdAt: string;
}

export interface DogTitlePayload {
  title: string;
  dateEarned?: string | null;
}
