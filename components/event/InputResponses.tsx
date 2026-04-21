import { Control, useFieldArray } from "react-hook-form";
import { UserFormData } from "./ResponsesForm";

interface InputResponsesProps {
  control: Control<UserFormData>;
}

function InputResponses({ control } :InputResponsesProps) {
  const { fields, update } = useFieldArray({
    control,
    name: "responses"
  })
  
  return (
    <div>InputResponses</div>
  )
}

export default InputResponses