function highlightMatch(text, query) {
  if (!query.trim()) return <span>{text}</span>;

  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return <span>{text}</span>;

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);

  return (
    <span>
      {before}
      <span className="highlight">{match}</span>
      {after}
    </span>
  );
}

export default highlightMatch;