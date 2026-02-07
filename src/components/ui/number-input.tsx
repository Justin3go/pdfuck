import * as React from "react"
import { cn } from "@/lib/utils"
import { Minus, Plus } from "lucide-react"
import { Button } from "./button"
import { Input } from "./input"

interface NumberInputProps extends Omit<React.ComponentProps<"input">, "onChange" | "value" | "type"> {
  value?: number
  min?: number
  max?: number
  step?: number
  onChange?: (value: number) => void
  showControls?: boolean
  fullWidth?: boolean
}

function NumberInput({
  className,
  value,
  min,
  max,
  step = 1,
  onChange,
  showControls = true,
  fullWidth = false,
  disabled,
  ...props
}: NumberInputProps) {
  const handleDecrement = () => {
    if (disabled) return
    const newValue = (value ?? 0) - step
    if (min !== undefined && newValue < min) return
    onChange?.(newValue)
  }

  const handleIncrement = () => {
    if (disabled) return
    const newValue = (value ?? 0) + step
    if (max !== undefined && newValue > max) return
    onChange?.(newValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    if (inputValue === "") {
      onChange?.(min ?? 0)
      return
    }

    const numValue = Number(inputValue)
    if (Number.isNaN(numValue)) return

    let clampedValue = numValue
    if (min !== undefined) clampedValue = Math.max(min, clampedValue)
    if (max !== undefined) clampedValue = Math.min(max, clampedValue)

    onChange?.(clampedValue)
  }

  const displayValue = value ?? ""

  return (
    <div className={cn("flex items-center gap-1", fullWidth && "w-full", className)}>
      {showControls && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 shrink-0"
          onClick={handleDecrement}
          disabled={disabled || (min !== undefined && (value ?? 0) <= min)}
        >
          <Minus className="size-3" />
        </Button>
      )}
      <Input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        step={step}
        value={displayValue}
        onChange={handleInputChange}
        disabled={disabled}
        className={cn(
          "text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
          fullWidth ? "flex-1" : showControls ? "w-20" : "w-full"
        )}
        {...props}
      />
      {showControls && (
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-8 shrink-0"
          onClick={handleIncrement}
          disabled={disabled || (max !== undefined && (value ?? 0) >= max)}
        >
          <Plus className="size-3" />
        </Button>
      )}
    </div>
  )
}

export { NumberInput }
export type { NumberInputProps }
