interface Props { words: [string, number][]; }

export default function WordCloud({ words }: Props) {
  const maxVal = Math.max(...words.map(w => w[1]), 1);
  return (
    <div className="flex flex-wrap gap-2 p-4 justify-center items-center min-h-[200px]">
      {words.map(([word, weight]) => {
        const size = 12 + (weight / maxVal) * 24;
        const opacity = 0.4 + (weight / maxVal) * 0.6;
        return <span key={word} style={{ fontSize: `${size}px`, opacity, color: `hsl(${Math.random() * 60 + 200}, 60%, 40%)` }} className="font-medium px-1">{word}</span>;
      })}
    </div>
  );
}
