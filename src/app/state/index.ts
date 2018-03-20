import { Action } from 'typescript-fsa';

import { create, createRootThunks, Dispatch, IApi, IItem } from '@creditiq/console-state';
import { ISearchFilter } from '@creditiq/search';

export const api: IApi = create(__MOCK_DATA__);

export const thunks = createRootThunks(api, (s) => s);

export { rootSelectors } from '@creditiq/console-state';

export { rootReducer } from '@creditiq/console-state';
