
export interface Blessing {
  id: number;
  text: string;
}

export type CakeState = 'idle' | 'lit' | 'wish' | 'blown';

export interface Photo {
  url: string;
  title: string;
}
