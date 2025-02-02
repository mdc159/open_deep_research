import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlannerModel, WriterModel } from "@/lib/config"

interface ModelConfigProps {
  plannerModel: PlannerModel
  writerModel: WriterModel
  onPlannerModelChange: (model: PlannerModel) => void
  onWriterModelChange: (model: WriterModel) => void
}

export function ModelConfig({
  plannerModel,
  writerModel,
  onPlannerModelChange,
  onWriterModelChange,
}: ModelConfigProps) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="planner-model">Planner Model</Label>
        <Select value={plannerModel} onValueChange={onPlannerModelChange}>
          <SelectTrigger id="planner-model">
            <SelectValue placeholder="Select planner model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="o1">O1</SelectItem>
            <SelectItem value="o1-mini">O1 Mini</SelectItem>
            <SelectItem value="o3-mini">O3 Mini</SelectItem>
            <SelectItem value="deepseek-reasoner">Deepseek Reasoner</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="writer-model">Writer Model</Label>
        <Select value={writerModel} onValueChange={onWriterModelChange}>
          <SelectTrigger id="writer-model">
            <SelectValue placeholder="Select writer model" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="o1">O1</SelectItem>
            <SelectItem value="o1-mini">O1 Mini</SelectItem>
            <SelectItem value="o3-mini">O3 Mini</SelectItem>
            <SelectItem value="deepseek-chat">Deepseek Chat</SelectItem>
            <SelectItem value="claude-3-sonnet-20240620">Claude 3 Sonnet</SelectItem>
            <SelectItem value="claude-3-opus-20240229">Claude 3 Opus</SelectItem>
            <SelectItem value="claude-3-haiku-20240307">Claude 3 Haiku</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
} 