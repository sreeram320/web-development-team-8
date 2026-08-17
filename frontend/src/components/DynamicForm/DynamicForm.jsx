import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";

function DynamicForm({ fields, initialValues }) {
const {
  register,
  control,
  handleSubmit,
  reset,
  formState: { errors },
} = useForm({
  defaultValues: initialValues || {},
});
useEffect(() => {
  if (initialValues) {
    reset(initialValues);
  }
}, [initialValues, reset]);
  const formValues = useWatch({ control });

  const shouldShowField = (field) => {
    if (!field.showIf) {
      return true;
    }

    return Object.entries(field.showIf).every(
      ([fieldName, expectedValue]) =>
        formValues[fieldName] === expectedValue
    );
  };

  const onSubmit = (data) => {
    console.log("Form submitted:", data);
  };

  const renderField = (field) => {
    switch (field.type) {
      case "text":
        return (
          <input
            type="text"
            {...register(field.name, {
              required: field.required
                ? `${field.label} is required`
                : false,
            })}
            placeholder={field.placeholder || ""}
          />
        );

      case "textarea":
        return (
          <textarea
            {...register(field.name, {
              required: field.required
                ? `${field.label} is required`
                : false,
            })}
            placeholder={field.placeholder || ""}
            rows={4}
          />
        );

      case "select":
        return (
          <select
            {...register(field.name, {
              required: field.required
                ? `${field.label} is required`
                : false,
            })}
            defaultValue=""
          >
            <option value="" disabled>
              Select an option
            </option>

            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
        case "checkbox":
  return (
    <label>
      <input
        type="checkbox"
        {...register(field.name, {
          required: field.required
            ? `${field.label} is required`
            : false,
        })}
      />
      {field.label}
    </label>
  );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {fields.map((field) => {
        if (!shouldShowField(field)) {
          return null;
        }

       return (
  <div key={field.name}>
    {field.type === "checkbox" ? (
      renderField(field)
    ) : (
      <>
        <label>{field.label}</label>
        {renderField(field)}
      </>
    )}

    {errors[field.name] && (
      <p>{errors[field.name].message}</p>
    )}
  </div>
);
      })}

      <button type="submit">Submit Form</button>
    </form>
  );
}

export default DynamicForm;