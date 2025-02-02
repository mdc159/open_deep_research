const ModelSelector = () => {
  return (
    <Select
      value={config.plannerModel}
      onValueChange={(v) => updateConfig({ plannerModel: v })}
    >
      <SelectTrigger>
        <SelectValue placeholder="Planner Model" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="o3-mini">DeepSeek o3-mini</SelectItem>
        <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
      </SelectContent>
    </Select>
  )
} 