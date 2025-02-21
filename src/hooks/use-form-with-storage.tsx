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

  const { handleSubmit, getValues, reset, watch } = methods;

  const storage = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return storageType === 'local' ? window.localStorage : window.sessionStorage;
  }, [storageType]);

  const saveToStorage = useCallback(() => {
    if (!storage) return;
    try {
      storage.setItem(storageKey, JSON.stringify(getValues()));
    } catch (error) {
      console.error('Failed to save form data to storage:', error);
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
    if (!storage) return;

    try {
      const storedData = storage.getItem(storageKey);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        reset(parsedData);
      }
    } catch (error) {
      console.warn('Invalid storage data. Resetting to defaults.', error);
      clearStorage();
    }
  }, [storage, storageKey, reset, clearStorage]);

  const isMounted = useRef(false);

  useEffect(() => {
    const subscription = watch(() => {
      if (isMounted.current) {
        saveToStorage();
      }
    });

    isMounted.current = true;
    return () => subscription.unsubscribe(); // Cleanup on unmount
  }, [watch, saveToStorage]);

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
