// @ts-ignore: react-native types may not be available in this build environment

import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

/** Use throughout the app instead of plain `useDispatch` */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/** Use throughout the app instead of plain `useSelector` */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;