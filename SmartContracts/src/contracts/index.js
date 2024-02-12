const hre = require("hardhat");

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
        for (const log of receipt.logs) {
            const events = [];
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
            return { ok: true, view: false, events }
        }
        return { ok: true, view: false, events: [] }
    }
    catch (e) {
        //console.log(e);
        return { ok: false, message: e.shortMessage || e.message };
    }

}

module.exports = { Contracts }