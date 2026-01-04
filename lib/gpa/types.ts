export interface FormField {
  id: string
  label: string
  description: string
  max: number
}

export interface Course {
  id: string
  name: string
  degree: "data-science" | "electronic-systems"
  level: "foundation" | "diploma" | "degree"
  formula: string
  formFields: FormField[]
}
