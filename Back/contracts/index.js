const Contracts = {};

/***
 * weiSent BigInt
 */
Contracts.execute = async (contract, functionName, args, weiSent, wallet) => {
    try {
        const connectedContract = await contract.connect(wallet);
        const payload = { value: weiSent } || undefined;
        const response = payload ? await connectedContract[functionName](...args, payload) : await connectedContract[functionName](...args)

        if (!response.wait)
            return { ok: true, view: true, result: response };

        const receipt = await response.wait();
        const events = [];
        for (const log of receipt.logs) {
            try {
                const parsedLog = contract.interface.parseLog(log);
                if (!parsedLog?.name) {
                    continue;
                }
                events.push({ name: parsedLog.name, args: parsedLog.args })
            }
            catch (e) {
                //console.log("Error parsing log")
                //console.log(e);
            }
        }
        return { ok: true, view: false, events }
    }
    catch (e) {
<<<<<<< HEAD
        console.log("sderes")
        console.log(e);
        return { ok: false, message: e.shortMessage || e.message };
=======
        const lines = [];
        for (let row of e.stackTrace) {
            if (row?.sourceReference?.line)
                lines.push(row.sourceReference.line);
        }
        return { ok: false, message: e.shortMessage || e.message, lines };
>>>>>>> 46e6b23af66d952a30bdb6039f75a556baaed9a6
    }

}

module.exports = { Contracts }