import type { LoaderFunctionArgs } from '@remix-run/node';
import path from 'path';

export const loader = async ({request}: LoaderFunctionArgs) => {
    // From the Node docs on path.resolve(): 
    // If no path segments are passed, path.resolve() will return
    // the absolute path of the current working directory.
    const projectRoot = path.resolve()
    const jsonData = {
       workspace: {
           root: projectRoot,
           uuid: '9f7bb3a3-bd3a-4de5-bde5-575ad36b64f3',
       }
    };
    return Response.json(jsonData);
};
