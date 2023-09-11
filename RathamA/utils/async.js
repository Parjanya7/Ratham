//Function to Resolve Promise which provides result or error per promise for granual level error handling
/**
 *
 *
 * @param {*} promise
 * @return {*} 
 */
const resolvePromise = async (promise) => {
	try {
		const result = await promise;
		return [null, result];
	} catch (error) {
		return [error, null];
	}
};

module.exports = { resolvePromise };
