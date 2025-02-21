import { DefaultValues } from "react-hook-form";
import {
  z,
  ZodDefault,
  ZodNullable,
  ZodObject,
  ZodOptional,
  ZodTypeAny,
  ZodUndefined,
} from "zod";

function getDefaultValuesOfZodSchema<T extends ZodTypeAny>(
  schema: T
): DefaultValues<z.infer<T>> {
  if (schema instanceof ZodObject) {
    const shape = schema.shape; // Access the shape property directly
    const defaultValues: Record<string, unknown> = {};

    for (const key in shape) {
      if (Object.prototype.hasOwnProperty.call(shape, key)) {
        defaultValues[key] = getDefaultValuesOfZodSchema(
          shape[key] as ZodTypeAny
        );
      }
    }
    return defaultValues as z.infer<T>;
  }

  if (schema instanceof ZodDefault) {
    return schema._def.defaultValue() as z.infer<T>; // Type assertion here
  }

  if (schema instanceof ZodNullable) {
    return null as z.infer<T>; // Type assertion
  }

  if (schema instanceof ZodOptional || schema instanceof ZodUndefined) {
    return undefined as z.infer<T>; // Type assertion
  }

  // Handle other primitive types with type assertions
  if (schema instanceof z.ZodString) return "" as z.infer<T>;
  if (schema instanceof z.ZodNumber) return 0 as z.infer<T>;
  if (schema instanceof z.ZodBoolean) return false as z.infer<T>;
  if (schema instanceof z.ZodArray) return [] as z.infer<T>;
  if (schema instanceof z.ZodDate) return new Date() as z.infer<T>;
  if (schema instanceof z.ZodEnum) return schema.options[0] as z.infer<T>;
  if (schema instanceof z.ZodRecord) return {} as z.infer<T>;

  // Important: Handle ZodEffects (e.g., .refine, .transform)
  if (schema instanceof z.ZodEffects) {
    return getDefaultValuesOfZodSchema(schema.innerType()) as z.infer<T>;
  }

  // Fallback for unsupported types (or throw an error in strict mode)
  console.warn(
    `getDefaultValuesOfZodSchema: Unsupported type ${schema.constructor.name}`
  );
  return undefined as z.infer<T>; // Or throw new Error(...) in strict mode
}

export default getDefaultValuesOfZodSchema;
