/**
 * If pause in async function is needed.
 * @param ms
 * @return {Promise.Promise}
 */
export const sleep = async (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
