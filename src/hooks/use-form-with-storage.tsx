import getDefaultValuesOfZodSchema from '@/functions/get-default-values-of-zod-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';
import { ZodSchema } from 'zod';

type StorageType = 'local' | 'session';

function useFormWithStorage<T extends FieldValues>(
  formSchema: ZodSchema<T>,
  storageKey: string,
  callback: (data: T) => Promise<void> | void,
  storageType: StorageType = 'session',
) {
  const defaultValues = useMemo(() => getDefaultValuesOfZodSchema(formSchema), [formSchema]);

  const methods = useForm<T>({
    defaultValues,
    resolver: zodResolver(formSchema),
  });

  const { handleSubmit, getValues, reset, watch } = methods; // Include watch

  const storage = useMemo(() => {
    return typeof window !== 'undefined'
      ? storageType === 'local'
        ? window.localStorage
        : window.sessionStorage
      : null;
  }, [storageType]);

  const saveToStorage = useCallback(() => {
    if (storage) { // Check if storage is available
       storage.setItem(storageKey, JSON.stringify(getValues()));
    }
  }, [getValues, storage, storageKey]);

  const clearStorage = useCallback(() => {
    storage?.removeItem(storageKey);
  }, [storage, storageKey]);

  const resetValues = useCallback(() => {
    reset(defaultValues);
    clearStorage();
  }, [reset, clearStorage, defaultValues]);

  useEffect(() => {
    if (typeof window !== 'undefined') { // Check window
      try {
        const storedData = storage?.getItem(storageKey);
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          reset(parsedData); // Directly reset with parsed data
        }
      } catch (error) {
        console.warn('Invalid storage data. Resetting to defaults.', error);
        clearStorage();
      }
    }
  }, [storage, storageKey, reset, clearStorage]);

  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current) {
      saveToStorage();
    } else {
      isMounted.current = true;
    }
  }, [watch, saveToStorage]); // Watch for changes

  return {
    methods,
    ...methods,
    resetValues,
    clearStorage,
    FormProvider,
    onSubmit: handleSubmit(callback),
  };
}

export default useFormWithStorage;