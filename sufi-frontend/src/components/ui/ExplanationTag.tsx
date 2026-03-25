interface ExplanationTagProps {
  text: string;
}

export default function ExplanationTag({ text }: ExplanationTagProps) {
  return (
    <p className="text-xs text-white/40 italic leading-relaxed">
      <span className="text-primary/60 mr-1">↗</span>
      {text}
    </p>
  );
}
