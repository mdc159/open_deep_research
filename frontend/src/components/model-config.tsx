import { useConfig } from '../contexts/ConfigContext'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select'

export function ReasoningEffortSelect() {
  const { config, updateConfig } = useConfig()

  return (
    <Select
      value={config.reasoningEffort}
      onValueChange={(v) => updateConfig({ reasoningEffort: v })}
    >
      <SelectTrigger>
        <SelectValue placeholder="Reasoning Effort" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="low">Low (Fastest)</SelectItem>
        <SelectItem value="medium">Medium (Balanced)</SelectItem>
        <SelectItem value="high">High (Most Thorough)</SelectItem>
      </SelectContent>
    </Select>
  )
} 