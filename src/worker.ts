import async from 'async';

// Function to run multiple workers in parallel
export async function runParallelScrapers(workers: string[], workerCount: number, callback: Function): Promise<(string | null)[]> {
    return new Promise((resolve, reject) => {
        async.mapLimit(
            workers,
            workerCount,
            async (worker: string, cb) => {
                try {
                    callback(worker);
                    // return result;
                } catch (error) {
                    console.error(`Error scraping ${worker}:`, error);
                    return null;
                }
            },
            (err: any, results: any) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results as (string | null)[]);
                }
            }
        );
    });
}

