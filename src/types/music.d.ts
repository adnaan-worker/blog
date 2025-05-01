declare module '*.json' {
  const value: Array<{
    id: number;
    songId: string;
    title: string;
    artist: string;
    url: string;
    pic: string;
    lrc: string;
    lyrics: Array<{
      time: number;
      text: string;
    }>;
  }>;
  export default value;
} 