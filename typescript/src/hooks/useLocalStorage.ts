import { useState } from 'react'

type SetValue<T> = (newValue: T) => void;

export const useLocalStorage = <T>(key: string, initialValue: T): [T, SetValue<T>] => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const jsonValue = window.localStorage.getItem(key)
            return jsonValue ? JSON.parse(jsonValue) : initialValue;
        } catch (error) {
            console.error(`Failed to read key "${key}" from localStorage: `, error);
            return initialValue;
        }
    });

    const setValue = (value: T): void => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error(`Failed to set key "${key}" in localStorage: `, error);
        }
    };

    return [storedValue, setValue]
}
