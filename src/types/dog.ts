export type DogSex = 'MALE' | 'FEMALE';

export type DogMediaType = 'IMAGE' | 'VIDEO';

export interface Dog {
  id: string;
  name: string;
  breed: string | null;
  birthDate: string | null;
  sex: DogSex | null;
  weight: number | null;
  mediaUrl: string | null;
  mediaType: DogMediaType | null;
  createdAt: string;
}

export interface DogPayload {
  name: string;
  breed?: string | null;
  birthDate?: string | null;
  sex?: DogSex | null;
  weight?: number | null;
}
