export type DogSex = 'MALE' | 'FEMALE';

export interface Dog {
  id: string;
  name: string;
  breed: string | null;
  birthDate: string | null;
  sex: DogSex | null;
  weight: number | null;
  imageUrl: string | null;
  createdAt: string;
}

export interface DogPayload {
  name: string;
  breed?: string | null;
  birthDate?: string | null;
  sex?: DogSex | null;
  weight?: number | null;
  imageUrl?: string | null;
}
