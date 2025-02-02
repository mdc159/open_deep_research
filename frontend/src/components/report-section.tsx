const ReportSection = ({ section }: { section: Section }) => (
  <div className="prose max-w-none">
    <h2 className="text-xl font-semibold mb-4">{section.name}</h2>
    <div className="space-y-4">
      {section.content.split("\n\n").map((para, i) => (
        <p key={i} className="text-gray-600 leading-relaxed">
          {para}
        </p>
      ))}
    </div>
    {section.sources?.length > 0 && (
      <div className="mt-6 border-t pt-4">
        <h3 className="text-sm font-medium mb-2">Sources</h3>
        <ul className="space-y-1 text-sm text-gray-500">
          {section.sources.map((source, i) => (
            <li key={i}>
              <a href={source.url} target="_blank" rel="noopener noreferrer"
                className="hover:text-blue-600 transition-colors">
                {source.title}
              </a>
            </li>
          ))}
        </ul>
      </div>
    )}
  </div>
) 